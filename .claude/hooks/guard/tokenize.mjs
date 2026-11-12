// Splits a command line into simple commands ("segments") for the guard rules.
// It understands quoting, escapes, control operators, redirections, heredocs
// and nested commands well enough for a guardrail. It is not a full parser.

const SYNTAX = Object.freeze({
  bash: {
    escape: '\\',
    doubleQuoteEscapes: 'limited',
    singleQuotes: true,
    doubledQuotes: false,
    backticks: true,
    heredocs: true,
    hereStrings: false,
    comments: true,
    callOperator: false,
    processSubstitution: true,
  },
  powershell: {
    escape: '`',
    doubleQuoteEscapes: 'all',
    singleQuotes: true,
    doubledQuotes: true,
    backticks: false,
    heredocs: false,
    hereStrings: true,
    comments: true,
    callOperator: true,
    processSubstitution: false,
  },
  cmd: {
    escape: '^',
    doubleQuoteEscapes: 'none',
    singleQuotes: false,
    doubledQuotes: false,
    backticks: false,
    heredocs: false,
    hereStrings: false,
    comments: false,
    callOperator: false,
    processSubstitution: false,
  },
});

const CONTROL_OPERATORS = ['&&', '||', ';;', '|&', ';', '|', '&'];
const BASH_DOUBLE_QUOTE_ESCAPES = '"\\$`\n';
const HEREDOC_DELIMITER_END = /[\s;|&<>()]/;

/**
 * @param {string} input
 * @param {'bash' | 'powershell' | 'cmd'} shell
 * @returns {{ segments: Array<{ words: string[], nested: string[], raw: string, connector: string | null }> }}
 */
export function tokenize(input, shell = 'bash') {
  const syntax = SYNTAX[shell] ?? SYNTAX.bash;
  const builder = createSegmentBuilder(input);
  let index = 0;
  while (index < input.length) {
    index = readNext(input, index, syntax, builder);
  }
  builder.finishSegment(null, input.length, input.length);
  return { segments: builder.segments };
}

function readNext(input, index, syntax, builder) {
  const char = input[index];
  const next = input[index + 1];
  if (char === '\n') return readNewline(input, index, builder);
  if (char === ' ' || char === '\t' || char === '\r') {
    builder.finishWord();
    return index + 1;
  }
  if (char === syntax.escape) return readEscape(input, index, builder);
  if (char === "'" && syntax.singleQuotes) {
    const { text, end } = readSingleQuoted(input, index + 1, syntax);
    builder.append(text);
    return end + 1;
  }
  if (char === '"') {
    const { text, nested, end } = readDoubleQuoted(input, index + 1, syntax);
    builder.append(text);
    builder.addNested(...nested);
    return end + 1;
  }
  if (syntax.hereStrings && char === '@' && !builder.inWord && (next === "'" || next === '"')) {
    const end = readHereString(input, index, syntax, builder);
    if (end !== null) return end;
  }
  if (syntax.comments && char === '#' && !builder.inWord) return indexOfOrEnd(input, '\n', index);
  return readStructure(input, index, syntax, builder);
}

function readStructure(input, index, syntax, builder) {
  const char = input[index];
  const next = input[index + 1];
  if (char === '$' && next === '(') return readGroup(input, index, 2, '(', ')', syntax, builder);
  if (char === '`' && syntax.backticks) return readBackticks(input, index, builder);
  if (syntax.processSubstitution && (char === '<' || char === '>') && next === '(' && !builder.inWord) {
    return readGroup(input, index, 2, '(', ')', syntax, builder);
  }
  if ((char === '(' || char === '{') && !builder.inWord) {
    return readGroup(input, index, 1, char, char === '(' ? ')' : '}', syntax, builder);
  }
  if (char === '>' || char === '<') return readRedirection(input, index, syntax, builder);
  if (char === '&' && next === '>' && !syntax.callOperator) {
    builder.finishWord();
    return readRedirection(input, index + 1, syntax, builder);
  }
  const operator = CONTROL_OPERATORS.find((candidate) => input.startsWith(candidate, index));
  if (operator) return readOperator(index, operator, syntax, builder);
  builder.append(char);
  return index + 1;
}

function readNewline(input, index, builder) {
  const resume = skipHeredocBodies(input, index + 1, builder.takeHeredocs());
  builder.finishSegment('\n', index, resume);
  return resume;
}

function readEscape(input, index, builder) {
  const next = input[index + 1];
  if (next === '\n') return index + 2;
  if (next === '\r' && input[index + 2] === '\n') return index + 3;
  if (next !== undefined) builder.append(next);
  return index + 2;
}

function readOperator(index, operator, syntax, builder) {
  if (operator === '&' && syntax.callOperator) {
    builder.finishWord();
    builder.append('&');
    builder.finishWord();
    return index + 1;
  }
  builder.finishSegment(operator, index, index + operator.length);
  return index + operator.length;
}

function readGroup(input, index, openLength, open, close, syntax, builder) {
  const end = findClosing(input, index + openLength, open, close, syntax);
  builder.addNested(input.slice(index + openLength, end));
  builder.append(input.slice(index, end + 1));
  return end + 1;
}

function readBackticks(input, index, builder) {
  const end = indexOfOrEnd(input, '`', index + 1);
  builder.addNested(input.slice(index + 1, end));
  builder.append(input.slice(index, end + 1));
  return end + 1;
}

function readRedirection(input, index, syntax, builder) {
  builder.finishRedirectedWord();
  if (input.startsWith('<<<', index)) {
    builder.dropNextWord();
    return index + 3;
  }
  if (syntax.heredocs && input.startsWith('<<', index)) return readHeredocStart(input, index, builder);
  let end = index + 1;
  if (input[end] === '>' || input[end] === '|') end += 1;
  if (input[end] === '&') {
    end += 1;
    if (/[\d-]/.test(input[end] ?? '')) {
      while (/[\d-]/.test(input[end] ?? '')) end += 1;
      return end;
    }
  }
  builder.dropNextWord();
  return end;
}

function readHeredocStart(input, index, builder) {
  const stripTabs = input[index + 2] === '-';
  let cursor = index + (stripTabs ? 3 : 2);
  while (input[cursor] === ' ' || input[cursor] === '\t') cursor += 1;
  let delimiter = '';
  while (cursor < input.length && !HEREDOC_DELIMITER_END.test(input[cursor])) {
    const char = input[cursor];
    if (char === "'" || char === '"') {
      const close = indexOfOrEnd(input, char, cursor + 1);
      delimiter += input.slice(cursor + 1, close);
      cursor = close + 1;
    } else if (char === '\\') {
      delimiter += input[cursor + 1] ?? '';
      cursor += 2;
    } else {
      delimiter += char;
      cursor += 1;
    }
  }
  builder.addHeredoc({ delimiter, stripTabs });
  return cursor;
}

function skipHeredocBodies(input, start, heredocs) {
  let cursor = start;
  for (const { delimiter, stripTabs } of heredocs) {
    while (cursor < input.length) {
      const lineEnd = indexOfOrEnd(input, '\n', cursor);
      const rawLine = input.slice(cursor, lineEnd).replace(/\r$/, '');
      const line = stripTabs ? rawLine.replace(/^\t+/, '') : rawLine;
      cursor = Math.min(lineEnd + 1, input.length);
      if (line === delimiter) break;
    }
  }
  return cursor;
}

function readHereString(input, index, syntax, builder) {
  const quote = input[index + 1];
  const lineEnd = input.indexOf('\n', index + 2);
  if (lineEnd === -1 || input.slice(index + 2, lineEnd).trim() !== '') return null;
  const terminator = `\n${quote}@`;
  const close = input.indexOf(terminator, lineEnd);
  const bodyEnd = close === -1 ? input.length : close;
  const body = input.slice(lineEnd + 1, bodyEnd).replace(/\r$/, '');
  if (quote === '"') builder.addNested(...findSubexpressions(body, syntax));
  builder.append(body);
  return close === -1 ? input.length : close + terminator.length;
}

function readSingleQuoted(input, start, syntax) {
  let text = '';
  let index = start;
  while (index < input.length) {
    if (input[index] === "'") {
      if (!syntax.doubledQuotes || input[index + 1] !== "'") return { text, end: index };
      text += "'";
      index += 2;
    } else {
      text += input[index];
      index += 1;
    }
  }
  return { text, end: input.length };
}

function readDoubleQuoted(input, start, syntax) {
  let text = '';
  const nested = [];
  let index = start;
  while (index < input.length) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"' && syntax.doubledQuotes && next === '"') {
      text += '"';
      index += 2;
    } else if (char === '"') {
      return { text, nested, end: index };
    } else if (char === syntax.escape && escapesInDoubleQuotes(syntax, next)) {
      text += next === '\n' ? '' : next;
      index += 2;
    } else if ((char === '$' && next === '(') || (char === '`' && syntax.backticks)) {
      const end = char === '$' ? findClosing(input, index + 2, '(', ')', syntax) : indexOfOrEnd(input, '`', index + 1);
      nested.push(input.slice(index + (char === '$' ? 2 : 1), end));
      text += input.slice(index, end + 1);
      index = end + 1;
    } else {
      text += char;
      index += 1;
    }
  }
  return { text, nested, end: input.length };
}

function escapesInDoubleQuotes(syntax, next) {
  if (next === undefined) return false;
  if (syntax.doubleQuoteEscapes === 'all') return true;
  if (syntax.doubleQuoteEscapes === 'limited') return BASH_DOUBLE_QUOTE_ESCAPES.includes(next);
  return false;
}

function findClosing(input, start, open, close, syntax) {
  let depth = 1;
  let index = start;
  while (index < input.length) {
    const char = input[index];
    if (char === syntax.escape) {
      index += 2;
    } else if (char === "'" && syntax.singleQuotes) {
      index = readSingleQuoted(input, index + 1, syntax).end + 1;
    } else if (char === '"') {
      index = readDoubleQuoted(input, index + 1, syntax).end + 1;
    } else {
      if (char === open) depth += 1;
      if (char === close) depth -= 1;
      if (depth === 0) return index;
      index += 1;
    }
  }
  return input.length;
}

function findSubexpressions(text, syntax) {
  const found = [];
  let cursor = text.indexOf('$(');
  while (cursor !== -1) {
    const end = findClosing(text, cursor + 2, '(', ')', syntax);
    found.push(text.slice(cursor + 2, end));
    cursor = text.indexOf('$(', end);
  }
  return found;
}

function indexOfOrEnd(input, search, from) {
  const found = input.indexOf(search, from);
  return found === -1 ? input.length : found;
}

function createSegmentBuilder(input) {
  const segments = [];
  let heredocs = [];
  let current = { words: [], nested: [], start: 0 };
  let word = '';
  let inWord = false;
  let dropNext = false;

  const finishWord = () => {
    if (inWord && dropNext) dropNext = false;
    else if (inWord) current.words.push(word);
    word = '';
    inWord = false;
  };

  return {
    segments,
    get inWord() {
      return inWord;
    },
    append(text) {
      word += text;
      inWord = true;
    },
    finishWord,
    // A pure number ("2>") or PowerShell's "*>" names a stream, not an argument.
    finishRedirectedWord() {
      if (/^(\d+|\*)$/.test(word)) {
        word = '';
        inWord = false;
      } else {
        finishWord();
      }
    },
    dropNextWord() {
      dropNext = true;
    },
    addNested(...scripts) {
      current.nested.push(...scripts);
    },
    addHeredoc(heredoc) {
      heredocs = [...heredocs, heredoc];
    },
    takeHeredocs() {
      const taken = heredocs;
      heredocs = [];
      return taken;
    },
    finishSegment(connector, end, nextStart) {
      finishWord();
      dropNext = false;
      if (current.words.length > 0 || current.nested.length > 0) {
        segments.push({ words: current.words, nested: current.nested, raw: input.slice(current.start, end), connector });
      }
      current = { words: [], nested: [], start: nextStart };
    },
  };
}

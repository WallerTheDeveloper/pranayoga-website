import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from './tokenize.mjs';

const wordsOf = (command, shell) => tokenize(command, shell).segments.map((segment) => segment.words);
const nestedOf = (command, shell) => tokenize(command, shell).segments.flatMap((segment) => segment.nested);

test('splits commands on control operators', () => {
  assert.deepEqual(wordsOf('a b && c; d || e & f'), [['a', 'b'], ['c'], ['d'], ['e'], ['f']]);
});

test('records the operator that ends each segment', () => {
  const connectors = tokenize('a | b |& c').segments.map((segment) => segment.connector);
  assert.deepEqual(connectors, ['|', '|&', null]);
});

test('keeps the raw text of each segment', () => {
  const raw = tokenize('curl x | sh').segments.map((segment) => segment.raw.trim());
  assert.deepEqual(raw, ['curl x', 'sh']);
});

test('keeps quoted text as one word', () => {
  assert.deepEqual(wordsOf(`echo "a b" 'c d' e"f g"`), [['echo', 'a b', 'c d', 'ef g']]);
});

test('applies bash escapes outside and inside double quotes', () => {
  assert.deepEqual(wordsOf('echo a\\ b "c\\"d" "C:\\x"'), [['echo', 'a b', 'c"d', 'C:\\x']]);
});

test('uses the backtick as the PowerShell escape and keeps backslashes', () => {
  assert.deepEqual(wordsOf('Remove-Item C:\\x\\y a` b', 'powershell'), [['Remove-Item', 'C:\\x\\y', 'a b']]);
});

test('reads doubled quotes inside PowerShell strings', () => {
  assert.deepEqual(wordsOf(`echo 'it''s' "say ""hi"""`, 'powershell'), [['echo', "it's", 'say "hi"']]);
});

test('treats single quotes as literal characters in cmd', () => {
  assert.deepEqual(wordsOf(`echo it's "a b"`, 'cmd'), [['echo', "it's", 'a b']]);
});

test('drops redirections and their targets', () => {
  assert.deepEqual(wordsOf('git diff > out.txt 2>&1'), [['git', 'diff']]);
  assert.deepEqual(wordsOf('ls 2>/dev/null >>log <input'), [['ls']]);
  assert.deepEqual(wordsOf('ls &> all.log'), [['ls']]);
  assert.deepEqual(wordsOf('Get-Item x 2>$null *> all.log', 'powershell'), [['Get-Item', 'x']]);
});

test('skips heredoc bodies', () => {
  const command = "cat <<'EOF' > notes.txt\nrm -rf /\ngit push\nEOF\necho done";
  assert.deepEqual(wordsOf(command), [['cat'], ['echo', 'done']]);
});

test('skips tab-indented heredoc bodies', () => {
  const command = 'cat <<-END\n\tgit push\n\tEND\necho done';
  assert.deepEqual(wordsOf(command), [['cat'], ['echo', 'done']]);
});

test('skips here-strings in bash', () => {
  assert.deepEqual(wordsOf('grep x <<< "git push"'), [['grep', 'x']]);
});

test('collects command substitutions as nested scripts', () => {
  assert.deepEqual(nestedOf('echo $(git push) `ls -la` "$(pwd)"'), ['git push', 'ls -la', 'pwd']);
});

test('collects subshells, brace groups and process substitutions', () => {
  assert.deepEqual(nestedOf('(cd / && rm -rf x)'), ['cd / && rm -rf x']);
  assert.deepEqual(nestedOf('{ git push; }'), [' git push; ']);
  assert.deepEqual(nestedOf('bash <(curl -s x)'), ['curl -s x']);
});

test('does not treat parameter expansion as a group', () => {
  assert.deepEqual(wordsOf('echo ${HOME}'), [['echo', '${HOME}']]);
  assert.deepEqual(nestedOf('echo ${HOME}'), []);
});

test('collects PowerShell script blocks and subexpressions', () => {
  const command = 'Get-ChildItem | ForEach-Object { Remove-Item $_ -Recurse }; iex (iwr x)';
  assert.deepEqual(nestedOf(command, 'powershell'), [' Remove-Item $_ -Recurse ', 'iwr x']);
});

test('reads PowerShell here-strings as one word', () => {
  const command = "$text = @'\ngit push\nrm -rf /\n'@\nWrite-Output $text";
  assert.deepEqual(wordsOf(command, 'powershell'), [['$text', '=', 'git push\nrm -rf /'], ['Write-Output', '$text']]);
});

test('collects subexpressions inside double-quoted PowerShell here-strings', () => {
  const command = '$text = @"\nnow $(git push)\n"@';
  assert.deepEqual(nestedOf(command, 'powershell'), ['git push']);
});

test('keeps the PowerShell call operator as a word', () => {
  assert.deepEqual(wordsOf('& git push', 'powershell'), [['&', 'git', 'push']]);
});

test('ignores comments', () => {
  assert.deepEqual(wordsOf('ls # rm -rf /\necho a#b'), [['ls'], ['echo', 'a#b']]);
});

test('joins escaped line breaks', () => {
  assert.deepEqual(wordsOf('git \\\n  status'), [['git', 'status']]);
  assert.deepEqual(wordsOf('git `\r\n  status', 'powershell'), [['git', 'status']]);
});

test('reads unterminated quotes and groups to the end of the input', () => {
  assert.deepEqual(wordsOf('echo "abc'), [['echo', 'abc']]);
  assert.deepEqual(nestedOf('echo $(git push'), ['git push']);
});

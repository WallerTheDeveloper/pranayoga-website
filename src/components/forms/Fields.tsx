import type { ChangeEvent, HTMLInputTypeAttribute, ReactNode } from 'react'

import { AlertIcon, ChevronDownIcon } from '@/components/icons/UiIcons'
import { formsCopy } from '@/content/copy/forms'

import styles from './Forms.module.css'

/** Ids of the hint and error lines, in reading order, for `aria-describedby`. */
export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

export function ErrorMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p className={styles.error} id={`${id}-error`}>
      <AlertIcon size={18} />
      <span>{message}</span>
    </p>
  )
}

interface ShellProps {
  id: string
  label: string
  optional?: boolean
  hint?: string
  error?: string
  wide?: boolean
  children: ReactNode
}

/** Label, hint, control, error: the order a screen reader and a sighted visitor meet them. */
function FieldShell({
  id,
  label,
  optional = false,
  hint,
  error,
  wide = false,
  children,
}: ShellProps) {
  return (
    <div
      className={[styles.field, wide ? styles.wide : ''].filter(Boolean).join(' ')}
      data-field=""
    >
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional ? <span className={styles.optional}> {formsCopy.optional}</span> : null}
      </label>
      {hint ? (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {children}
      <ErrorMessage id={id} message={error} />
    </div>
  )
}

interface BaseFieldProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  optional?: boolean
  hint?: string
  error?: string
  /** While the form is sending: visible but not editable. */
  readOnly?: boolean
  /** Takes the whole row of the form grid. */
  wide?: boolean
}

interface TextFieldProps extends BaseFieldProps {
  type?: Extract<HTMLInputTypeAttribute, 'text' | 'email' | 'tel' | 'date'>
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'tel' | 'numeric'
  spellCheck?: boolean
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  optional = false,
  hint,
  error,
  readOnly = false,
  wide = false,
  type = 'text',
  autoComplete,
  inputMode,
  spellCheck,
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} wide={wide}>
      <input
        className={styles.input}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        required={!optional}
        readOnly={readOnly}
        autoComplete={autoComplete}
        inputMode={inputMode}
        spellCheck={spellCheck}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldShell>
  )
}

export function TextareaField({
  id,
  name,
  label,
  value,
  onChange,
  optional = false,
  hint,
  error,
  readOnly = false,
  wide = false,
}: BaseFieldProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} wide={wide}>
      <textarea
        className={`${styles.input} ${styles.textarea}`}
        id={id}
        name={name}
        value={value}
        rows={6}
        onChange={(event) => onChange(event.target.value)}
        required={!optional}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldShell>
  )
}

export interface SelectOption {
  value: string
  label: string
}

export interface SelectGroup {
  label: string
  options: readonly SelectOption[]
}

interface SelectFieldProps extends Omit<BaseFieldProps, 'readOnly'> {
  placeholder: string
  groups: readonly SelectGroup[]
}

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  optional = false,
  hint,
  error,
  placeholder,
  groups,
  wide = false,
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} wide={wide}>
      <div className={styles.selectWrap}>
        <select
          className={styles.input}
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={!optional}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
        >
          <option value="">{placeholder}</option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDownIcon size={20} className={styles.selectIcon} />
      </div>
    </FieldShell>
  )
}

interface CheckboxFieldProps {
  id: string
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  children: ReactNode
}

export function CheckboxField({
  id,
  name,
  checked,
  onChange,
  error,
  children,
}: CheckboxFieldProps) {
  return (
    <div className={styles.field} data-field="">
      <label className={styles.checkbox}>
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, undefined, error)}
        />
        <span>{children}</span>
      </label>
      <ErrorMessage id={id} message={error} />
    </div>
  )
}

interface RadioCardGroupProps<V extends string> {
  name: string
  /** The group's accessible name, e.g. "Wie möchten Sie bezahlen?". */
  label: string
  value: V
  options: readonly { value: V; label: string }[]
  onChange: (value: V) => void
  /** Id prefix: each radio gets `${idPrefix}-${value}`. */
  idPrefix: string
}

export function RadioCardGroup<V extends string>({
  name,
  label,
  value,
  options,
  onChange,
  idPrefix,
}: RadioCardGroupProps<V>) {
  return (
    <div className={styles.radioGroup} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <label key={option.value} className={styles.radioCard}>
          <input
            id={`${idPrefix}-${option.value}`}
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )
}

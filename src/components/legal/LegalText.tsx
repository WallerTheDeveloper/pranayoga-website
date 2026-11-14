import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { ComponentProps, ReactNode } from 'react'

import type { RichTextData } from '@/content/types'
import { safeHref } from '@/lib/validation/href'

import styles from './LegalPage.module.css'

type RichTextInput = ComponentProps<typeof RichText>['data']

interface LinkFields {
  url?: unknown
  newTab?: unknown
}

function renderLink(fields: LinkFields, children: ReactNode): ReactNode {
  const href = safeHref(fields.url)
  // An unsafe or empty target keeps its words but loses the link.
  if (!href) return <span>{children}</span>
  const newTab = fields.newTab === true
  return (
    <a
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  )
}

/** The default converters, with links limited to web, mail, phone and same-site targets. */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) =>
    renderLink(node.fields as LinkFields, nodesToJSX({ nodes: node.children })),
  autolink: ({ node, nodesToJSX }) =>
    renderLink(node.fields as LinkFields, nodesToJSX({ nodes: node.children })),
})

/** A legal text from the admin (Lexical), set at 18 px with at most 72 characters per line. */
export function LegalText({ content }: { content: RichTextData }) {
  return (
    <RichText
      className={styles.prose}
      data={content as unknown as RichTextInput}
      converters={converters}
      disableIndent
      disableTextAlign
    />
  )
}

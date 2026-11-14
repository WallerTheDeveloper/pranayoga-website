import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import type { PriceGroupView } from '@/content/types'

import styles from './PriceCard.module.css'
import { PriceCard } from './PriceCard'
import groupStyles from './PriceGroupBlock.module.css'

interface PriceGroupBlockProps {
  group: PriceGroupView
  groupUrl: string | null
}

/** One price group (design `.pgroup`): kicker, title and description, then its cards. */
export function PriceGroupBlock({ group, groupUrl }: PriceGroupBlockProps) {
  const headingId = `price-group-${group.id}`
  return (
    <section className={`rv ${groupStyles.group}`} aria-labelledby={headingId}>
      <div className={groupStyles.intro}>
        {group.kicker ? <Eyebrow>{group.kicker}</Eyebrow> : null}
        <Heading as="h2" size="section" id={headingId}>
          {group.title}
        </Heading>
        {group.description ? <p className={groupStyles.description}>{group.description}</p> : null}
      </div>
      <ul className={styles.grid}>
        {group.blocks.map((block) => (
          <li key={block.id}>
            <PriceCard block={block} groupUrl={groupUrl} />
          </li>
        ))}
      </ul>
    </section>
  )
}

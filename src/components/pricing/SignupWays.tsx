import type { ReactNode } from 'react'

import { BankIcon, DownloadIcon, FormIcon } from '@/components/icons/UiIcons'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { pricingCopy } from '@/content/copy/pricing'
import type { BusinessSettingsView, DownloadView } from '@/content/types'
import { routes } from '@/lib/routes'

import { IbanCopyButton } from './IbanCopyButton'
import styles from './SignupWays.module.css'

interface SignupWaysProps {
  /** The membership contract PDF; its card is left out until one is uploaded. */
  contract: DownloadView | null
  bank: BusinessSettingsView['bank']
  headingId: string
}

interface WayProps {
  icon: ReactNode
  title: string
  dark?: boolean
  children: ReactNode
}

function Way({ icon, title, dark = false, children }: WayProps) {
  return (
    <li className={[styles.way, dark ? styles.dark : ''].filter(Boolean).join(' ')}>
      <span className={styles.disc} aria-hidden="true">
        {icon}
      </span>
      <h3 className={`serif ${styles.title}`}>{title}</h3>
      {children}
    </li>
  )
}

interface BankRow {
  term: string
  value: string | null
}

/** "So melden Sie sich an": online, by contract, by bank transfer. Missing ways are left out. */
export function SignupWays({ contract, bank, headingId }: SignupWaysProps) {
  const copy = pricingCopy.signupWays
  const bankCopy = pricingCopy.bank
  const count = 1 + (contract ? 1 : 0) + (bank.iban ? 1 : 0)
  const rows: BankRow[] = [
    { term: bankCopy.bankName, value: bank.bankName },
    { term: bankCopy.accountHolder, value: bank.accountHolder },
  ]
  return (
    <div className={styles.root}>
      <div className={styles.intro}>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {copy.heading}
        </Heading>
        <p className={styles.lead}>{copy.intro(count)}</p>
      </div>
      <ul className={styles.ways}>
        <Way icon={<FormIcon size={26} />} title={copy.online.title}>
          <p className={styles.text}>{copy.online.text}</p>
          <div className={styles.action}>
            <Button href={routes.signup()} withArrow>
              {copy.online.button}
            </Button>
          </div>
        </Way>
        {contract ? (
          <Way icon={<DownloadIcon size={26} />} title={copy.contract.title}>
            <p className={styles.text}>{copy.contract.text}</p>
            <div className={styles.action}>
              <Button
                href={contract.href}
                plain
                variant="outline"
                icon={<DownloadIcon size={20} />}
              >
                {copy.contract.button}
              </Button>
            </div>
          </Way>
        ) : null}
        {bank.iban ? (
          <Way icon={<BankIcon size={26} />} title={copy.transfer.title} dark>
            <dl className={styles.bank}>
              {rows.map((row) =>
                row.value ? (
                  <div key={row.term}>
                    <dt>{row.term}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ) : null,
              )}
              <div>
                <dt>{bankCopy.iban}</dt>
                <dd className={styles.ibanRow}>
                  <span className={styles.iban}>{bank.iban}</span>
                  <IbanCopyButton iban={bank.iban} />
                </dd>
              </div>
              {bank.paymentReference ? (
                <div>
                  <dt>{bankCopy.paymentReference}</dt>
                  <dd>{bank.paymentReference}</dd>
                </div>
              ) : null}
            </dl>
          </Way>
        ) : null}
      </ul>
    </div>
  )
}

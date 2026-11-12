import type { GlobalConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { globalCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import {
  validateHttpsUrl,
  validateIban,
  validatePhoneE164,
  validatePostalCode,
  validateSocialUrl,
  validateWhatsAppUrl,
} from '@/fields/validators'

export const BusinessSettings: GlobalConfig = {
  slug: 'business-settings',
  label: label('Studio-Daten', 'Studio details'),
  admin: {
    group: ADMIN_GROUPS.settings,
    description: label(
      'Kontakt, WhatsApp, soziale Netzwerke und Bankverbindung. Erscheint auf jeder Seite.',
      'Contact, WhatsApp, social links and bank details. Shown on every page.',
    ),
  },
  access: {
    read: publishedOrLoggedIn,
    update: isLoggedIn,
    readVersions: isLoggedIn,
  },
  versions: {
    max: 25,
    drafts: { autosave: { interval: 800 }, schedulePublish: false },
  },
  hooks: globalCacheHooks({ drafts: true, tags: [CACHE_TAGS.businessSettings] }),
  fields: [
    {
      name: 'contact',
      type: 'group',
      label: label('Kontakt', 'Contact'),
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'phoneDisplay',
              type: 'text',
              label: label('Telefon (Anzeige)', 'Phone (display)'),
              required: true,
              maxLength: 24,
              admin: { description: label('z. B. 0175 5830372', 'e.g. 0175 5830372') },
            },
            {
              name: 'phoneE164',
              type: 'text',
              label: label('Telefon (zum Wählen)', 'Phone (dialable)'),
              required: true,
              validate: validatePhoneE164,
              admin: { description: label('z. B. +491755830372', 'e.g. +491755830372') },
            },
          ],
        },
        {
          name: 'email',
          type: 'email',
          label: label('E-Mail', 'Email'),
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'street',
              type: 'text',
              label: label('Straße und Hausnummer', 'Street and number'),
              required: true,
              maxLength: 60,
            },
            {
              name: 'postalCode',
              type: 'text',
              label: label('PLZ', 'Postal code'),
              required: true,
              validate: validatePostalCode,
            },
            {
              name: 'city',
              type: 'text',
              label: label('Ort', 'City'),
              required: true,
              maxLength: 40,
            },
          ],
        },
      ],
    },
    {
      name: 'whatsApp',
      type: 'group',
      label: label('WhatsApp', 'WhatsApp'),
      fields: [
        {
          name: 'groupUrl',
          type: 'text',
          label: label('Link zur Studio-Gruppe', 'Studio group link'),
          required: true,
          validate: validateWhatsAppUrl,
          admin: {
            description: label(
              'Für „Termin“ und „Per WhatsApp anfragen“. Beginnt mit https://chat.whatsapp.com/',
              'Used by the booking buttons. Starts with https://chat.whatsapp.com/',
            ),
          },
        },
        {
          name: 'personalChatUrl',
          type: 'text',
          label: label('Link zum persönlichen Chat', 'Personal chat link'),
          validate: validateWhatsAppUrl,
          admin: {
            description: label(
              'Für die Yogaausbildung. Beginnt mit https://wa.me/',
              'Used on the teacher-training page. Starts with https://wa.me/',
            ),
          },
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: label('Soziale Netzwerke', 'Social links'),
      admin: {
        description: label(
          'Leer gelassen, wird die jeweilige Schaltfläche ausgeblendet.',
          'When empty, the button is hidden.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'instagramUrl',
              type: 'text',
              label: label('Instagram', 'Instagram'),
              validate: validateSocialUrl('instagram'),
            },
            {
              name: 'facebookUrl',
              type: 'text',
              label: label('Facebook', 'Facebook'),
              validate: validateSocialUrl('facebook'),
            },
          ],
        },
        {
          name: 'googleReviewsUrl',
          type: 'text',
          label: label('Google-Bewertungen', 'Google reviews'),
          validate: validateHttpsUrl,
        },
      ],
    },
    {
      name: 'bank',
      type: 'group',
      label: label('Bankverbindung', 'Bank details'),
      admin: {
        description: label(
          'Erscheint auf der Preisseite. Leere Felder werden ausgeblendet.',
          'Shown on the pricing page. Empty fields are hidden.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'accountHolder',
              type: 'text',
              label: label('Kontoinhaberin', 'Account holder'),
              maxLength: 60,
            },
            { name: 'bankName', type: 'text', label: label('Bank', 'Bank'), maxLength: 60 },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'iban',
              type: 'text',
              label: label('IBAN', 'IBAN'),
              validate: validateIban,
            },
            {
              name: 'paymentReference',
              type: 'text',
              label: label('Verwendungszweck', 'Payment reference'),
              maxLength: 80,
            },
          ],
        },
      ],
    },
  ],
}

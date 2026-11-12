import type { CourseIconName } from '../../src/components/icons/courseIconNames'
import { TRIAL_PRICE_TOKEN } from '../../src/lib/placeholders'

/** Course content from the design (Kurs-*.dc.html, Kurse.dc.html). Images are seed file names. */

export interface SeedStep {
  title: string
  text: string
  image?: string
}

export interface SeedCourse {
  slug: string
  title: string
  icon: CourseIconName
  tagline: string
  badge?: { text: string; tone: 'light' | 'dark' }
  cardTeaser: string
  cardImage: string
  hero: {
    eyebrow: string
    lead: string
    audienceLabel: string
    image: string
    secondaryImage?: string
  }
  audience: { paragraphs: string[]; quote?: string }
  steps: { heading: string; items: SeedStep[] }
  benefits: { heading: string; items: SeedStep[]; sideImage?: string }
  faqs: { question: string; answer: string }[]
}

const NO_EXPERIENCE_NEEDED = {
  question: 'Brauche ich Vorerfahrung?',
  answer: 'Nein. Unsere Kurse sind für jeden geeignet – unabhängig von Alter, Beruf und Fitness.',
}

const SHARED_FAQS = [
  {
    question: 'Wann findet der Kurs statt?',
    answer:
      'Die aktuellen Kurszeiten und freie Plätze finden Sie in unserer WhatsApp-Gruppe. Sie können uns auch anrufen oder eine E-Mail schreiben.',
  },
  {
    question: 'Was kostet eine Probestunde?',
    answer: `Eine Probestunde in einem Kurs Ihrer Wahl kostet ${TRIAL_PRICE_TOKEN}. Alle Preise finden Sie unter Mitgliedschaft & Preise.`,
  },
  {
    question: 'Was muss ich mitbringen?',
    answer: 'Eine eigene Yogamatte, bequeme Kleidung und gute Laune.',
  },
  {
    question: 'Ich habe gesundheitliche Beschwerden. Darf ich mitmachen?',
    answer:
      'Bei medizinischen Bedenken befragen Sie bitte vorab Ihren Arzt. Gerne beantworten wir Ihre Fragen zum Kurs.',
  },
]

export const seedCourses: SeedCourse[] = [
  {
    slug: 'hatha-yoga',
    title: 'Hatha Yoga',
    icon: 'hatha',
    tagline: 'Sanft, für jeden geeignet',
    cardTeaser:
      'Gleichgewicht zwischen Körper und Geist – mit Übungen, Atemtechniken und Meditation.',
    cardImage: 'hatha-seated-foot-raise.jpg',
    hero: {
      eyebrow: 'Kurs · sanft',
      lead: 'Ein sehr sanfter Yogastil mit Fokus auf statischen Posen – er verbindet alle wesentlichen Elemente des Yoga.',
      audienceLabel: 'Für jeden geeignet',
      image: 'hatha-deep-straddle-stretch.jpg',
      secondaryImage: 'hatha-boat-pose-window.jpg',
    },
    audience: {
      paragraphs: [
        'Für jeden geeignet – ganz egal, wie alt Sie sind oder welchen Beruf Sie haben. Auch Ihre momentane Fitness spielt keine Rolle.',
        'Schon nach wenigen Einheiten werden Sie erste Effekte bemerken. Wenn Sie regelmäßig die Matte ausrollen, spüren Sie vielfältige Veränderungen.',
      ],
    },
    steps: {
      heading: 'Drei Elemente einer Stunde',
      items: [
        {
          title: 'Atmung',
          text: 'Zunächst lernen Sie, Ihren Atem zu lenken – das nennt man Pranayama. Er bringt Sie zu sich und aktiviert Sie zugleich.',
          image: 'camel-pose-kneeling.jpg',
        },
        {
          title: 'Posen',
          text: 'Dann geht es um den Körper: die Asanas. Es gibt keinen festen Ablauf, unterschiedliche Abfolgen werden kombiniert.',
          image: 'hatha-seated-twist-window.jpg',
        },
        {
          title: 'Meditation',
          text: 'Zum Schluss finden Sie Ihre innere Mitte. Diese Phase ist nicht lang, aber sehr wirkungsvoll.',
          image: 'hatha-arm-balance-extended-leg.jpg',
        },
      ],
    },
    benefits: {
      heading: 'Was bringt ein Hatha-Yoga-Kurs?',
      items: [
        {
          title: 'Besserer Schlaf',
          text: 'Mit dem bewussten Atem gewinnen Sie Kontrolle über Körper und Geist – und schlafen besser.',
          image: 'hatha-side-stretch-floor.jpg',
        },
        {
          title: 'Bessere Durchblutung',
          text: 'Muskeln, Sehnen und Bänder bleiben durch die regelmäßige Praxis geschmeidig.',
          image: 'hatha-shoulder-stretch-closeup.jpg',
        },
        {
          title: 'Meditative Wirkung',
          text: 'Das langsame Ausführen der Übungen entschleunigt – das hilft Ihnen im Alltag.',
          image: 'hatha-calm-stretch-studio.jpg',
        },
        {
          title: 'Mehr Ruhe',
          text: 'Sie bleiben im Alltag ruhiger, sogar Ihr Herzschlag wird ruhiger.',
          image: 'hatha-seated-from-above.jpg',
        },
        {
          title: 'Weniger Verspannungen',
          text: 'Stress wird abgebaut, Blockaden lösen sich, Rückenschmerzen werden gelindert.',
        },
        { title: 'Mehr Kraft', text: 'Ihr ganzer Körper wird stärker und kräftiger.' },
      ],
    },
    faqs: [NO_EXPERIENCE_NEEDED, ...SHARED_FAQS],
  },
  {
    slug: 'ruecken-yoga',
    title: 'Rücken Yoga',
    icon: 'back',
    tagline: 'Für die Generation 50 Plus',
    badge: { text: '50 Plus', tone: 'light' },
    cardTeaser:
      'Rückenschmerzen dauerhaft in den Griff bekommen – entwickelt für die Generation 50 Plus.',
    cardImage: 'back-shoulder-stand-window.jpg',
    hero: {
      eyebrow: 'Kurs · 50 Plus',
      lead: 'Speziell für die Generation 50 Plus entwickelt: Rückenschmerzen dauerhaft in den Griff bekommen – und ihnen vorbeugen.',
      audienceLabel: '50 Plus',
      image: 'back-bridge-wooden-floor.jpg',
      secondaryImage: 'back-spine-model.jpg',
    },
    audience: {
      paragraphs: [
        'Langes Sitzen und einseitige Belastung führen oft zu Rückenschmerzen, die sogar chronisch werden können. Yoga hilft, bestehende Schmerzen in den Griff zu bekommen und neuen vorzubeugen.',
        'Es ist nie zu spät, mit Yoga zu beginnen. Wenn Sie zur Generation 50 Plus gehören und etwas für Ihre Gesundheit, Beweglichkeit und Ihr Wohlbefinden tun möchten, ist jetzt der richtige Zeitpunkt.',
      ],
    },
    steps: {
      heading: 'Für Beweglichkeit und gegen Rückenschmerzen',
      items: [
        {
          title: 'Bessere Haltung',
          text: 'Sie nehmen Ihren Körper bewusst wahr, bewegen sich besser und richten sich auf.',
          image: 'back-arms-behind-back.jpg',
        },
        {
          title: 'Bewusste Ich-Zeit',
          text: 'Stress verspannt die Muskulatur. Im Kurs nehmen Sie sich bewusst Zeit für sich und Ihren Körper.',
          image: 'back-lying-leg-raised.jpg',
        },
        {
          title: 'Ganzheitlich',
          text: 'Nicht nur der Rücken: Bauch, Hüfte, Knie und Schultern werden einbezogen.',
          image: 'back-shoulder-bridge-mat.jpg',
        },
        {
          title: 'Bewusste Atmung',
          text: 'Tiefer, bewusster Atem löst Verspannungen und Schmerzen im Rücken.',
          image: 'camel-pose-kneeling.jpg',
        },
      ],
    },
    benefits: {
      heading: 'Wirkung von Rücken Yoga',
      items: [
        {
          title: 'Starke Muskulatur',
          text: 'Durch die Positionen und das Halten stärken Sie Ihre Muskeln – sie tragen Sie leichter durch den Tag.',
        },
        {
          title: 'Wirbelsäule mobilisieren',
          text: 'Die Wirbelsäule wird aufgerichtet und mobilisiert; verkürzte Muskeln werden gedehnt und gekräftigt.',
        },
        {
          title: 'Gesunde Muskulatur',
          text: 'Gezielte Bewegungen bringen die Muskeln rund um die Wirbelsäule in einen gesunden Zustand.',
        },
        {
          title: 'Aktive Entspannung',
          text: 'Die meditativen Anteile und die Atmung tragen aktiv zu Ihrer Entspannung bei.',
        },
      ],
      sideImage: 'back-spine-model-discussion.jpg',
    },
    faqs: [NO_EXPERIENCE_NEEDED, ...SHARED_FAQS],
  },
  {
    slug: 'tibetische-klangschalen',
    title: 'Tibetische Klangschalen',
    icon: 'singingBowl',
    tagline: 'Ruhe und Entspannung',
    cardTeaser:
      'Ruhe und Entspannung: Sie kommen ganz zu sich und nehmen Ihren Körper bewusst wahr.',
    cardImage: 'singing-bowl-forward-bend-cushion.jpg',
    hero: {
      eyebrow: 'Kurs · Achtsamkeit',
      lead: 'Achtsamkeit und Klang: Die Töne der Klangschalen helfen, auf sanfte Weise Blockaden zu lösen.',
      audienceLabel: 'Für jeden geeignet',
      image: 'singing-bowl-teacher-holding.jpg',
      secondaryImage: 'singing-bowl-meditation-above.jpg',
    },
    audience: {
      paragraphs: [
        'Für alle, die zur Ruhe kommen möchten. Sie lernen, auf Ihren Körper zu hören, genau hinzufühlen und darauf angemessen zu reagieren.',
      ],
      quote: '„Jede Seele hat ihren eigenen Klang. Kommen Sie in Einklang mit sich selbst.“',
    },
    steps: {
      heading: 'So arbeiten wir',
      items: [
        {
          title: 'Achtsamkeit',
          text: 'Es geht nicht darum, sich möglichst weit zu dehnen. Sie gehen nur so weit, wie es für Sie angenehm ist.',
          image: 'singing-bowl-relaxed-hand.jpg',
        },
        {
          title: 'Schwerkraft',
          text: 'Sie bleiben im Idealfall passiv und lassen die Schwerkraft für sich arbeiten.',
          image: 'singing-bowl-head-on-cushion.jpg',
        },
        {
          title: 'Klang',
          text: 'Die Töne der Schalen füllen den ganzen Raum und tragen Schwingungen, die Körper, Seele und Geist berühren.',
          image: 'singing-bowl-two-bowls.jpg',
        },
      ],
    },
    benefits: {
      heading: 'Wirkung tibetischer Klangschalen',
      items: [
        {
          title: 'Weniger Stress',
          text: 'Sie lernen, achtsam mit sich umzugehen, und kommen wieder ganz zu sich.',
        },
        {
          title: 'Klarer Kopf',
          text: 'Geistige Klarheit und ein besseres allgemeines Wohlbefinden.',
        },
        {
          title: 'Tiefer Schlaf',
          text: 'Ein erholsamerer, tieferer Schlaf zählt zu den Wirkungen.',
        },
        {
          title: 'Entspannung',
          text: 'Der Klang der Schalen und des Gongs löst Verspannungen auf allen Ebenen.',
        },
      ],
      sideImage: 'singing-bowl-forward-bend-cushion.jpg',
    },
    faqs: [NO_EXPERIENCE_NEEDED, ...SHARED_FAQS],
  },
  {
    slug: 'yoga-fuer-jugendliche',
    title: 'Yoga für Jugendliche',
    icon: 'teens',
    tagline: 'Ab 14 Jahren',
    badge: { text: '14+', tone: 'light' },
    cardTeaser: 'Mehr Struktur, Bewegung und Ausgeglichenheit in der Pubertät.',
    cardImage: 'teens-partner-boat-pose.jpg',
    hero: {
      eyebrow: 'Kurs · ab 14 Jahren',
      lead: 'Mehr Struktur, Bewegung, Sportlichkeit und Ausgeglichenheit in der Pubertät.',
      audienceLabel: 'Jugendliche ab 14',
      image: 'teens-teacher-and-teen-smiling.jpg',
      secondaryImage: 'teens-cross-legged.jpg',
    },
    audience: {
      paragraphs: [
        'Für Jugendliche ab 14 Jahren. Sie stecken in einer entscheidenden Entwicklungsphase und stehen oft unter Anspannung, Stress und Druck.',
        'Yoga hilft, ausgeglichener und konzentrierter zu werden – das wirkt sich positiv auf die Leistungen in der Schule und das gesamte Verhalten aus.',
      ],
    },
    steps: {
      heading: 'Worum es im Kurs geht',
      items: [
        {
          title: 'Koordination',
          text: 'Die Koordinationsfähigkeit wird gestärkt.',
          image: 'teens-bridge-side-by-side.jpg',
        },
        {
          title: 'Kraft und Ausdauer',
          text: 'Sanfte Körperbewegungen fördern Kraft und Ausdauer.',
          image: 'teens-partner-boat-pose.jpg',
        },
        {
          title: 'Stress abbauen',
          text: 'Bewusste Entspannung mindert den Stress aus Schule und Alltag.',
          image: 'teens-partner-seated-stretch.jpg',
        },
      ],
    },
    benefits: {
      heading: 'Was Yoga Jugendlichen bringt',
      items: [
        {
          title: 'Entwicklung',
          text: 'Sanfte Bewegung, Aufmerksamkeit und Entspannung fördern die körperliche und geistige Entwicklung.',
        },
        {
          title: 'Selbstvertrauen',
          text: 'Stärkt das Selbstvertrauen und die Körperwahrnehmung.',
        },
        {
          title: 'Gesunder Körper',
          text: 'Beugt Rückenproblemen und Kopfschmerzen vor, stärkt Muskulatur und Kondition.',
        },
        {
          title: 'Konzentration',
          text: 'Fördert Konzentration, Gemeinschaftssinn, Kreativität und einen ruhigen Geist.',
        },
      ],
    },
    faqs: [
      {
        question: 'Brauche ich Vorerfahrung?',
        answer:
          'Nein. Der Kurs richtet sich an Jugendliche ab 14 Jahren, Vorerfahrung ist nicht nötig.',
      },
      ...SHARED_FAQS,
    ],
  },
  {
    slug: 'rad-yoga',
    title: 'Rad Yoga',
    icon: 'wheel',
    tagline: 'Mit dem Yoga-Rad',
    badge: { text: 'Neu', tone: 'dark' },
    cardTeaser:
      'Kraft, Flexibilität und Balance mit dem Yoga-Rad – für eine starke Körpermitte und bessere Haltung.',
    cardImage: 'wheel-yoga-group-standing-balance.jpg',
    hero: {
      eyebrow: 'Kurs · neu',
      lead: 'Kraft, Flexibilität und Balance mit dem Yoga-Rad – ideal für jedes Level, vom Anfänger bis zum Fortgeschrittenen.',
      audienceLabel: 'Anfänger und Fortgeschrittene',
      image: 'wheel-yoga-group-standing-balance.jpg',
    },
    audience: {
      paragraphs: [
        'Für jedes Level – vom Anfänger bis zum Fortgeschrittenen. Mit dem Yoga-Rad stärken Sie Ihre Ausdauer, fördern Ihre Beweglichkeit und bringen Körper und Geist in Einklang.',
      ],
    },
    steps: {
      heading: 'Das Yoga-Rad unterstützt Sie bei',
      items: [
        {
          title: 'Rückbeugen',
          text: 'Sanftes Öffnen des Brustkorbs und Dehnen der Wirbelsäule.',
          image: 'wheel-yoga-backbend-correction.jpg',
        },
        {
          title: 'Balance-Übungen',
          text: 'Fördert Stabilität und Koordination.',
          image: 'wheel-yoga-group-forward-bend.jpg',
        },
        {
          title: 'Krafttraining',
          text: 'Aufbau von Muskelkraft in Armen, Bauch und Rücken.',
          image: 'wheel-yoga-group-forearm-plank.jpg',
        },
        {
          title: 'Tiefenentspannung',
          text: 'Unterstützt Dehnungen und reduziert Stress.',
          image: 'wheel-yoga-two-wheels.jpg',
        },
      ],
    },
    benefits: {
      heading: 'Kraft, Flexibilität und Balance',
      items: [
        {
          title: 'Kraft',
          text: 'Steigert Ihre Flexibilität, stärkt die Körpermitte und verbessert die Haltung.',
        },
        { title: 'Ausdauer', text: 'Stärkt Ihre Ausdauer und fördert Ihre Beweglichkeit.' },
        { title: 'Balance', text: 'Entdecken Sie Ihre innere Stärke.' },
      ],
    },
    faqs: [NO_EXPERIENCE_NEEDED, ...SHARED_FAQS],
  },
  {
    slug: 'yoga-sport-balance',
    title: 'Yoga Sport Balance',
    icon: 'sportBalance',
    tagline: 'Kraft, Ausdauer, Balance',
    badge: { text: 'Neu', tone: 'dark' },
    cardTeaser:
      'Dynamische Bewegung, Krafttraining und Balance-Übungen in einem ganzheitlichen Training.',
    cardImage: 'sport-balance-arm-balance-stone-wall.jpg',
    hero: {
      eyebrow: 'Kurs · neu',
      lead: 'Für Anfänger und Fortgeschrittene: Dieser Kurs fordert Sie heraus und bringt Sie auf das nächste Level.',
      audienceLabel: 'Für alle, die gefordert werden möchten',
      image: 'sport-balance-headstand-wall.jpg',
    },
    audience: {
      paragraphs: [
        'Für Anfänger und Fortgeschrittene, die gefordert werden möchten. Der Kurs verbindet dynamische Bewegungen, Krafttraining und intensive Balance-Übungen zu einem ganzheitlichen Training.',
      ],
    },
    steps: {
      heading: 'Highlights des Kurses',
      items: [
        {
          title: 'Kraft und Stabilität',
          text: 'Effektive Übungen für Arme, Beine und Körpermitte.',
          image: 'sport-balance-arm-balance-legs-side.jpg',
        },
        {
          title: 'Balance-Asanas',
          text: 'Haltungen wie Baum, Krieger III und Krähe.',
          image: 'sport-balance-arm-balance-stone-wall.jpg',
        },
        {
          title: 'Ausdauertraining',
          text: 'Dynamische Sequenzen stärken Herz und Lunge.',
          image: 'sport-balance-inversion-legs.jpg',
        },
        {
          title: 'Flexibilität und Fokus',
          text: 'Körperliche Stärke verbunden mit mentaler Ruhe.',
          image: 'sport-balance-seated-forward-bend.jpg',
        },
      ],
    },
    benefits: {
      heading: 'Kraft, Ausdauer und Balance',
      items: [
        { title: 'Kraft', text: 'Gezielter Muskelaufbau in einem ganzheitlichen Training.' },
        { title: 'Ausdauer', text: 'Entwickeln Sie Ihre Ausdauer Stunde für Stunde.' },
        {
          title: 'Balance',
          text: 'Meistern Sie anspruchsvolle Balance-Asanas mit Präzision.',
        },
      ],
    },
    faqs: [NO_EXPERIENCE_NEEDED, ...SHARED_FAQS],
  },
]

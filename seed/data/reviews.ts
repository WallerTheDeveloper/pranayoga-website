/** Google reviews quoted on the home page (Main.dc.html). Cuts are marked with "…" as in the design. */

export interface SeedReview {
  author: string
  text: string
}

export const seedReviews: SeedReview[] = [
  {
    author: 'Daniela&Stefan -76',
    text: 'Ich mag diese Yoga Studio sehr. Besuche schon seit eineinhalb Jahre lang. Die Lehrerin ist sehr qualifiziert. … Niemals wird es langweilig, sogar leicht:) aber super effektiv.',
  },
  {
    author: 'Adem Kalkan',
    text: 'Das Yoga Studio hier in Essen kann ich nur wärmstens weiterempfehlen! … der Übungsraum vermittelt eine ruhige und entspannte Atmosphäre.',
  },
  {
    author: 'Alex',
    text: 'Tolles Studio, super sympathisches Team und eine großartige Energie! Das Kursangebot ist sehr vielfältig und die Zeiten lassen sich prima in den Alltag integrieren.',
  },
]

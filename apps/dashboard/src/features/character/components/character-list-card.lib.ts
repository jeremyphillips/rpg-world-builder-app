export type CharacterListCardData = {
  id: string
  name: string
  summary: string
  campaign?: {
    id: string
    name: string
  }
}

export type CharacterListCardPreviewItem = {
  card: CharacterListCardData
  detailHref: string
}

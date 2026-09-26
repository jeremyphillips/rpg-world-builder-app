import type { ContentDisplayImage } from '@rpg/contracts'

export type CharacterListCardData = {
  id: string
  name: string
  summary: string
  displayImage?: ContentDisplayImage
  campaign?: {
    id: string
    name: string
    emblemUrl?: string
  }
}

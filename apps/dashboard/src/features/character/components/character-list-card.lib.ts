import type { ContentDisplayImagesByRole } from '@rpg/contracts'

export type CharacterListCardData = {
  id: string
  name: string
  summary: string
  displayImagesByRole?: ContentDisplayImagesByRole
  campaign?: {
    id: string
    name: string
    emblemUrl?: string
  }
}

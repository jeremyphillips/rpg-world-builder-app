import { emptyContentMediaSchema, type ContentMedia, type MediaScope } from '@rpg/contracts'

import {
  COMPACT_MEDIA_FIELD_PRESENTATION,
  DetailMediaField,
  type MediaManagerSave,
} from '@/features/media'

const CHARACTER_IMAGES_LABEL = 'Character images'

export type CharacterDetailMediaSlotProps = {
  media?: ContentMedia
  scope: MediaScope
  readOnly: boolean
  onSave: (change: MediaManagerSave) => void | Promise<void>
}

export function CharacterDetailMediaSlot({
  media,
  scope,
  readOnly,
  onSave,
}: CharacterDetailMediaSlotProps) {
  return (
    <DetailMediaField
      config={{ domain: 'character', presentation: COMPACT_MEDIA_FIELD_PRESENTATION }}
      scope={scope}
      value={media ?? emptyContentMediaSchema}
      label={CHARACTER_IMAGES_LABEL}
      readOnly={readOnly}
      onSave={onSave}
    />
  )
}

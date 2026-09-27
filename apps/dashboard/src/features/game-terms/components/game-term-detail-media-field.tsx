import { emptyContentMediaSchema, vocabularySetSubject } from '@rpg/contracts'
import type { VocabularyOptionSetId, VocabularyOptionWithUsage } from '@rpg/contracts'

import {
  COMPACT_MEDIA_FIELD_PRESENTATION,
  DetailMediaField,
  type MediaManagerSave,
} from '@/features/media'

type GameTermDetailMediaFieldProps = {
  campaignId: string
  setId: VocabularyOptionSetId
  entry: VocabularyOptionWithUsage
  singularLabel: string
  rulesetId?: string
  readOnly: boolean
  onSave: (change: MediaManagerSave) => void | Promise<void>
}

export function GameTermDetailMediaField({
  campaignId,
  setId,
  entry,
  singularLabel,
  rulesetId,
  readOnly,
  onSave,
}: GameTermDetailMediaFieldProps) {
  return (
    <DetailMediaField
      config={{ domain: 'game-term', presentation: COMPACT_MEDIA_FIELD_PRESENTATION }}
      scope={{ kind: 'campaign-content', campaignId }}
      value={entry.media ?? emptyContentMediaSchema}
      label={`${singularLabel} emblem`}
      readOnly={readOnly}
      contentContext={{
        domain: 'game-term',
        subject: vocabularySetSubject(setId),
        slug: entry.id,
        contentSource: entry.source === 'system' ? 'system' : 'homebrew',
        rulesetId,
      }}
      onSave={onSave}
    />
  )
}

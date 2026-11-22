import { useMasterDetailRowPrefix } from '../../../../../lib/master-detail/use-master-detail-row-prefix'
import {
  MonsterActionRulesPreview,
  MonsterActionUnavailableRulesPreview,
} from '../../../../lib/actions/previews/monster-action-preview-presentation'
import {
  MONSTER_TRAIT_PREVIEW_LABEL,
  MONSTER_TRAIT_PREVIEW_UNAVAILABLE_GUIDANCE,
} from '../../../../lib/monster-form-labels'
import { useMonsterTraitPreviewTitle } from '../../../../lib/monster-qualified-preview-title'
import { useMonsterTraitRulesPreviewPresentation } from '../../../../lib/presentation/use-monster-trait-rules-preview'
import { useWatch } from 'react-hook-form'

export function MonsterTraitRulesPreview() {
  const rowPrefix = useMasterDetailRowPrefix()
  const row = useWatch({ name: rowPrefix as never })
  const presentation = useMonsterTraitRulesPreviewPresentation(row)
  const editorTitle = useMonsterTraitPreviewTitle(row)
  if (!presentation) {
    if (!row || typeof row !== 'object') return null
    return (
      <MonsterActionUnavailableRulesPreview
        label={MONSTER_TRAIT_PREVIEW_LABEL}
        title={editorTitle || undefined}
        guidance={MONSTER_TRAIT_PREVIEW_UNAVAILABLE_GUIDANCE}
      />
    )
  }
  return (
    <MonsterActionRulesPreview
      label={MONSTER_TRAIT_PREVIEW_LABEL}
      title={presentation.heading}
      content={{ kind: 'prose', text: presentation.proseText }}
    />
  )
}

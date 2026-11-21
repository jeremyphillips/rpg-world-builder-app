import { useMasterDetailRowPrefix } from '../../../../../lib/master-detail/use-master-detail-row-prefix'
import { MonsterActionRulesPreview } from '../../../../lib/actions/previews/monster-action-preview-presentation'
import { MONSTER_TRAIT_PREVIEW_LABEL } from '../../../../lib/monster-form-labels'
import { useMonsterTraitRulesPreviewPresentation } from '../../../../lib/presentation/use-monster-trait-rules-preview'
import { useWatch } from 'react-hook-form'

export function MonsterTraitRulesPreview() {
  const rowPrefix = useMasterDetailRowPrefix()
  const row = useWatch({ name: rowPrefix as never })
  const presentation = useMonsterTraitRulesPreviewPresentation(row)
  if (!presentation) return null
  return (
    <MonsterActionRulesPreview
      label={MONSTER_TRAIT_PREVIEW_LABEL}
      title={presentation.heading}
      content={{ kind: 'prose', text: presentation.proseText }}
    />
  )
}

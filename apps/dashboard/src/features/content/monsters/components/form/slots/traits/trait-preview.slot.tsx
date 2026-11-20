import { useWatch } from 'react-hook-form'

import { useMasterDetailRowPrefix } from '../../../../../lib/master-detail/use-master-detail-row-prefix'
import { MonsterActionRulesPreview } from '../../../../lib/actions/previews/monster-action-preview-presentation'
import { MONSTER_TRAIT_PREVIEW_LABEL } from '../../../../lib/monster-form-labels'
import { useMonsterTraitPreviewTitle } from '../../../../lib/monster-qualified-preview-title'

export function MonsterTraitRulesPreview({ text }: { text: string }) {
  const rowPrefix = useMasterDetailRowPrefix()
  const row = useWatch({ name: rowPrefix as never })
  const title = useMonsterTraitPreviewTitle(row)
  return (
    <MonsterActionRulesPreview
      label={MONSTER_TRAIT_PREVIEW_LABEL}
      title={title}
      content={{ kind: 'prose', text }}
    />
  )
}

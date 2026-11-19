import { formatCreatureSizeList, joinInlineMetadata } from '@rpg/contracts'

import type { FormEmbeddedMasterDetailMapListItemContext } from '../../../lib/master-detail/use-embedded-master-detail-rows'
import type { MasterDetailListMetaInput } from '../../../lib/master-detail/master-detail-row-title'
import type { MonsterDefinedFormDraft, MonsterFormsDraft } from './monster-forms-form-values'

export function monsterDefinedFormListMeta(
  forms: MonsterFormsDraft | undefined,
  ctx: FormEmbeddedMasterDetailMapListItemContext,
): MasterDetailListMetaInput {
  const form = ctx.row as MonsterDefinedFormDraft | undefined
  const designated = forms?.trueForm.kind === 'defined' && forms.trueForm.formId === form?.id
  const sizeIds = form?.overrides?.sizes
  const sizeLabel = sizeIds && sizeIds.length > 0 ? formatCreatureSizeList(sizeIds) : undefined

  if (designated) {
    const parts = ['True form', 'Base statistics', ...(sizeLabel ? [sizeLabel] : [])]
    return { summary: joinInlineMetadata(parts) }
  }
  if (sizeLabel) return { summary: sizeLabel }
  return {}
}

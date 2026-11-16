import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel'
import { masterDetailItemTitle } from './master-detail-constants'
import type { MasterDetailItemNounTerm } from './master-detail-item-noun'
import type { MasterDetailListMetaInput } from './master-detail-row-title'
import {
  resolveMasterDetailRowTitle,
  type MasterDetailRowTitleConfig,
  type MasterDetailTitleResolution,
} from './master-detail-row-title'
import type { FormEmbeddedMasterDetailMapListItemContext } from './use-embedded-master-detail-rows'

export type EmbeddedListDisplay = Pick<MasterDetailListItem, 'title'> &
  MasterDetailListMetaInput & {
    /** When set, `title` is already display-ready (no second unnamed pass). */
    pipelineTitle: boolean
    resolution?: MasterDetailTitleResolution
  }

export function resolveEmbeddedListDisplay<TRow>(input: {
  rowTitle?: MasterDetailRowTitleConfig<TRow>
  mapListItem?: (
    ctx: FormEmbeddedMasterDetailMapListItemContext,
  ) => Pick<MasterDetailListItem, 'title'> & MasterDetailListMetaInput
  resolveListMeta?: (ctx: FormEmbeddedMasterDetailMapListItemContext) => MasterDetailListMetaInput
  mapCtx: FormEmbeddedMasterDetailMapListItemContext
  rows: readonly TRow[]
  itemNoun: MasterDetailItemNounTerm
  lastAddedFieldId: string | null
}): EmbeddedListDisplay {
  if (input.rowTitle) {
    const row = input.mapCtx.row as TRow
    const resolution = resolveMasterDetailRowTitle(input.rowTitle, {
      row,
      index: input.mapCtx.index,
      fieldId: input.mapCtx.field.id,
      rows: input.rows,
      itemNoun: input.itemNoun,
      lastAddedFieldId: input.lastAddedFieldId,
    })
    const meta = input.resolveListMeta?.(input.mapCtx) ?? {}
    return {
      ...meta,
      title: resolution.displayTitle,
      pipelineTitle: true,
      resolution,
    }
  }

  const legacy = input.mapListItem!(input.mapCtx)
  return {
    eyebrow: legacy.eyebrow,
    kindLabel: legacy.kindLabel,
    summary: legacy.summary,
    title: legacy.title,
    pipelineTitle: false,
  }
}

export function embeddedListItemTitle(
  display: EmbeddedListDisplay,
  itemNoun: MasterDetailItemNounTerm,
): string {
  return display.pipelineTitle ? display.title : masterDetailItemTitle(display.title, itemNoun)
}

/* eslint-disable boundaries/dependencies -- Facing blocks carry content table and stat-block prose shapes at integration boundaries. */
import type { ContentTable } from '../../content/tables/content-table'
import type { StatBlockProseDocument } from '../../runtime/prose/stat-block-prose'

import type { FacingReason } from './facing-reason'

export type FacingRichTextBlock = {
  kind: 'richText'
  html: string
}

export type FacingRulesBlock = {
  kind: 'rules'
  document: StatBlockProseDocument
}

export type FacingTableBlock = {
  kind: 'table'
  table: ContentTable
}

export type FacingBlock = FacingRichTextBlock | FacingRulesBlock | FacingTableBlock

export type FacingDocument = {
  title: string
  blocks: readonly FacingBlock[]
}

export type FacingResolution =
  | {
      status: 'ready'
      document: FacingDocument
    }
  | {
      status: 'incomplete'
      reason: FacingReason
      document?: FacingDocument
    }
  | {
      status: 'unavailable'
      reason: FacingReason
    }
  | {
      status: 'failed'
      reason: FacingReason
    }
  | {
      status: 'invalid'
      reason: FacingReason
    }

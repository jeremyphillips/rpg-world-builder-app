import type { ContentTable } from '../../content/tables/content-table'
import type { StatBlockProseDocument } from '../../runtime/prose/stat-block-prose'

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

export type FacingInvalidCode = 'missing-kind' | 'missing-id' | 'host-mismatch'

export type FacingResolution =
  | {
      status: 'ready'
      document: FacingDocument
    }
  | {
      status: 'incomplete'
      guidance: string
      document?: FacingDocument
    }
  | {
      status: 'unavailable'
      guidance: string
    }
  | {
      status: 'failed'
      guidance: string
    }
  | {
      status: 'invalid'
      code: FacingInvalidCode
    }

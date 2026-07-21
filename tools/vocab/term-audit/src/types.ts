import type { ContentTypeKey, VocabularyOptionSetId, VocabularyTerm } from '@rpg/contracts'

export type TermAuditTarget =
  | {
      kind: 'content_type'
      id: ContentTypeKey
      term: VocabularyTerm
    }
  | {
      kind: 'vocabulary_set'
      id: VocabularyOptionSetId
      term: VocabularyTerm
    }

export type TermSearchVariantForm =
  | 'label'
  | 'compact_label'
  | 'singular'
  | 'plural'
  | 'derived_collection_label'

export type TermSearchVariant = {
  form: TermSearchVariantForm
  value: string
}

export type TermUsageContext =
  | 'label'
  | 'placeholder'
  | 'heading'
  | 'message'
  | 'sentence'
  | 'test_expectation'
  | 'story_fixture'
  | 'comment'
  | 'canonical_usage'
  | 'unknown'

export type TermUsageDisposition = 'replaceable' | 'contextual' | 'ignored' | 'unknown'

export type TermUsage = {
  path: string
  line: number
  column: number
  context: TermUsageContext
  disposition: TermUsageDisposition
  value: string
  variantForms: TermSearchVariantForm[]
  suggestion?: string
}

export type TermAuditSkip = {
  path: string
  reason: string
}

export type TermAuditReport = {
  schemaVersion: 1
  target: TermAuditTarget
  variants: TermSearchVariant[]
  usages: TermUsage[]
  skippedFiles: TermAuditSkip[]
  parseFailures: TermAuditSkip[]
  summary: {
    canonical: number
    replaceable: number
    contextual: number
    ignored: number
    unknown: number
  }
}

export type TermAuditConfigEntry = {
  target: string
  path: string
  reason: string
  owner: string
  expiry?: string
}

export type TermAuditConfig = {
  ignore: readonly string[]
  contextual: readonly TermAuditConfigEntry[]
}

import type { ActionPlanUnchangedReason } from '@rpg/contracts'

export type BulkActionDescriptor = {
  nounSingular: string
  nounPlural: string
}

export type CountPhraseForms = {
  zero: string
  one: string
  many: string
}

export type CountPairForms = {
  one: string
  many: string
}

export function formatCountPhrase(count: number, forms: CountPhraseForms): string {
  if (count === 0) {
    return forms.zero
  }

  if (count === 1) {
    return forms.one
  }

  return forms.many
}

export function formatSubjectVerb(count: number, forms: CountPairForms): string {
  return count === 1 ? forms.one : forms.many
}

export function formatPronoun(count: number, forms: CountPairForms): string {
  return count === 1 ? forms.one : forms.many
}

export function formatDescriptorCount(count: number, descriptor: BulkActionDescriptor): string {
  return formatCountPhrase(count, {
    zero: `0 ${descriptor.nounPlural}`,
    one: `1 ${descriptor.nounSingular}`,
    many: `${count} ${descriptor.nounPlural}`,
  })
}

export function formatAllSelectedDescriptorCount(
  count: number,
  descriptor: BulkActionDescriptor,
): string {
  return formatCountPhrase(count, {
    zero: `All 0 selected ${descriptor.nounPlural}`,
    one: `All 1 selected ${descriptor.nounSingular}`,
    many: `All ${count} selected ${descriptor.nounPlural}`,
  })
}

export type FormatUnchangedSegmentInput = {
  unchangedCount: number
  unchangedReasons: readonly ActionPlanUnchangedReason[]
  descriptor: BulkActionDescriptor
  formatHomogeneousReason: (input: {
    count: number
    reason: ActionPlanUnchangedReason
    descriptor: BulkActionDescriptor
  }) => string
  parentName?: string
}

export function formatUnchangedSegment(input: FormatUnchangedSegmentInput): string {
  if (input.unchangedCount === 0) {
    return ''
  }

  if (input.unchangedReasons.length === 1 && input.unchangedReasons[0]) {
    return input.formatHomogeneousReason({
      count: input.unchangedCount,
      reason: input.unchangedReasons[0],
      descriptor: input.descriptor,
    })
  }

  return `${input.unchangedCount} unchanged`
}

export type FormatWouldChangeUnchangedSummaryInput = FormatUnchangedSegmentInput & {
  wouldChangeCount: number
  formatWouldChangeSegment: (input: {
    wouldChangeCount: number
    descriptor: BulkActionDescriptor
  }) => string
}

export function formatWouldChangeUnchangedSummary(
  input: FormatWouldChangeUnchangedSummaryInput,
): string {
  const wouldChangeSegment = input.formatWouldChangeSegment({
    wouldChangeCount: input.wouldChangeCount,
    descriptor: input.descriptor,
  })

  const unchangedSegment = formatUnchangedSegment(input)

  if (!unchangedSegment) {
    return wouldChangeSegment
  }

  return `${wouldChangeSegment} · ${unchangedSegment}`
}

export type FormatBulkResolveTallyInput = {
  readyCount: number
  blockedCount: number
  unchangedCount: number
  unchangedReasons: readonly ActionPlanUnchangedReason[]
  descriptor: BulkActionDescriptor
  formatHomogeneousUnchangedReason: (input: {
    count: number
    reason: ActionPlanUnchangedReason
    descriptor: BulkActionDescriptor
  }) => string
}

export function formatBulkResolveTally(input: FormatBulkResolveTallyInput): string {
  const parts: string[] = []

  if (input.readyCount > 0) {
    parts.push(`${input.readyCount} ready`)
  }

  if (input.blockedCount > 0) {
    parts.push(`${input.blockedCount} blocked`)
  }

  if (input.unchangedCount > 0) {
    const unchangedLabel =
      input.unchangedReasons.length === 1 && input.unchangedReasons[0]
        ? input.formatHomogeneousUnchangedReason({
            count: input.unchangedCount,
            reason: input.unchangedReasons[0],
            descriptor: input.descriptor,
          })
        : `${input.unchangedCount} unchanged`

    parts.push(unchangedLabel)
  }

  return parts.join(' · ')
}

export function formatBlockedOfWouldChangeDescription(input: {
  blockedCount: number
  wouldChangeCount: number
  descriptor: BulkActionDescriptor
  blockerKind: string
  continueHint?: string
}): string {
  const blockedPhrase = formatDescriptorCount(input.blockedCount, input.descriptor)
  const wouldChangePhrase = formatDescriptorCount(input.wouldChangeCount, input.descriptor)
  const verb = formatSubjectVerb(input.blockedCount, { one: 'is', many: 'are' })
  const pronoun = formatPronoun(input.blockedCount, { one: 'It has', many: 'They have' })

  const base = `${blockedPhrase} of ${wouldChangePhrase} that would change ${verb} blocked by ${input.blockerKind}. ${pronoun} been excluded from this update.`

  if (input.continueHint) {
    return `${base} ${input.continueHint}`
  }

  return base
}

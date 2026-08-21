import { USAGE_BLOCKER_SOURCE_KEYS, type UsageBlockerSourceKey } from '@rpg/contracts'

import { formatCountPhrase, formatDescriptorCount, type BulkActionDescriptor } from '@/lib/actions'

export type UsageBlockerCopyContext = {
  blockedTargetCount: number
  wouldChangeCount?: number
  descriptor?: BulkActionDescriptor
  eligibleCount?: number
  mode?: 'bulk-partial' | 'bulk-all' | 'single'
}

export type UsageBlockerCopyRegistryEntry = {
  formatConflictReason: (ctx: UsageBlockerCopyContext) => string
  formatItemSummary: (referenceCount: number) => string
  formatResolution: (ctx: UsageBlockerCopyContext) => string
}

function requireDescriptor(ctx: UsageBlockerCopyContext): BulkActionDescriptor {
  return ctx.descriptor ?? { nounSingular: 'item', nounPlural: 'items' }
}

function formatBlockedOfWouldChangeClause(ctx: UsageBlockerCopyContext, predicate: string): string {
  const descriptor = requireDescriptor(ctx)
  const blockedPhrase = formatDescriptorCount(ctx.blockedTargetCount, descriptor)
  const wouldChangePhrase =
    ctx.wouldChangeCount != null
      ? formatDescriptorCount(ctx.wouldChangeCount, descriptor)
      : blockedPhrase

  return `${blockedPhrase} of ${wouldChangePhrase} that would change ${predicate}`
}

const USAGE_BLOCKER_COPY_REGISTRY: Record<UsageBlockerSourceKey, UsageBlockerCopyRegistryEntry> = {
  [USAGE_BLOCKER_SOURCE_KEYS.character_usage]: {
    formatConflictReason: (ctx) =>
      `${formatBlockedOfWouldChangeClause(ctx, 'are referenced by active characters')}.`,
    formatItemSummary: (referenceCount) =>
      formatCountPhrase(referenceCount, {
        zero: 'Referenced by 0 active characters',
        one: 'Referenced by 1 active character',
        many: `Referenced by ${referenceCount} active characters`,
      }),
    formatResolution: () => 'Remove the character references',
  },
  [USAGE_BLOCKER_SOURCE_KEYS.location_parent]: {
    formatConflictReason: (ctx) =>
      `${formatBlockedOfWouldChangeClause(ctx, 'are referenced by other locations')}.`,
    formatItemSummary: (referenceCount) =>
      formatCountPhrase(referenceCount, {
        zero: 'Parent of 0 locations',
        one: 'Parent of 1 location',
        many: `Parent of ${referenceCount} locations`,
      }),
    formatResolution: () => 'Move the child locations to another parent',
  },
  [USAGE_BLOCKER_SOURCE_KEYS.campaign_primary_world]: {
    formatConflictReason: (ctx) =>
      `${formatBlockedOfWouldChangeClause(ctx, 'are the primary world for active campaigns')}.`,
    formatItemSummary: (referenceCount) =>
      formatCountPhrase(referenceCount, {
        zero: 'Primary world for 0 campaigns',
        one: 'Primary world for 1 campaign',
        many: `Primary world for ${referenceCount} campaigns`,
      }),
    formatResolution: () => 'Choose a different primary world',
  },
  [USAGE_BLOCKER_SOURCE_KEYS.unknown]: {
    formatConflictReason: (ctx) => {
      if (ctx.mode === 'single') {
        return 'Referenced by other items.'
      }

      const descriptor = requireDescriptor(ctx)
      const blockedPhrase = formatDescriptorCount(ctx.blockedTargetCount, descriptor)
      const wouldChangePhrase =
        ctx.wouldChangeCount != null
          ? formatDescriptorCount(ctx.wouldChangeCount, descriptor)
          : blockedPhrase

      return `${blockedPhrase} of ${wouldChangePhrase} are referenced by other items.`
    },
    formatItemSummary: (referenceCount) =>
      formatCountPhrase(referenceCount, {
        zero: 'Referenced by 0 items',
        one: 'Referenced by 1 item',
        many: `Referenced by ${referenceCount} items`,
      }),
    formatResolution: () => 'Review the references before continuing',
  },
}

const MIXED_USAGE_BLOCKER_COPY: UsageBlockerCopyRegistryEntry = {
  formatConflictReason: (ctx) => {
    const descriptor = requireDescriptor(ctx)
    const blockedPhrase = formatDescriptorCount(ctx.blockedTargetCount, descriptor)
    const wouldChangePhrase =
      ctx.wouldChangeCount != null
        ? formatDescriptorCount(ctx.wouldChangeCount, descriptor)
        : blockedPhrase

    return `${blockedPhrase} of ${wouldChangePhrase} are still referenced and cannot be updated.`
  },
  formatItemSummary: (referenceCount) =>
    formatCountPhrase(referenceCount, {
      zero: 'Referenced by 0 items',
      one: 'Referenced by 1 item',
      many: `Referenced by ${referenceCount} items`,
    }),
  formatResolution: () => 'Review the references before continuing',
}

export function resolveUsageBlockerCopyEntry(
  sourceKeys: readonly UsageBlockerSourceKey[],
): UsageBlockerCopyRegistryEntry {
  if (sourceKeys.length === 1 && sourceKeys[0]) {
    return USAGE_BLOCKER_COPY_REGISTRY[sourceKeys[0]]
  }

  return MIXED_USAGE_BLOCKER_COPY
}

export function formatUsageBlockerItemSummary(
  sourceKey: UsageBlockerSourceKey,
  referenceCount: number,
): string {
  return USAGE_BLOCKER_COPY_REGISTRY[sourceKey].formatItemSummary(referenceCount)
}

export type FormatUsageBlockerBulkDescriptionInput = UsageBlockerCopyContext & {
  sourceKeys: readonly UsageBlockerSourceKey[]
}

export function formatUsageBlockerBulkDescription(
  input: FormatUsageBlockerBulkDescriptionInput,
): string {
  const entry = resolveUsageBlockerCopyEntry(input.sourceKeys)
  const conflictReason = entry.formatConflictReason(input)
  const resolution = entry.formatResolution(input)
  const excluded = 'They have been excluded from this update.'

  if (input.mode === 'bulk-all' || (input.eligibleCount ?? 0) === 0) {
    return `${conflictReason} ${excluded} ${resolution} before trying again.`
  }

  const descriptor = requireDescriptor(input)
  const continueClause = `or continue with ${formatDescriptorCount(input.eligibleCount ?? 0, descriptor)}.`

  return `${conflictReason} ${excluded} ${resolution}, ${continueClause}`
}

export { USAGE_BLOCKER_COPY_REGISTRY, MIXED_USAGE_BLOCKER_COPY }

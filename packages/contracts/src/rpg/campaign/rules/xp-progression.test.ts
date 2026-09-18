import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { formatFieldMessage } from '../../../validation/define-message'
import {
  computeXpThresholdsSparsePatch,
  formatXpThresholdDerivedCallout,
  formatXpThresholdsSummary,
  normalizeXpThresholdOverrides,
  refineEffectiveXpProgression,
  resolveDerivedMinimumXpThreshold,
  resolveEffectiveXpProgression,
  resolveXpThresholdDerivedPresentation,
  resolveXpThresholdEditorState,
  resolveXpThresholdsSummary,
  validateXpThresholdExplicitValue,
  xpThresholdOverrideEntriesSchema,
  xpThresholdsPatchSchema,
} from './xp-progression'

const SYSTEM_ENTRIES = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 300 },
  { level: 3, xpRequired: 900 },
  { level: 4, xpRequired: 2700 },
  { level: 5, xpRequired: 6500 },
  { level: 6, xpRequired: 14000 },
  { level: 7, xpRequired: 23000 },
  { level: 8, xpRequired: 34000 },
  { level: 9, xpRequired: 48000 },
  { level: 10, xpRequired: 64000 },
  { level: 11, xpRequired: 85000 },
  { level: 12, xpRequired: 100000 },
  { level: 13, xpRequired: 120000 },
  { level: 14, xpRequired: 140000 },
  { level: 15, xpRequired: 165000 },
  { level: 16, xpRequired: 195000 },
  { level: 17, xpRequired: 225000 },
  { level: 18, xpRequired: 265000 },
  { level: 19, xpRequired: 305000 },
  { level: 20, xpRequired: 355000 },
] as const

function resolve(input: {
  overrides?: Array<{ level: number; xpRequired: number }>
  effectiveMaxLevel: number
}) {
  return resolveEffectiveXpProgression({
    systemEntries: SYSTEM_ENTRIES,
    overrides: input.overrides,
    effectiveMaxLevel: input.effectiveMaxLevel,
  })
}

describe('resolveEffectiveXpProgression', () => {
  it('returns system defaults for 20 levels with no overrides', () => {
    const effective = resolve({ effectiveMaxLevel: 20 })
    expect(effective).toHaveLength(20)
    expect(effective[0]).toMatchObject({ level: 1, xpRequired: 0, provenance: 'system' })
    expect(effective[19]).toMatchObject({ level: 20, xpRequired: 355_000, provenance: 'system' })
  })

  it('derives levels 21–25 when extended max is 25', () => {
    const effective = resolve({ effectiveMaxLevel: 25 })
    expect(effective[20]).toMatchObject({ level: 21, xpRequired: 405_000, provenance: 'derived' })
    expect(effective[21]).toMatchObject({ level: 22, xpRequired: 455_000, provenance: 'derived' })
    expect(effective[24]).toMatchObject({ level: 25, xpRequired: 605_000, provenance: 'derived' })
  })

  it('continues derivation from the latest effective delta after an explicit extended level', () => {
    const effective = resolve({
      effectiveMaxLevel: 23,
      overrides: [{ level: 21, xpRequired: 420_000 }],
    })
    expect(effective[20]).toMatchObject({ level: 21, xpRequired: 420_000, provenance: 'override' })
    expect(effective[21]).toMatchObject({ level: 22, xpRequired: 485_000, provenance: 'derived' })
    expect(effective[22]).toMatchObject({ level: 23, xpRequired: 550_000, provenance: 'derived' })
  })

  it('uses delta continuation, not carry-forward', () => {
    const effective = resolve({ effectiveMaxLevel: 22 })
    const level21 = effective[20]
    const level22 = effective[21]
    expect(level21).toBeDefined()
    expect(level22).toBeDefined()
    expect(level22!.xpRequired - level21!.xpRequired).toBe(50_000)
    expect(level22!.xpRequired).not.toBe(level21!.xpRequired)
  })
})

describe('resolveXpThresholdsSummary', () => {
  it('reports system default for untouched 20-level progression', () => {
    const summary = resolveXpThresholdsSummary({
      systemEntries: SYSTEM_ENTRIES,
      effectiveMaxLevel: 20,
    })
    expect(summary.status).toBe('system_default')
    expect(summary.label).toBe('20 levels · System default')
  })

  it('reports derived attention when extended levels rely on fallback', () => {
    const summary = resolveXpThresholdsSummary({
      systemEntries: SYSTEM_ENTRIES,
      effectiveMaxLevel: 25,
    })
    expect(summary.status).toBe('derived')
    expect(summary.derivedCount).toBe(5)
    expect(summary.label).toBe('25 levels · 5 thresholds derived')
  })

  it('prefers derived status when standard overrides coexist with derived extended levels', () => {
    const summary = resolveXpThresholdsSummary({
      systemEntries: SYSTEM_ENTRIES,
      overrides: [{ level: 5, xpRequired: 7000 }],
      effectiveMaxLevel: 25,
    })
    expect(summary.status).toBe('derived')
  })

  it('reports campaign override when all active levels are explicit or system', () => {
    const summary = resolveXpThresholdsSummary({
      systemEntries: SYSTEM_ENTRIES,
      overrides: [
        { level: 21, xpRequired: 420_000 },
        { level: 22, xpRequired: 485_000 },
        { level: 23, xpRequired: 550_000 },
        { level: 24, xpRequired: 615_000 },
        { level: 25, xpRequired: 680_000 },
      ],
      effectiveMaxLevel: 25,
    })
    expect(summary.status).toBe('campaign_override')
    expect(summary.label).toBe('25 levels · Campaign override')
  })
})

describe('normalizeXpThresholdOverrides', () => {
  it('drops overrides that match the system value for standard levels', () => {
    expect(normalizeXpThresholdOverrides([{ level: 5, xpRequired: 6500 }], SYSTEM_ENTRIES)).toEqual(
      [],
    )
  })

  it('keeps overrides above the active max as dormant storage', () => {
    const overrides = [{ level: 25, xpRequired: 680_000 }]
    expect(normalizeXpThresholdOverrides(overrides, SYSTEM_ENTRIES)).toEqual(overrides)
  })
})

describe('computeXpThresholdsSparsePatch', () => {
  it('returns undefined when overrides match system values only', () => {
    expect(
      computeXpThresholdsSparsePatch([{ level: 5, xpRequired: 6500 }], SYSTEM_ENTRIES),
    ).toBeUndefined()
  })

  it('returns sparse patch for genuine customization', () => {
    expect(
      computeXpThresholdsSparsePatch([{ level: 5, xpRequired: 7000 }], SYSTEM_ENTRIES),
    ).toEqual({ entries: [{ level: 5, xpRequired: 7000 }] })
  })
})

describe('xpThresholdsPatchSchema', () => {
  it('rejects level 1 overrides', () => {
    expect(xpThresholdOverrideEntriesSchema.safeParse([{ level: 1, xpRequired: 0 }]).success).toBe(
      false,
    )
  })

  it('rejects duplicate override levels', () => {
    expect(
      xpThresholdsPatchSchema.safeParse({
        entries: [
          { level: 5, xpRequired: 7000 },
          { level: 5, xpRequired: 8000 },
        ],
      }).success,
    ).toBe(false)
  })
})

describe('formatXpThresholdsSummary', () => {
  it('formats singular derived threshold', () => {
    expect(
      formatXpThresholdsSummary({
        levelCount: 21,
        status: 'derived',
        derivedCount: 1,
      }),
    ).toBe('21 levels · 1 threshold derived')
  })
})

describe('resolveXpThresholdDerivedPresentation', () => {
  it('returns undefined when no derived rows are active', () => {
    expect(
      resolveXpThresholdDerivedPresentation({
        systemEntries: SYSTEM_ENTRIES,
        effectiveMaxLevel: 20,
      }),
    ).toBeUndefined()
  })

  it('groups extended derived levels with increment and tier name', () => {
    const presentation = resolveXpThresholdDerivedPresentation(
      { systemEntries: SYSTEM_ENTRIES, effectiveMaxLevel: 25 },
      { extendedStartsAt: 21, extendedTierName: 'Epic Destiny' },
    )

    expect(presentation).toEqual({
      derivedCount: 5,
      segments: [
        {
          startLevel: 21,
          endLevel: 25,
          increment: 50_000,
          extendedTierName: 'Epic Destiny',
        },
      ],
    })
  })

  it('formats generic callout copy when tier name is missing', () => {
    const presentation = resolveXpThresholdDerivedPresentation({
      systemEntries: SYSTEM_ENTRIES,
      effectiveMaxLevel: 25,
    })
    const callout = formatXpThresholdDerivedCallout(presentation!)

    expect(callout.title).toBe('5 thresholds are derived')
    expect(callout.description).toContain(
      'Levels 21–25 continue the latest XP increase of 50,000 XP per level.',
    )
    expect(callout.description).toContain(
      'Each derived value is also the minimum allowed threshold for that level.',
    )
    expect(callout.description).toContain(
      'Edit a value to make it explicit; later derived values recalculate from the new progression.',
    )
    expect(callout.description).not.toContain(' in Epic Destiny ')
  })

  it('formats tier-aware callout copy when tier name is available', () => {
    const presentation = resolveXpThresholdDerivedPresentation(
      { systemEntries: SYSTEM_ENTRIES, effectiveMaxLevel: 25 },
      { extendedStartsAt: 21, extendedTierName: 'Epic Destiny' },
    )
    const callout = formatXpThresholdDerivedCallout(presentation!)

    expect(callout.description).toContain(
      'Levels 21–25 in Epic Destiny continue the latest XP increase of 50,000 XP per level.',
    )
  })

  it('splits non-contiguous derived runs after an explicit override', () => {
    const presentation = resolveXpThresholdDerivedPresentation(
      {
        systemEntries: SYSTEM_ENTRIES,
        overrides: [{ level: 22, xpRequired: 470_000 }],
        effectiveMaxLevel: 25,
      },
      { extendedStartsAt: 21, extendedTierName: 'Epic Destiny' },
    )

    expect(presentation?.segments).toEqual([
      {
        startLevel: 21,
        endLevel: 21,
        increment: 50_000,
        extendedTierName: 'Epic Destiny',
      },
      {
        startLevel: 23,
        endLevel: 25,
        increment: 65_000,
        extendedTierName: 'Epic Destiny',
      },
    ])
  })

  it('uses the updated increment after an explicit extended override', () => {
    const presentation = resolveXpThresholdDerivedPresentation({
      systemEntries: SYSTEM_ENTRIES,
      overrides: [{ level: 21, xpRequired: 420_000 }],
      effectiveMaxLevel: 23,
    })

    expect(presentation?.segments).toEqual([
      {
        startLevel: 22,
        endLevel: 23,
        increment: 65_000,
      },
    ])
  })
})

describe('refineEffectiveXpProgression', () => {
  it('untouched SRD 1–20 progression passes validation with no issues', () => {
    const schema = z.object({}).superRefine((_value, ctx) => {
      refineEffectiveXpProgression({ systemEntries: SYSTEM_ENTRIES, effectiveMaxLevel: 20 }, ctx)
    })

    expect(schema.safeParse({}).success).toBe(true)
  })

  it('rejects extended overrides below the derived minimum', () => {
    const schema = z.object({}).superRefine((_value, ctx) => {
      refineEffectiveXpProgression(
        {
          systemEntries: SYSTEM_ENTRIES,
          overrides: [{ level: 21, xpRequired: 380_000 }],
          effectiveMaxLevel: 25,
        },
        ctx,
      )
    })

    const result = schema.safeParse({})
    expect(result.success).toBe(false)
    if (result.success) return
    expect(formatFieldMessage(result.error.issues[0]!.message)).toBe('Enter 405,000 or more.')
  })

  it('allows standard overrides with decreasing deltas versus the source table', () => {
    const schema = z.object({}).superRefine((_value, ctx) => {
      refineEffectiveXpProgression(
        {
          systemEntries: SYSTEM_ENTRIES,
          overrides: [{ level: 12, xpRequired: 95_000 }],
          effectiveMaxLevel: 20,
        },
        ctx,
      )
    })

    expect(schema.safeParse({}).success).toBe(true)
  })
})

describe('resolveDerivedMinimumXpThreshold', () => {
  it('continues the latest effective delta for extended levels', () => {
    const preceding = resolve({ effectiveMaxLevel: 20 })
    expect(resolveDerivedMinimumXpThreshold(21, preceding)).toBe(405_000)
  })
})

describe('validateXpThresholdExplicitValue', () => {
  it('requires extended explicit values to meet the derived minimum', () => {
    const preceding = resolve({ effectiveMaxLevel: 20 })
    const result = validateXpThresholdExplicitValue({
      level: 21,
      xpRequired: 380_000,
      precedingEffective: preceding,
      systemEntries: SYSTEM_ENTRIES,
    })

    expect(result.valid).toBe(false)
    if (result.valid) return
    expect(formatFieldMessage(result.message)).toBe('Enter 405,000 or more.')
  })

  it('allows standard overrides that remain strictly increasing', () => {
    const preceding = resolve({ effectiveMaxLevel: 11 })
    const result = validateXpThresholdExplicitValue({
      level: 12,
      xpRequired: 95_000,
      precedingEffective: preceding,
      systemEntries: SYSTEM_ENTRIES,
    })

    expect(result).toEqual({ valid: true })
  })
})

describe('resolveXpThresholdEditorState', () => {
  it('blocks downstream rows after the first invalid extended level', () => {
    const rows = resolveXpThresholdEditorState({
      systemEntries: SYSTEM_ENTRIES,
      effectiveMaxLevel: 28,
      explicitDraftValuesByLevel: new Map([[25, 500_000]]),
    })

    const level25 = rows.find((row) => row.level === 25)
    const level26 = rows.find((row) => row.level === 26)
    const level27 = rows.find((row) => row.level === 27)

    expect(level25?.progressionError).toBeDefined()
    expect(level26).toMatchObject({
      readOnly: true,
      blockedByLevel: 25,
      displayPlaceholder: '—',
    })
    expect(formatFieldMessage(level26!.blockedHint!)).toBe('Resolve level 25 to continue')
    expect(level27?.blockedHint).toBeUndefined()
  })

  it('restores downstream derived placeholders after upstream correction', () => {
    const invalid = resolveXpThresholdEditorState({
      systemEntries: SYSTEM_ENTRIES,
      effectiveMaxLevel: 26,
      explicitDraftValuesByLevel: new Map([[25, 500_000]]),
    })
    const valid = resolveXpThresholdEditorState({
      systemEntries: SYSTEM_ENTRIES,
      effectiveMaxLevel: 26,
      explicitDraftValuesByLevel: new Map([[25, 605_000]]),
    })

    expect(invalid.find((row) => row.level === 26)?.displayPlaceholder).toBe('—')
    expect(valid.find((row) => row.level === 26)?.displayPlaceholder).toBe('655,000')
  })

  it('preserves explicit downstream draft values while blocked without independent errors', () => {
    const rows = resolveXpThresholdEditorState({
      systemEntries: SYSTEM_ENTRIES,
      effectiveMaxLevel: 27,
      explicitDraftValuesByLevel: new Map([
        [25, 500_000],
        [26, 680_000],
      ]),
    })

    const level26 = rows.find((row) => row.level === 26)
    expect(level26).toMatchObject({
      readOnly: true,
      blockedByLevel: 25,
    })
    expect(level26?.progressionError).toBeUndefined()
  })

  it('does not block downstream rows for uncommitted invalid explicit values', () => {
    const rows = resolveXpThresholdEditorState({
      systemEntries: SYSTEM_ENTRIES,
      effectiveMaxLevel: 28,
      explicitDraftValuesByLevel: new Map([[25, 500_000]]),
      committedDraftLevels: new Set<number>(),
    })

    const level25 = rows.find((row) => row.level === 25)
    const level26 = rows.find((row) => row.level === 26)

    expect(level25?.progressionError).toBeUndefined()
    expect(level26?.blockedByLevel).toBeUndefined()
    expect(level26?.displayPlaceholder).toBe('655,000')
  })
})

import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '@rpg/contracts'

import {
  buildXpThresholdsDraft,
  buildXpThresholdsHostConfig,
  mapXpThresholdsDraftToOverrides,
  parseXpThresholdCellDraft,
  resolveSystemXpEntries,
  resolveXpThresholdCellPresentation,
  resolveXpThresholdRowPresentation,
  resolveXpThresholdsValuesNotice,
  validateXpThresholdsDraft,
} from './xp-thresholds-field.lib'

const SYSTEM_ENTRIES = resolveSystemXpEntries('srd-cc-5.2.1')

describe('xp thresholds field lib', () => {
  it('leaves derived extended levels blank in the draft', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })

    expect(draft.rows).toHaveLength(25)
    expect(draft.rows[20]?.cells[draft.columns[0]!.key]).toBeUndefined()
  })

  it('maps filled draft cells to explicit overrides including matching derived values', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })
    const columnKey = draft.columns[0]!.key
    draft.rows[20]!.cells[columnKey] = '405000'

    const overrides = mapXpThresholdsDraftToOverrides(draft, SYSTEM_ENTRIES, [], 25)
    expect(overrides).toContainEqual({ level: 21, xpRequired: 405000 })
  })

  it('preserves dormant overrides above the active max', () => {
    const dormant = [{ level: 25, xpRequired: 680000 }]
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 20,
      systemEntries: SYSTEM_ENTRIES,
      overrides: dormant,
    })

    const overrides = mapXpThresholdsDraftToOverrides(draft, SYSTEM_ENTRIES, dormant, 20)
    expect(overrides).toContainEqual({ level: 25, xpRequired: 680000 })
  })

  it('returns provenanceBadge for blank derived cells', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })
    const config = buildXpThresholdsHostConfig({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      dormantOverrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    const presentation = resolveXpThresholdCellPresentation(
      {
        draft,
        rowIndex: 20,
        level: 21,
        columnKey: draft.columns[0]!.key,
        draftValue: undefined,
      },
      SYSTEM_ENTRIES,
      [],
      25,
    )

    expect(presentation).toMatchObject({
      placeholder: '405,000',
      provenanceBadge: 'derived',
      formatGrouped: true,
    })
    expect(config.extendedProgression).toEqual({
      standardMaxLevel: 20,
      tierName: 'Epic Destiny',
    })
  })

  it('builds derived callout copy from the current draft snapshot', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
      extendedProgressionEnabled: true,
      maxCharacterLevel: 20,
      extendedTierName: 'Epic Destiny',
    })

    const notice = resolveXpThresholdsValuesNotice(draft, SYSTEM_ENTRIES, [], 25, {
      extendedStartsAt: 21,
      extendedTierName: 'Epic Destiny',
    })

    expect(notice?.title).toBe('5 thresholds are derived')
    expect(notice?.description).toContain(
      'Levels 21–25 in Epic Destiny continue the latest XP increase of 50,000 XP per level.',
    )
    expect(notice?.description).toContain(
      'Each derived value is also the minimum allowed threshold for that level.',
    )
  })

  it('recomputes later derived placeholders after an explicit extended edit', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 23,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [{ level: 21, xpRequired: 420000 }],
    })
    const columnKey = draft.columns[0]!.key
    const presentation = buildXpThresholdsDraft({
      effectiveMaxLevel: 23,
      systemEntries: SYSTEM_ENTRIES,
      overrides: mapXpThresholdsDraftToOverrides(draft, SYSTEM_ENTRIES, [], 23),
    })

    expect(presentation.rows[21]?.cells[columnKey]).toBeUndefined()
    expect(presentation.rows[22]?.cells[columnKey]).toBeUndefined()
  })

  it('parses grouped and plain XP cell drafts', () => {
    expect(parseXpThresholdCellDraft('405000')).toBe(405000)
    expect(parseXpThresholdCellDraft('405,000')).toBe(405000)
  })

  it('returns structured validation errors for invalid extended thresholds', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })
    const columnKey = draft.columns[0]!.key
    draft.rows[24]!.cells[columnKey] = '500000'

    const result = validateXpThresholdsDraft(draft, SYSTEM_ENTRIES, [], 25)
    expect(result.valid).toBe(false)
    if (result.valid) return
    expect(formatFieldMessage(result.errors[0]!.message)).toBe('Enter 605,000 or more.')
  })

  it('maps row blocking state from the editor resolver when the invalid level is committed', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 27,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })
    const columnKey = draft.columns[0]!.key
    draft.rows[24]!.cells[columnKey] = '500000'

    const rowPresentation = resolveXpThresholdRowPresentation(
      {
        draft,
        rowIndex: 25,
        level: 26,
        committedDraftLevels: new Set([25]),
      },
      SYSTEM_ENTRIES,
      [],
      27,
    )

    expect(rowPresentation).toMatchObject({
      readOnly: true,
      blockedByLevel: 25,
    })
    expect(rowPresentation?.blockedHint).toBeDefined()
  })

  it('does not block downstream rows while an invalid explicit value is uncommitted', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 27,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })
    const columnKey = draft.columns[0]!.key
    draft.rows[24]!.cells[columnKey] = '500000'

    const rowPresentation = resolveXpThresholdRowPresentation(
      {
        draft,
        rowIndex: 25,
        level: 26,
        committedDraftLevels: new Set<number>(),
      },
      SYSTEM_ENTRIES,
      [],
      27,
    )

    expect(rowPresentation?.blockedByLevel).toBeUndefined()
    expect(rowPresentation?.blockedHint).toBeUndefined()
  })

  it('formats filled draft values for preview surfaces', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })
    const columnKey = draft.columns[0]!.key
    draft.rows[20]!.cells[columnKey] = '405000'

    const presentation = resolveXpThresholdCellPresentation(
      {
        draft,
        rowIndex: 20,
        level: 21,
        columnKey,
        draftValue: '405000',
      },
      SYSTEM_ENTRIES,
      [],
      25,
    )

    expect(presentation?.formattedValue).toBe('405,000')
  })

  it('shows em dash placeholders for blocked derived cells', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 27,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })
    const columnKey = draft.columns[0]!.key
    draft.rows[24]!.cells[columnKey] = '500000'

    const presentation = resolveXpThresholdCellPresentation(
      {
        draft,
        rowIndex: 25,
        level: 26,
        columnKey,
        draftValue: undefined,
      },
      SYSTEM_ENTRIES,
      [],
      27,
    )

    expect(presentation?.placeholder).toBe('—')
  })

  it('surfaces progression errors on filled invalid extended cells', () => {
    const draft = buildXpThresholdsDraft({
      effectiveMaxLevel: 25,
      systemEntries: SYSTEM_ENTRIES,
      overrides: [],
    })
    const columnKey = draft.columns[0]!.key
    draft.rows[24]!.cells[columnKey] = '500000'

    const presentation = resolveXpThresholdCellPresentation(
      {
        draft,
        rowIndex: 24,
        level: 25,
        columnKey,
        draftValue: '500000',
      },
      SYSTEM_ENTRIES,
      [],
      25,
    )

    expect(presentation?.progressionError).toBeDefined()
    expect(formatFieldMessage(presentation!.progressionError!)).toBe('Enter 605,000 or more.')
  })
})

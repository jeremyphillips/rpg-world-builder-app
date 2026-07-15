import { describe, expect, it } from 'vitest'

import {
  BURNING_HANDS_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  FIREBALL_RESOLUTION,
} from './fixtures'
import { formatResolutionSummary } from './format-summary'
import { formatResolutionSelectionSections, RESOLUTION_AFFECTED_AREA_COPY } from './format-target'
import { spellResolutionSchema } from './schema'

describe('formatResolutionSelectionSections', () => {
  it('formats targets mode with singular heading', () => {
    const sections = formatResolutionSelectionSections(CURE_WOUNDS_RESOLUTION)
    expect(sections).toEqual([{ heading: 'Target', lines: ['One creature you touch'] }])
  })

  it('formats self mode without area as Recipient', () => {
    const sections = formatResolutionSelectionSections(FALSE_LIFE_RESOLUTION)
    expect(sections).toEqual([{ heading: 'Recipient', lines: ['You'] }])
  })

  it('formats self mode with area as Origin plus Area and Affected', () => {
    const sections = formatResolutionSelectionSections(BURNING_HANDS_RESOLUTION)
    expect(sections.map((section) => section.heading)).toEqual(['Origin', 'Area', 'Affected'])
    expect(sections[0]?.lines).toEqual(['You'])
    expect(sections[2]?.lines).toEqual([RESOLUTION_AFFECTED_AREA_COPY])
  })

  it('formats point mode with origin, area, and affected rows', () => {
    const sections = formatResolutionSelectionSections(FIREBALL_RESOLUTION)
    expect(sections.map((section) => section.heading)).toEqual(['Origin', 'Area', 'Affected'])
    expect(sections[0]?.lines[0]).toContain('150 feet')
    expect(sections[1]?.lines[0]).toContain('20-ft-radius sphere')
  })
})

describe('formatResolutionSummary selection headings', () => {
  it('uses Recipient for self without area', () => {
    expect(formatResolutionSummary(FALSE_LIFE_RESOLUTION)).toContain('Recipient')
    expect(formatResolutionSummary(FALSE_LIFE_RESOLUTION)).not.toContain('Target')
  })

  it('uses Origin for caster-origin area spells', () => {
    const summary = formatResolutionSummary(BURNING_HANDS_RESOLUTION)
    expect(summary).toContain('Origin')
    expect(summary).not.toContain('Recipient')
    expect(summary).toContain('Affected')
  })

  it('uses Origin for point-selected area spells', () => {
    const summary = formatResolutionSummary(FIREBALL_RESOLUTION)
    expect(summary).toContain('Origin')
    expect(summary).toContain('Area')
    expect(summary).toContain('Affected')
  })
})

describe('legacy resolution normalization on parse', () => {
  it('maps target.self to selectionMode self without target', () => {
    const parsed = spellResolutionSchema.parse({
      target: {
        count: 1,
        kind: 'creature',
        proximity: { kind: 'self' },
      },
      method: { kind: 'automatic' },
      effects: FALSE_LIFE_RESOLUTION.effects,
      outcomes: FALSE_LIFE_RESOLUTION.outcomes,
    })

    expect(parsed.selectionMode).toBe('self')
    expect(parsed.target).toBeUndefined()
  })
})

import { describe, expect, it } from 'vitest'

import {
  creatureFormSizesDiffer,
  resolveCreatureFormsContext,
  resolveCreatureFormStatistics,
} from './forms'

describe('creature form size resolution', () => {
  it('uses only the base sizes or the nested alternate override', () => {
    expect(resolveCreatureFormStatistics({ sizes: ['medium'], movement: { walk: 30 } })).toEqual({
      sizes: ['medium'],
      movement: { speeds: { walk: 30 }, hover: false },
      canSpeak: true,
    })
    expect(
      resolveCreatureFormStatistics(
        { sizes: ['medium'], movement: { walk: 30 } },
        { overrides: { sizes: ['small', 'tiny'] } },
      ),
    ).toEqual({
      sizes: ['small', 'tiny'],
      movement: { speeds: { walk: 30 }, hover: false },
      canSpeak: true,
    })
  })

  it('compares size sets independently of their order', () => {
    expect(creatureFormSizesDiffer(['small', 'medium'], ['medium', 'small'])).toBe(false)
    expect(creatureFormSizesDiffer(['small'], ['medium'])).toBe(true)
  })

  it('resolves stable profile identity and excludes a designated defined true form', () => {
    const context = resolveCreatureFormsContext(
      {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid', overrides: { sizes: ['large'] } },
          { id: 'bear', name: 'Bear', overrides: { sizes: ['large'] } },
        ],
      },
      'Werebear',
    )
    expect(context.status).toBe('complete')
    expect(context.trueForm?.id).toBe('humanoid')
    expect(context.alternateDestinations.map((form) => form.id)).toEqual(['bear'])
    expect(context.eligibleForms.map((form) => form.id)).toEqual(['humanoid', 'bear'])
    expect(
      resolveCreatureFormStatistics(
        { sizes: ['medium'], movement: { walk: 30 } },
        context.trueForm?.form,
        {
          usesBaseStatistics: context.trueForm?.usesBaseStatistics,
        },
      ),
    ).toEqual({
      sizes: ['medium'],
      movement: { speeds: { walk: 30 }, hover: false },
      canSpeak: true,
    })
  })

  it('does not fall back to profile for unresolved defined designation', () => {
    const context = resolveCreatureFormsContext(
      {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'missing' },
        definedForms: [{ id: 'bear', name: 'Bear' }],
      },
      'Werebear',
    )
    expect(context.status).toBe('missing')
    expect(context.trueForm).toBeUndefined()
    expect(context.alternateDestinations).toEqual([])
  })

  it('returns an invalid context for a superseded persisted shape', () => {
    const context = resolveCreatureFormsContext(
      {
        trueForm: { id: 'humanoid', name: 'Humanoid' },
        alternates: [{ id: 'bear', name: 'Bear' }],
      } as never,
      'Werebear',
    )

    expect(context).toMatchObject({
      status: 'invalid',
      profile: undefined,
      trueForm: undefined,
      alternateDestinations: [],
    })
  })
})

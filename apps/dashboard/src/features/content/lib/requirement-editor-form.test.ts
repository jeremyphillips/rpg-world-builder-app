import { describe, expect, it } from 'vitest'
import { loadSeedFeats } from '@rpg/catalog/feats'
import { formatRequirementExpression, type RequirementExpression } from '@rpg/contracts'

import {
  formatRequirementEditorPreview,
  newRequirementGroup,
  newRequirementLeaf,
  prerequisiteEditorSchema,
  requirementEditorDefaultValue,
  requirementEditorToExpression,
  requirementExpressionToEditor,
  type PrerequisiteEditorValue,
} from './requirement-editor-form'

const SRD_FEATS = loadSeedFeats('srd-cc-5.2.1')

describe('requirementEditorDefaultValue', () => {
  it('returns an empty groups array', () => {
    expect(requirementEditorDefaultValue()).toEqual({ groups: [] })
  })
})

describe('requirementEditorToExpression', () => {
  it('returns undefined for empty editor state', () => {
    expect(requirementEditorToExpression({ groups: [] })).toBeUndefined()
  })

  it('serializes a single minLevel leaf as a bare root leaf', () => {
    const expression = requirementEditorToExpression({
      groups: [
        {
          id: 'group-1',
          kind: 'all',
          requirements: [{ id: 'leaf-1', type: 'minLevel', level: 4 }],
        },
      ],
    })
    expect(expression).toEqual({ kind: 'minLevel', level: 4 })
  })

  it('serializes one AND group with multiple leaves as root all', () => {
    const expression = requirementEditorToExpression({
      groups: [
        {
          id: 'group-1',
          kind: 'all',
          requirements: [
            { id: 'leaf-1', type: 'minLevel', level: 19 },
            { id: 'leaf-2', type: 'spellcasting' },
          ],
        },
      ],
    })
    expect(expression).toEqual({
      kind: 'all',
      requirements: [{ kind: 'minLevel', level: 19 }, { kind: 'spellcasting' }],
    })
  })

  it('serializes an OR group as root any', () => {
    const expression = requirementEditorToExpression({
      groups: [
        {
          id: 'group-1',
          kind: 'any',
          requirements: [
            { id: 'leaf-1', type: 'abilityMinimum', ability: 'str', minimum: 13 },
            { id: 'leaf-2', type: 'abilityMinimum', ability: 'dex', minimum: 13 },
          ],
        },
      ],
    })
    expect(expression).toEqual({
      kind: 'any',
      requirements: [
        { kind: 'abilityMinimum', ability: 'str', minimum: 13 },
        { kind: 'abilityMinimum', ability: 'dex', minimum: 13 },
      ],
    })
  })

  it('serializes multiple top-level groups with implicit AND', () => {
    const expression = requirementEditorToExpression({
      groups: [
        {
          id: 'group-1',
          kind: 'all',
          requirements: [{ id: 'leaf-1', type: 'minLevel', level: 4 }],
        },
        {
          id: 'group-2',
          kind: 'any',
          requirements: [
            { id: 'leaf-2', type: 'abilityMinimum', ability: 'str', minimum: 13 },
            { id: 'leaf-3', type: 'abilityMinimum', ability: 'dex', minimum: 13 },
          ],
        },
      ],
    })
    expect(expression).toEqual({
      kind: 'all',
      requirements: [
        { kind: 'minLevel', level: 4 },
        {
          kind: 'any',
          requirements: [
            { kind: 'abilityMinimum', ability: 'str', minimum: 13 },
            { kind: 'abilityMinimum', ability: 'dex', minimum: 13 },
          ],
        },
      ],
    })
  })
})

describe('requirementExpressionToEditor', () => {
  it('returns empty groups when prerequisite is omitted', () => {
    expect(requirementExpressionToEditor(undefined)).toEqual({ groups: [] })
  })

  it('maps a bare minLevel leaf to one AND group', () => {
    const editor = requirementExpressionToEditor({ kind: 'minLevel', level: 4 })
    expect(editor.groups).toHaveLength(1)
    expect(editor.groups[0]?.kind).toBe('all')
    expect(editor.groups[0]?.requirements).toEqual([
      expect.objectContaining({ type: 'minLevel', level: 4 }),
    ])
  })

  it('maps Grappler to level AND group plus ability OR group', () => {
    const grappler = SRD_FEATS.find((feat) => feat.slug === 'grappler')!
    const editor = requirementExpressionToEditor(grappler.prerequisite)
    expect(editor.groups).toHaveLength(2)
    expect(editor.groups[0]).toMatchObject({
      kind: 'all',
      requirements: [expect.objectContaining({ type: 'minLevel', level: 4 })],
    })
    expect(editor.groups[1]).toMatchObject({
      kind: 'any',
      requirements: [
        expect.objectContaining({ type: 'abilityMinimum', ability: 'str', minimum: 13 }),
        expect.objectContaining({ type: 'abilityMinimum', ability: 'dex', minimum: 13 }),
      ],
    })
  })

  it('maps Spell Recall to one AND group with level and spellcasting', () => {
    const spellRecall = SRD_FEATS.find((feat) => feat.slug === 'boon-of-spell-recall')!
    const editor = requirementExpressionToEditor(spellRecall.prerequisite)
    expect(editor.groups).toHaveLength(1)
    expect(editor.groups[0]).toMatchObject({
      kind: 'all',
      requirements: [
        expect.objectContaining({ type: 'minLevel', level: 19 }),
        expect.objectContaining({ type: 'spellcasting' }),
      ],
    })
  })
})

describe('SRD feat prerequisite round-trips', () => {
  for (const feat of SRD_FEATS) {
    it(`${feat.slug}: expression → editor → expression`, () => {
      const roundTripped = requirementEditorToExpression(
        requirementExpressionToEditor(feat.prerequisite),
      )
      expect(roundTripped).toEqual(feat.prerequisite)
    })
  }
})

describe('formatRequirementEditorPreview', () => {
  it('returns no prerequisites for empty editor state', () => {
    expect(formatRequirementEditorPreview(requirementEditorDefaultValue())).toBe('No prerequisites')
  })

  it('prefixes formatted expression with Requires', () => {
    const grappler = SRD_FEATS.find((feat) => feat.slug === 'grappler')!
    const editor = requirementExpressionToEditor(grappler.prerequisite)
    const expression = requirementEditorToExpression(editor)!
    expect(formatRequirementEditorPreview(editor)).toBe(
      `Requires ${formatRequirementExpression(expression)}`,
    )
  })

  it('tolerates transient field-array holes while editing', () => {
    expect(
      formatRequirementEditorPreview({
        groups: [
          {
            id: 'g1',
            kind: 'all',
            requirements: [
              undefined as unknown as PrerequisiteEditorValue['groups'][number]['requirements'][number],
              { id: 'l1', type: 'minLevel', level: 4 },
            ],
          },
        ],
      }),
    ).toBe('Requires Level 4+')
  })

  it('skips incomplete leaves instead of throwing during preview', () => {
    expect(
      formatRequirementEditorPreview({
        groups: [
          {
            id: 'g1',
            kind: 'all',
            requirements: [{ id: 'l1', type: 'minLevel', level: undefined as unknown as number }],
          },
        ],
      }),
    ).toBe('No prerequisites')
  })

  it('previews extended campaign levels above the default cap', () => {
    expect(
      formatRequirementEditorPreview(
        {
          groups: [
            {
              id: 'g1',
              kind: 'all',
              requirements: [{ id: 'l1', type: 'minLevel', level: 21 }],
            },
          ],
        },
        25,
      ),
    ).toBe('Requires Level 21+')
  })

  it('returns no prerequisites for undefined editor state', () => {
    expect(formatRequirementEditorPreview(undefined)).toBe('No prerequisites')
  })
})

describe('newRequirementLeaf and newRequirementGroup', () => {
  it('creates typed leaf and draft group rows with ids', () => {
    const leaf = newRequirementLeaf('minLevel')
    expect(leaf).toMatchObject({ type: 'minLevel', level: 1 })
    expect(leaf.id.length).toBeGreaterThan(0)

    const group = newRequirementGroup('any')
    expect(group).toMatchObject({ kind: 'any' })
    expect(group.requirements).toHaveLength(1)
    expect(group.requirements[0]).toEqual({ id: expect.any(String) })
    expect(group.id.length).toBeGreaterThan(0)
  })
})

describe('prerequisiteEditorSchema', () => {
  it('parses valid editor state', () => {
    const value: PrerequisiteEditorValue = {
      groups: [newRequirementGroup()],
    }
    expect(() => prerequisiteEditorSchema.parse(value)).not.toThrow()
  })

  it('rejects groups with no requirements', () => {
    expect(
      prerequisiteEditorSchema.safeParse({
        groups: [{ id: 'g1', kind: 'all', requirements: [] }],
      }).success,
    ).toBe(false)
  })
})

describe('normalization edge cases', () => {
  it('maps unsupported feature leaves to empty editor state', () => {
    const tree: RequirementExpression = { kind: 'feature', featureId: 'fighting-style' }
    expect(requirementExpressionToEditor(tree)).toEqual({ groups: [] })
    expect(requirementEditorToExpression(requirementExpressionToEditor(tree))).toBeUndefined()
  })

  it('round-trips a bare any group', () => {
    const tree: RequirementExpression = {
      kind: 'any',
      requirements: [
        { kind: 'abilityMinimum', ability: 'str', minimum: 13 },
        { kind: 'abilityMinimum', ability: 'dex', minimum: 13 },
      ],
    }
    expect(requirementEditorToExpression(requirementExpressionToEditor(tree))).toEqual(tree)
  })
})

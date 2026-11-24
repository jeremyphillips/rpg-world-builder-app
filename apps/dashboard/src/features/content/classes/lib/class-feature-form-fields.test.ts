import { CLASS_FEATURE_KINDS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  classFeatureItemFields,
  resolveClassFeatureFieldSections,
  resolveClassFeatureItemFields,
  subclassFeatureItemFields,
  createFeatureRowDraftFormSchema,
  createFeatureRowFormSchema,
  featureFromFormRow,
  featuresFromFormValues,
  featureToFormRow,
  subclassFeatureFromFormRow,
  formatFeatureRowSummary,
} from './class-feature-form-fields'
import { GRANT_DEFAULT_UNLOCK_LEVEL } from '../../lib/forms/grants/grant-form-schema'
import { createSpellcastingFeature } from './class-spellcasting-features'

const rageProgressionTable = {
  id: 'rage-progression',
  name: 'Rage progression',
  kind: 'levelProgression' as const,
  columns: [
    {
      id: 'uses',
      label: 'Rages',
      valueType: 'number' as const,
      entries: [{ level: 1, value: 2 }],
    },
  ],
}

describe('class feature form round-trip', () => {
  it('createFeatureRowDraftFormSchema keeps tables on parse', () => {
    const rowWithTables = {
      name: 'Rage',
      level: 1,
      grants: [],
      tables: [rageProgressionTable],
    }

    expect(createFeatureRowDraftFormSchema().parse(rowWithTables).tables).toEqual([
      rageProgressionTable,
    ])
  })

  it('maps feature tables into the form row and back on save', () => {
    const existing = {
      kind: 'custom' as const,
      id: 'rage',
      name: 'Rage',
      level: 1,
      tables: [rageProgressionTable],
    }
    const row = featureToFormRow(existing)
    expect(row.tables).toEqual(existing.tables)

    const saved = featureFromFormRow({ ...row, id: existing.id })
    expect(saved.kind).toBe('custom')
    if (saved.kind === 'custom') {
      expect(saved.tables).toEqual(existing.tables)
    }
  })

  it('round-trips edited tables through featuresFromFormValues', () => {
    const existing = [
      {
        kind: 'custom' as const,
        id: 'rage',
        name: 'Rage',
        level: 1,
        tables: [rageProgressionTable],
      },
    ]
    const editedTable = {
      ...rageProgressionTable,
      name: 'Updated rage progression',
    }
    const rows = existing.map(featureToFormRow).map((row) => ({
      ...row,
      name: 'Rage Updated',
      description: '<p>Updated</p>',
      tables: [editedTable],
    }))

    const saved = featuresFromFormValues(rows, existing)[0]
    expect(saved?.kind).toBe('custom')
    if (saved?.kind === 'custom') {
      expect(saved.tables).toEqual([editedTable])
    }
  })

  it('omits tables when the form row has none', () => {
    const row = {
      id: 'second-wind',
      kind: 'custom' as const,
      name: 'Second Wind',
      level: 1,
      grants: [],
      tables: [],
      available: true,
    }
    expect(featureFromFormRow(row)).not.toHaveProperty('tables')
  })

  it('preserves subclass-choice kind through form conversion', () => {
    const feature = {
      kind: 'subclass-choice' as const,
      id: 'fighter-subclass',
      name: 'Fighter Subclass',
      level: 3,
    }
    const row = featureToFormRow(feature)
    expect(row.kind).toBe('subclass-choice')
    expect(featureFromFormRow({ ...row, id: feature.id }).kind).toBe('subclass-choice')
  })

  it('omits available from subclass feature save', () => {
    const row = {
      id: 'improved-critical',
      name: 'Improved Critical',
      level: 3,
      grants: [],
      tables: [],
      available: false,
    }
    expect(subclassFeatureFromFormRow(row)).not.toHaveProperty('available')
  })

  it('persists available false on class feature save and omits when true', () => {
    const row = {
      id: 'second-wind',
      kind: 'custom' as const,
      name: 'Second Wind',
      level: 1,
      grants: [],
      tables: [],
      available: false,
    }
    expect(featureFromFormRow(row).available).toBe(false)

    const availableRow = { ...row, available: true }
    expect(featureFromFormRow(availableRow)).not.toHaveProperty('available')
  })

  it('requires kind on save', () => {
    const row = {
      id: 'second-wind',
      name: 'Second Wind',
      level: 1,
      grants: [],
      tables: [],
      available: true,
    }
    expect(() => featureFromFormRow(row as Parameters<typeof featureFromFormRow>[0])).toThrow(
      /missing kind/i,
    )
  })
})

describe('formatFeatureRowSummary', () => {
  it('joins level and grant count with the array item separator', () => {
    expect(
      formatFeatureRowSummary({
        name: 'Rage',
        level: 1,
        grants: [{ grantType: 'movement' }],
      }),
    ).toBe('Level 1 · 1 grant')
  })

  it('pluralizes grant count and omits the feature name', () => {
    expect(
      formatFeatureRowSummary({
        name: 'Extra Attack',
        level: 3,
        grants: [{ grantType: 'movement' }, { grantType: 'skillProficiency' }],
      }),
    ).toBe('Level 3 · 2 grants')
  })

  it('returns only the level when grants are absent', () => {
    expect(
      formatFeatureRowSummary({
        name: 'Extra Attack',
        level: 5,
        grants: [],
      }),
    ).toBe('Level 5')
  })
})

function walkFormItems(items: readonly FormItem[], visit: (item: FormItem) => void): void {
  for (const item of items) {
    visit(item)
    if ('kind' in item && item.kind === 'dependent') {
      walkFormItems([item.controller as FormItem], visit)
      walkFormItems(item.dependents.fields, visit)
    }
    if ('kind' in item && item.kind === 'row') {
      walkFormItems(item.fields, visit)
    }
    if ('kind' in item && item.kind === 'group') {
      walkFormItems(item.fields, visit)
    }
    if ('kind' in item && item.kind === 'array') {
      walkFormItems(item.fields, visit)
    }
  }
}

function descriptionFields(items: readonly FormItem[]) {
  const found: FormItem[] = []
  walkFormItems(items, (item) => {
    if ('type' in item && item.type === 'richtext' && item.name === 'description') {
      found.push(item)
    }
  })
  return found
}

function leafTextFieldNames(items: readonly FormItem[]): string[] {
  const names: string[] = []
  walkFormItems(items, (item) => {
    if ('type' in item && item.type === 'text' && 'name' in item && typeof item.name === 'string') {
      names.push(item.name)
    }
  })
  return names
}

describe('class feature detail fields', () => {
  const ctx = {} as ContentFormCtx

  it('exposes one Description field on the custom template list', () => {
    const descriptions = descriptionFields(classFeatureItemFields(ctx))
    expect(descriptions).toHaveLength(1)
    expect(descriptions[0]).toMatchObject({ label: 'Description' })
  })

  it('omits a body name field for every class master-detail kind', () => {
    for (const kind of CLASS_FEATURE_KINDS) {
      expect(leafTextFieldNames(resolveClassFeatureItemFields({ kind }, ctx))).not.toContain('name')
    }
  })

  it('keeps name on subclass collapsible feature rows', () => {
    expect(leafTextFieldNames(subclassFeatureItemFields(ctx))).toContain('name')
  })

  it('keeps spellcasting intro on spellcasting rows', () => {
    const intro = resolveClassFeatureItemFields({ kind: 'spellcasting' }, ctx).find(
      (item) => 'name' in item && item.name === 'intro',
    )
    expect(intro).toMatchObject({ label: 'Introduction' })
  })

  it('places level in leading fields and intro in primary for spellcasting sections', () => {
    const sections = resolveClassFeatureFieldSections({ kind: 'spellcasting' }, ctx)
    expect(JSON.stringify(sections.leading)).toContain('"name":"level"')
    expect(JSON.stringify(sections.primary)).toContain('"name":"intro"')
    expect(JSON.stringify(sections.primary)).not.toContain('"name":"level"')
  })
})

describe('featureFromFormRow spellcasting granting rows', () => {
  it('omits description when the row carries a spellcasting grant', () => {
    const row = {
      ...featureToFormRow(createSpellcastingFeature({ slotProgressionId: 'full-caster' })),
      intro: '<p>Narrative</p>',
      description: '<p>Should not persist</p>',
    }
    const saved = featureFromFormRow({ ...row, id: row.id! })
    expect(saved.kind === 'spellcasting' && saved.intro).toBe('<p>Narrative</p>')
    expect(saved).not.toHaveProperty('description')
  })
})

describe('createFeatureRowFormSchema', () => {
  it('rejects grant unlock levels at or below the feature level', () => {
    const schema = createFeatureRowFormSchema()
    const result = schema.safeParse({
      name: 'Domain Spells',
      level: 3,
      grants: [
        {
          grantType: 'languages',
          unlockLevel: 3,
          language: 'common',
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'grants.0.unlockLevel'),
      ).toBe(true)
    }
  })

  it('accepts default unlock and later unlock levels', () => {
    const schema = createFeatureRowFormSchema()

    expect(
      schema.safeParse({
        name: 'Domain Spells',
        level: 3,
        grants: [
          {
            grantType: 'languages',
            unlockLevel: GRANT_DEFAULT_UNLOCK_LEVEL,
            language: 'common',
          },
        ],
      }).success,
    ).toBe(true)

    expect(
      schema.safeParse({
        name: 'Domain Spells',
        level: 3,
        grants: [
          {
            grantType: 'languages',
            unlockLevel: 5,
            language: 'common',
          },
        ],
      }).success,
    ).toBe(true)
  })
})

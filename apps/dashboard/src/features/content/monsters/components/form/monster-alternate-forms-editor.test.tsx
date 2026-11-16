import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildMonsterTabs } from '../../lib/monster-form-fields'
import { monsterFormsSectionFields } from '../../lib/forms/monster-forms-form-fields'
import { makeEmptyMonsterAlternateForm } from '../../lib/forms/monster-forms-form-values'

const ctx: ContentFormCtx = { entityCatalogLayer: 'homebrew' }

describe('monster alternate forms authoring architecture', () => {
  it('routes the editor slot issues and models fields as form config', () => {
    const section = monsterFormsSectionFields(ctx)[0]
    expect(section).toMatchObject({
      kind: 'group',
      heading: { label: 'Alternate forms' },
    })
    if (!section || !('fields' in section)) throw new Error('Expected forms field group')
    expect(section.fields).toContainEqual(
      expect.objectContaining({
        kind: 'slot',
        issuePaths: ['forms.alternates'],
      }),
    )
    expect(JSON.stringify(section)).not.toMatch(/<(input|select|textarea)|register\(/)
  })

  it('declares Creature Details error and resolver paths', () => {
    const tab = buildMonsterTabs(ctx).find((candidate) => candidate.id === 'creatureDetails')
    expect(tab?.errorPaths).toContain('forms')
    expect(tab?.resolverFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'forms.trueForm.name' }),
        expect.objectContaining({ name: 'forms.alternates' }),
      ]),
    )
  })

  it('creates recoverable draft alternate defaults', () => {
    expect(makeEmptyMonsterAlternateForm()).toMatchObject({
      name: '',
      overrides: {},
    })
  })
})

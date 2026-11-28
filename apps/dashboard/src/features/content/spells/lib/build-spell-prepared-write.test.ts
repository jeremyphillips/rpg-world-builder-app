/**
 * @vitest-environment jsdom
 */
import { ApiError } from '@rpg/contracts'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useForm } from 'react-hook-form'

import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '@rpg/ui'
import { createEmptyFormValidationProducerSession, type FormIssue } from '@rpg/ui/form'

import { presentPersistValidationFailure } from '../../lib/forms/shells/submit/content-form-submit-presentation.lib'
import { mapWireIssuesToAuthoring } from '../../lib/forms/submit/map-wire-issues-to-authoring.lib'
import type { SpellFormValues } from './spell-form-fields'
import {
  buildSpellPreparedWrite,
  spellCreateDefaultValues,
  SPELL_SCALING_FORM_DEFAULTS,
} from './spell-form-values'

const issue = (path: string): FormIssue => ({ path, message: 'bad', severity: 'field' })

function publishReadySpellFormValues(overrides: Partial<SpellFormValues> = {}): SpellFormValues {
  return {
    name: 'Test Spell',
    school: 'evocation',
    level: 1,
    classIds: ['wizard'],
    castingTime: {
      normal: { value: 1, unit: 'action' },
      canBeCastAsRitual: false,
    },
    range: { kind: 'self' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    areaOfEffect: spellCreateDefaultValues.areaOfEffect!,
    effects: [],
    ...SPELL_SCALING_FORM_DEFAULTS,
    ...overrides,
  } as SpellFormValues
}

describe('buildSpellPreparedWrite provenance', () => {
  it('maps slug wire paths to the name authoring owner', () => {
    const { provenance } = buildSpellPreparedWrite(
      publishReadySpellFormValues({ name: 'Fire Bolt' }),
      undefined,
      'publish',
    )
    const { issues } = mapWireIssuesToAuthoring([issue('slug')], provenance)
    expect(issues[0]!.path).toBe('name')
  })

  it('records description table pruning by source row id, not wire index alone', () => {
    const tableB = { ...reincarnateSpeciesTableFixture, id: 'table-b', name: 'Table B' }
    const values = publishReadySpellFormValues({
      description: `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="table-b"></div>`,
      tables: [reincarnateSpeciesTableFixture, tableB],
    })
    const { provenance } = buildSpellPreparedWrite(values, undefined, 'publish')
    expect(provenance.filteredRowIndexBySourceIndex?.tables).toEqual({ 1: 0 })
    const { issues } = mapWireIssuesToAuthoring([issue('tables.0.name')], provenance)
    expect(issues[0]!.path).toBe('tables.1.name')
  })

  it('targets the same authoring row for a local path and a wire path after table pruning', () => {
    const tableB = { ...reincarnateSpeciesTableFixture, id: 'table-b', name: 'Table B' }
    const values = publishReadySpellFormValues({
      description: `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="table-b"></div>`,
      tables: [reincarnateSpeciesTableFixture, tableB],
    })
    const { provenance } = buildSpellPreparedWrite(values, undefined, 'publish')

    const localPath = 'tables.1.name'
    const wirePath = mapWireIssuesToAuthoring([issue('tables.0.name')], provenance).issues[0]!.path

    expect(wirePath).toBe(localPath)
  })

  it('paints persisted API table errors on the authoring row via presentPersistValidationFailure', () => {
    const tableB = { ...reincarnateSpeciesTableFixture, id: 'table-b', name: 'Table B' }
    const values = publishReadySpellFormValues({
      description: `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="table-b"></div>`,
      tables: [reincarnateSpeciesTableFixture, tableB],
    })
    const { provenance } = buildSpellPreparedWrite(values, undefined, 'publish')
    const { result } = renderHook(() => useForm<SpellFormValues>({ defaultValues: values }))
    const error = new ApiError(400, 'validation_error', 'Invalid', {
      issues: [{ path: 'tables.0.name', message: 'Table name required.', code: 'custom' }],
    })

    act(() => {
      presentPersistValidationFailure(
        result.current,
        error,
        undefined,
        null,
        createEmptyFormValidationProducerSession(),
        1,
        provenance,
      )
    })

    expect(result.current.getFieldState('tables.1.name').error?.message).toBe(
      'Table name required.',
    )
    expect(result.current.getFieldState('tables.0.name').error).toBeUndefined()
  })
})

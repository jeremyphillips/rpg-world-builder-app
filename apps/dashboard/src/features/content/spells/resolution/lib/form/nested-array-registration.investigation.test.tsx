/**
 * P4 characterization. Plain React Hook Form 7.77, no @rpg/ui form shell.
 *
 * With `shouldUnregister: true`, `_formValues` starts empty. After the form
 * effect sets `_state.mount`, `getValues()` reads `_formValues` instead of
 * `defaultValues`. `useFieldArray`'s mount effect then calls `_setFieldArray(name)`
 * whenever that path is missing, and the default argument is `[]`. `set` creates
 * only that path, so unregistered siblings (`resolution.effects`, `outcome.result`)
 * never appear. `shouldUnregister: false` clones defaults into `_formValues`, so
 * the missing-path write does not run.
 *
 * A parent field array does not prevent this. Mounting `actions` plus the nested
 * resolution arrays together still stores `effects: []` and drops `result`.
 * Monster authoring keeps its values because registered row inputs copy leaf
 * defaults into `_formValues` before that missing-path write. Spell `result` is
 * not a registered input, and `resolution` is not a field-array row.
 */
import { render } from '@testing-library/react'
import { useFieldArray, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

const resolution = {
  resolution: {
    effects: [{ id: 'damage-1', kind: 'damage' }],
    outcomes: [
      {
        result: 'hit',
        effects: [{ kind: 'effect-reference', effectId: 'damage-1', amount: 'full' }],
      },
      { result: 'miss', effects: [] as unknown[] },
    ],
  },
}

function ResolutionProbe({
  name,
  shouldUnregister,
}: {
  name: 'resolution.outcomes.0.effects' | 'resolution.outcomes.1.effects' | 'resolution.effects'
  shouldUnregister: boolean
}) {
  const form = useForm({ defaultValues: resolution, shouldUnregister })
  useFieldArray({ control: form.control, name })
  return <output data-testid="values">{JSON.stringify(form.getValues())}</output>
}

function readResolution(
  name: 'resolution.outcomes.0.effects' | 'resolution.outcomes.1.effects' | 'resolution.effects',
  shouldUnregister: boolean,
) {
  const view = render(<ResolutionProbe name={name} shouldUnregister={shouldUnregister} />)
  return JSON.parse(view.getByTestId('values').textContent ?? '{}') as typeof resolution
}

describe('P4 plain useFieldArray', () => {
  it('keeps unregistered siblings when shouldUnregister is false', () => {
    const next = readResolution('resolution.outcomes.0.effects', false)
    expect(next.resolution.effects).toEqual(resolution.resolution.effects)
    expect(next.resolution.outcomes.map((outcome) => outcome.result)).toEqual(['hit', 'miss'])
  })

  it('replaces a populated nested array with [] and drops unregistered siblings', () => {
    const populated = readResolution('resolution.outcomes.0.effects', true)
    expect(populated.resolution.effects).toBeUndefined()
    expect(populated.resolution.outcomes[0]).toEqual({ effects: [] })
    expect(populated.resolution.outcomes[1]).toBeUndefined()
  })

  it('writes only the empty nested path and leaves a hole for the other outcome', () => {
    const empty = readResolution('resolution.outcomes.1.effects', true)
    expect(empty.resolution.effects).toBeUndefined()
    expect(empty.resolution.outcomes[1]).toEqual({ effects: [] })
    expect(empty.resolution.outcomes[0]).toBeNull()
  })

  it('writes an empty library array when that field array mounts under shouldUnregister', () => {
    const next = readResolution('resolution.effects', true)
    expect(next.resolution.effects).toEqual([])
    expect(next.resolution.outcomes).toBeUndefined()
  })
})

const monster = {
  actions: [
    {
      resolution: {
        effects: [{ id: 'damage-1', kind: 'damage' }],
        outcomes: [
          {
            result: 'failed-save',
            effects: [{ kind: 'effect-reference', effectId: 'damage-1', amount: 'full' }],
          },
          { result: 'successful-save', effects: [] as unknown[] },
        ],
      },
    },
  ],
}

function MonsterProbe() {
  const form = useForm({ defaultValues: monster, shouldUnregister: true })
  useFieldArray({ control: form.control, name: 'actions' })
  useFieldArray({ control: form.control, name: 'actions.0.resolution.effects' })
  useFieldArray({ control: form.control, name: 'actions.0.resolution.outcomes.0.effects' })
  useFieldArray({ control: form.control, name: 'actions.0.resolution.outcomes.1.effects' })
  return <output data-testid="values">{JSON.stringify(form.getValues())}</output>
}

describe('P4 monster-shaped parent field array', () => {
  it('still empties nested arrays and drops result when no inputs are registered', () => {
    const view = render(<MonsterProbe />)
    const next = JSON.parse(view.getByTestId('values').textContent ?? '{}') as typeof monster
    expect(next.actions[0]?.resolution.effects).toEqual([])
    expect(next.actions[0]?.resolution.outcomes).toEqual([{ effects: [] }, { effects: [] }])
  })
})

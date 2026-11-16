/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import { monsterFormTestValues } from '../../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { MonsterActionShapeShiftSummary } from './monster-action-shape-shift-summary'

const shapeShift: MonsterActionDraftRow = {
  id: 'shape-shift',
  kind: 'shape-shift',
  equipment: 'unchanged',
}

const ctx = {
  equipmentCatalogById: new Map(),
  spellCatalogById: new Map(),
} as unknown as ContentFormCtx

function Host() {
  const form = useForm<MonsterFormValues>({
    defaultValues: monsterFormTestValues({
      name: 'Werebear',
      sizes: ['medium'],
      forms: {
        trueForm: { id: 'humanoid', name: 'Humanoid', appearance: 'humanoid' },
        alternates: [
          {
            id: 'bear',
            name: 'Bear',
            appearance: 'bear',
            overrides: { sizes: ['large'] },
          },
        ],
      },
      bonusActions: [shapeShift] as MonsterFormValues['bonusActions'],
    }),
  })
  return (
    <FormProvider {...form}>
      <MonsterActionShapeShiftSummary ctx={ctx} action={shapeShift} />
    </FormProvider>
  )
}

describe('MonsterActionShapeShiftSummary', () => {
  it('renders read-only destinations and generated prose', () => {
    render(<Host />)

    expect(screen.getByText('Destinations')).toBeInTheDocument()
    expect(screen.getByText('Bear and Humanoid')).toBeInTheDocument()
    expect(screen.getByText(/werebear shape-shifts into a Large bear/i)).toBeInTheDocument()
    expect(
      screen.getByText(/equipment it is wearing or carrying isn't transformed/i),
    ).toBeInTheDocument()
  })
})

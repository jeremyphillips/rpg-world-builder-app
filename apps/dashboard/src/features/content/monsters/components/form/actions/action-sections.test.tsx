import { useEffect } from 'react'
import { getMonsterActionKindLabel } from '@rpg/contracts'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type * as CharacterFeature from '@/features/character'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { monsterFormTestValues } from '../../../lib/monster-form-test-values'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../../lib/monster-form-values'
import { MonsterActionSections } from './action-sections'

vi.mock('@/features/character', async (importOriginal) => {
  const actual = await importOriginal<typeof CharacterFeature>()
  return {
    ...actual,
    EquipmentPickerDrawer: ({
      open,
      onCommitAdd,
    }: {
      open: boolean
      onCommitAdd: (item: { equipment: { id: string; name: string } }) => boolean
    }) =>
      open ? (
        <button
          type="button"
          onClick={() => onCommitAdd({ equipment: { id: 'w1', name: 'Longsword' } })}
        >
          Commit mock weapon
        </button>
      ) : null,
  }
})

function Host({
  ctx,
  values = resolveMonsterCreateDefaultValues(),
  formRef,
}: {
  ctx: ContentFormCtx
  values?: MonsterFormValues
  formRef?: { current: UseFormReturn<MonsterFormValues> | null }
}) {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  useEffect(() => {
    if (formRef) formRef.current = form
  })
  return (
    <FormProvider {...form}>
      <MonsterActionSections ctx={ctx} />
    </FormProvider>
  )
}

function detailTitleRow(): HTMLElement | null {
  return document.querySelector('[data-master-detail-title-row]')
}

const lichLegendaryValues = monsterFormTestValues({
  name: 'Lich',
  legendaryActions: {
    uses: { normal: 3, inLair: 4 },
    actions: [
      {
        id: 'deathly-teleport',
        kind: 'special',
        name: 'Deathly Teleport',
        description: '<p>Teleport and necrotic damage.</p>',
      },
      { id: 'disrupt-life', kind: 'save', name: 'Disrupt Life' },
      {
        id: 'frightening-gaze',
        kind: 'spell',
        name: 'Frightening Gaze',
        spells: [{ spellId: 'srd:fear' }],
      },
    ],
  },
})

const readyCtx: ContentFormCtx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
}

describe('MonsterActionSections', () => {
  it('adds a natural weapon from the shared menu and selects it', async () => {
    const user = userEvent.setup()
    render(<Host ctx={readyCtx} />)

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0]!)
    await user.click(await screen.findByRole('menuitem', { name: /^Claw\b/ }))

    expect(screen.getByRole('button', { current: true, name: /Claw/i })).toBeInTheDocument()
  })

  it('opens the weapon picker from add-weapon and commits an equipped row', async () => {
    const user = userEvent.setup()
    render(<Host ctx={readyCtx} />)

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0]!)
    await user.click(await screen.findByRole('menuitem', { name: /Add a weapon/i }))

    await user.click(screen.getByRole('button', { name: 'Commit mock weapon' }))

    expect(screen.getByText(/Longsword was added/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { current: true, name: /Unresolved reference/i }),
    ).toBeInTheDocument()
  })

  it('adds a custom legendary ability from the legendary menu and selects it', async () => {
    const user = userEvent.setup()
    render(<Host ctx={readyCtx} />)

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    await user.click(addButtons[3]!)
    await user.click(await screen.findByRole('menuitem', { name: /Custom ability/i }))

    expect(
      screen.getByRole('button', { current: true, name: /Custom ability/i }),
    ).toBeInTheDocument()
  })

  it('shows stored legendary names with action-kind captions, not acquisition labels', () => {
    const ctx: ContentFormCtx = {
      ...readyCtx,
      entityCatalogLayer: 'system',
      embeddedSeedRowIds: {
        'legendaryActions.actions': ['deathly-teleport', 'disrupt-life', 'frightening-gaze'],
      },
    }
    render(<Host ctx={ctx} values={lichLegendaryValues} />)

    const deathlyTitle = screen.getByText('Deathly Teleport', { selector: '.text-style-label' })
    const deathlyRow = deathlyTitle.closest('button')
    expect(deathlyRow).toBeTruthy()
    const deathlyCaption = deathlyRow!.querySelector('.text-style-caption')
    expect(deathlyCaption).toHaveTextContent(getMonsterActionKindLabel('special'))
    expect(deathlyCaption?.textContent).not.toMatch(/Custom ability/)

    const disruptCaption = screen
      .getByText('Disrupt Life', { selector: '.text-style-label' })
      .closest('button')
      ?.querySelector('.text-style-caption')
    expect(disruptCaption).toHaveTextContent(getMonsterActionKindLabel('save'))

    const gazeCaption = screen
      .getByText('Frightening Gaze', { selector: '.text-style-label' })
      .closest('button')
      ?.querySelector('.text-style-caption')
    expect(gazeCaption).toHaveTextContent(getMonsterActionKindLabel('spell'))

    expect(deathlyTitle).toHaveTextContent('Deathly Teleport')
    expect(deathlyCaption?.textContent).not.toMatch(/Unsaved/)
  })

  it('keeps legendary nav and detail inline titles on the same RHF name path', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const ctx: ContentFormCtx = {
      ...readyCtx,
      entityCatalogLayer: 'system',
      embeddedSeedRowIds: { 'legendaryActions.actions': ['deathly-teleport'] },
    }
    render(<Host ctx={ctx} values={lichLegendaryValues} formRef={formRef} />)

    const deathlyTitle = screen.getByText('Deathly Teleport', { selector: '.text-style-label' })
    const deathlyRow = deathlyTitle.closest('button')
    expect(deathlyRow).toBeTruthy()
    await user.click(deathlyRow!)

    await waitFor(() => {
      const titleRow = detailTitleRow()
      expect(titleRow).toBeTruthy()
      expect(titleRow).toHaveTextContent('Deathly Teleport')
    })
    expect(detailTitleRow()?.textContent).not.toMatch(/^Custom ability$/)

    const getPath = (path: string) =>
      (formRef.current?.getValues as (name: string) => unknown)(path)
    expect(getPath('legendaryActions.actions.0.name')).toBe('Deathly Teleport')
    expect(getPath('legendaryActions.0.name')).toBeUndefined()

    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    const nameInput = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(nameInput)
    await user.type(nameInput, 'Soul Step{Enter}')

    await waitFor(() => {
      expect(screen.getByText('Soul Step', { selector: '.text-style-label' })).toBeInTheDocument()
      expect(detailTitleRow()).toHaveTextContent('Soul Step')
    })
    expect(getPath('legendaryActions.actions.0.name')).toBe('Soul Step')
    expect(getPath('legendaryActions.0.name')).toBeUndefined()
  })
})

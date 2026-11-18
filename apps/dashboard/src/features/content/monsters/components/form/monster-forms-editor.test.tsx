import { useEffect } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildMonsterTabs } from '../../lib/monster-form-fields'
import {
  MONSTER_DEFINED_FORM_DISPLAY_FALLBACK,
  MONSTER_SHAPE_SHIFTING_DESCRIPTION,
  MONSTER_SHAPE_SHIFTING_HEADING,
} from '../../lib/monster-form-labels'
import { monsterFormsSectionFields } from '../../lib/forms/monster-forms-form-fields'
import { makeEmptyMonsterDefinedForm } from '../../lib/forms/monster-forms-form-values'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { monsterFormTestValues } from '../../lib/monster-form-test-values'
import { MonsterFormsEditor } from './monster-forms-editor'

const ctx: ContentFormCtx = { entityCatalogLayer: 'homebrew' }

describe('monster forms authoring architecture', () => {
  it('routes the editor slot issues and models fields as form config', () => {
    const section = monsterFormsSectionFields(ctx)[0]
    expect(section).toMatchObject({
      kind: 'group',
      heading: {
        label: MONSTER_SHAPE_SHIFTING_HEADING,
        hint: MONSTER_SHAPE_SHIFTING_DESCRIPTION,
      },
    })
    if (!section || !('fields' in section)) throw new Error('Expected forms field group')
    expect(section.fields).toContainEqual(
      expect.objectContaining({
        kind: 'slot',
        issuePaths: ['forms.definedForms', 'forms.trueForm.formId'],
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
        expect.objectContaining({ name: 'forms.definedForms' }),
      ]),
    )
  })

  it('creates recoverable defined-form defaults', () => {
    expect(makeEmptyMonsterDefinedForm()).toMatchObject({
      name: '',
      overrides: {},
    })
  })

  it('automatically designates the first row added to an empty defined-form draft', async () => {
    const user = userEvent.setup()

    function Host() {
      const form = useForm<MonsterFormValues>({
        defaultValues: monsterFormTestValues({
          name: 'Werebear',
          forms: {
            profileFormId: 'profile',
            trueForm: { kind: 'defined', formId: undefined },
            definedForms: [],
          },
        }),
      })
      return (
        <FormProvider {...form}>
          <MonsterFormsEditor ctx={ctx} />
          <Output />
        </FormProvider>
      )
    }

    function Output() {
      const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
      return <output aria-label="forms state">{JSON.stringify(forms)}</output>
    }

    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add form' }))

    const state = JSON.parse(screen.getByLabelText('forms state').textContent ?? '{}') as {
      trueForm: { formId?: string }
      definedForms: Array<{ id: string }>
    }
    expect(state.definedForms).toHaveLength(1)
    expect(state.trueForm.formId).toBe(state.definedForms[0]?.id)
  })

  it('keeps a defined form name after the inline title blurs', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }

    function Host() {
      const form = useForm<MonsterFormValues>({
        defaultValues: monsterFormTestValues({ name: 'Werebear' }),
        shouldUnregister: true,
      })
      useEffect(() => {
        formRef.current = form
      })
      return (
        <FormProvider {...form}>
          <MonsterFormsEditor ctx={ctx} />
        </FormProvider>
      )
    }

    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add forms' }))
    await user.click(screen.getByRole('button', { name: 'Add form' }))
    const input = await screen.findByRole('textbox', { name: 'Name' })
    await user.type(input, 'Bear')
    await user.tab()

    expect(formRef.current?.getValues('forms.definedForms.0.name')).toBe('Bear')
    expect(screen.getAllByText('Bear').length).toBeGreaterThan(0)
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()
    expect(document.activeElement?.getAttribute('aria-hidden')).not.toBe('true')
    expect(formRef.current?.getValues('forms.definedForms')).toHaveLength(1)
  })

  it('opens remove confirmation after adding a defined form', async () => {
    const user = userEvent.setup()

    function Host() {
      const form = useForm<MonsterFormValues>({
        defaultValues: monsterFormTestValues({ name: 'Werebear' }),
        shouldUnregister: true,
      })
      return (
        <FormProvider {...form}>
          <MonsterFormsEditor ctx={ctx} />
        </FormProvider>
      )
    }

    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add forms' }))
    await user.click(screen.getByRole('button', { name: 'Add form' }))

    await user.click(screen.getByRole('button', { name: /Actions for New form/i }))
    await user.click(screen.getByRole('menuitem', { name: /Delete form/i }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent(/Remove Untitled form\?/i)

    await user.click(within(dialog).getByRole('button', { name: 'Remove form' }))
    expect(screen.queryByRole('button', { name: /Actions for New form/i })).not.toBeInTheDocument()
  })

  it('shows New form as the display fallback without persisting a name', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }

    function Host() {
      const form = useForm<MonsterFormValues>({
        defaultValues: monsterFormTestValues({ name: 'Werebear' }),
      })
      useEffect(() => {
        formRef.current = form
      })
      return (
        <FormProvider {...form}>
          <MonsterFormsEditor ctx={ctx} />
        </FormProvider>
      )
    }

    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add forms' }))
    await user.click(screen.getByRole('button', { name: 'Add form' }))

    expect(screen.getByText(MONSTER_DEFINED_FORM_DISPLAY_FALLBACK)).toBeInTheDocument()
    expect(formRef.current?.getValues('forms.definedForms.0.name')).toBe('')
  })
})

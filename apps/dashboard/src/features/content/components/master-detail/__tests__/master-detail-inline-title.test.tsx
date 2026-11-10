import { useEffect, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { defineMasterDetailItemNoun } from '../../../lib/master-detail/master-detail-item-noun'
import { MasterDetailEditorShell } from '../master-detail-editor-shell'

const itemNoun = defineMasterDetailItemNoun({ label: 'Action', singular: 'action' })

function Harness({
  formRef,
  rowKey = 'row-1',
  name = 'Dagger',
  mode = 'authored' as 'authored' | 'override',
  fallback = 'Attack',
  resetLabel,
}: {
  formRef?: { current: UseFormReturn<{ actions: { name?: string }[] }> | null }
  rowKey?: string
  name?: string
  mode?: 'authored' | 'override'
  fallback?: string
  resetLabel?: string
}) {
  const form = useForm<{ actions: { name?: string }[] }>({
    defaultValues: { actions: [{ name }] },
  })
  useEffect(() => {
    if (formRef) formRef.current = form
  })
  return (
    <FormProvider {...form}>
      <MasterDetailEditorShell
        itemNoun={itemNoun}
        namePrefix="actions.0"
        selectedIdentity={{
          title: name || fallback,
          rowKey,
          meta: { eyebrow: 'Weapon', sourceLabel: 'Actions' },
          inlineTitle: {
            field: 'name',
            mode,
            fallback,
            placeholder: fallback,
            ...(resetLabel ? { resetLabel } : {}),
          },
        }}
      />
    </FormProvider>
  )
}

describe('master detail inline title', () => {
  it('keeps the title row height token and the edit affordance in both modes', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const row = document.querySelector('[data-master-detail-title-row]')
    expect(row).toHaveClass('min-h-[var(--control-height-md)]')
    expect(screen.getByRole('button', { name: 'Edit name' })).toBeVisible()
    expect(row).toHaveClass('w-fit')
    expect(screen.getByText('Dagger')).toHaveClass(
      'truncate',
      'text-lg',
      'font-medium',
      'text-foreground',
    )

    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    expect(row).toHaveClass('min-h-[var(--control-height-md)]', 'w-fit')
    expect(document.querySelector('[data-master-detail-title-row] button')).toHaveClass('invisible')
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveValue('Dagger')
    expect(input).toHaveClass(
      'truncate',
      'text-lg',
      'font-medium',
      'text-foreground',
      'ui-field-control',
      'min-w-80',
    )
  })

  it('commits on enter and blur, cancels on escape, and leaves an empty authored name unset', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<{ actions: { name?: string }[] }> | null } = {
      current: null,
    }
    render(<Harness formRef={formRef} name="" fallback="Attack" />)
    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveAttribute('placeholder', 'Attack')
    await user.type(input, 'Slash')
    await user.keyboard('{Enter}')
    expect(formRef.current?.getValues('actions.0.name')).toBe('Slash')
    expect(formRef.current?.getFieldState('actions.0.name').isDirty).toBe(true)
    expect(screen.getByText('Slash')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.keyboard('{Escape}')
    expect(formRef.current?.getValues('actions.0.name')).toBe('Slash')

    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.keyboard('{Enter}')
    expect(formRef.current?.getValues('actions.0.name')).toBeUndefined()
    expect(screen.getByText('Attack')).toBeInTheDocument()
    expect(formRef.current?.getFieldState('actions.0').isDirty).toBe(true)
  })

  it('restores a derived name from the overflow action', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<{ actions: { name?: string }[] }> | null } = {
      current: null,
    }
    render(
      <Harness
        formRef={formRef}
        name="Venomous Bite"
        mode="override"
        fallback="Bite"
        resetLabel="Use default name"
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Actions for Venomous Bite' }))
    await user.click(screen.getByRole('menuitem', { name: 'Use default name' }))
    expect(formRef.current?.getValues('actions.0.name')).toBeUndefined()
    expect(screen.getByText('Bite')).toBeInTheDocument()
  })

  it('commits the open edit when the selected row changes', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<{ actions: { name?: string }[] }> | null } = {
      current: null,
    }
    function Switcher() {
      const form = useForm<{ actions: { name?: string }[] }>({
        defaultValues: { actions: [{ name: 'One' }, { name: 'Two' }] },
      })
      const [index, setIndex] = useState(0)
      useEffect(() => {
        formRef.current = form
      })
      return (
        <FormProvider {...form}>
          <button type="button" onClick={() => setIndex(1)}>
            Next row
          </button>
          <MasterDetailEditorShell
            itemNoun={itemNoun}
            namePrefix={`actions.${index}`}
            selectedIdentity={{
              title: index === 0 ? 'One' : 'Two',
              rowKey: `row-${index}`,
              inlineTitle: {
                field: 'name',
                mode: 'authored',
                fallback: 'Attack',
                placeholder: 'Attack',
              },
            }}
          />
        </FormProvider>
      )
    }
    render(<Switcher />)
    await user.click(screen.getByRole('button', { name: 'Edit name' }))
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Renamed')
    await user.click(screen.getByRole('button', { name: 'Next row' }))
    expect(formRef.current?.getValues('actions.0.name')).toBe('Renamed')
    expect(screen.getByText('Two')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()
  })
})

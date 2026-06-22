import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FormProvider, useForm, type FieldErrors, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import {
  autoSelectFirstInvalid,
  findFirstInvalidRowIndex,
  useMasterDetailArray,
} from './use-master-detail-array'

type FeatureRow = { name: string }

function createFormWrapper(defaultValues: { features: FeatureRow[] }) {
  let formRef: UseFormReturn<{ features: FeatureRow[] }> | null = null

  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm({ defaultValues })
    formRef = form
    return <FormProvider {...form}>{children}</FormProvider>
  }

  return {
    Wrapper,
    getForm: () => {
      if (!formRef) throw new Error('Form not initialized')
      return formRef
    },
  }
}

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm({ defaultValues: { features: [] as FeatureRow[] } })
  return <FormProvider {...form}>{children}</FormProvider>
}

const makeDefaults = () => ({ name: '' })

function setup() {
  return renderHook(() => useMasterDetailArray('features', makeDefaults), { wrapper: Wrapper })
}

describe('findFirstInvalidRowIndex', () => {
  it('returns the first index with row errors in an array', () => {
    const errors = {
      features: [{ name: { message: 'Required', type: 'required' } }, undefined],
    } as unknown as FieldErrors

    expect(findFirstInvalidRowIndex(errors, 'features')).toBe(0)
  })

  it('returns null when there are no row errors', () => {
    expect(findFirstInvalidRowIndex({}, 'features')).toBeNull()
  })

  it('returns the first invalid index for nested dot paths', () => {
    const errors = {
      heritageChoices: [
        undefined,
        { options: [undefined, { name: { message: 'Required', type: 'required' } }] },
      ],
    } as unknown as FieldErrors

    expect(findFirstInvalidRowIndex(errors, 'heritageChoices.1.options')).toBe(1)
  })
})

describe('autoSelectFirstInvalid', () => {
  it('selects the first invalid row index', () => {
    const errors = {
      features: [undefined, { name: { message: 'Required', type: 'required' } }],
    } as unknown as FieldErrors
    const select = vi.fn()

    autoSelectFirstInvalid(errors, 'features', select)

    expect(select).toHaveBeenCalledWith(1)
  })
})

describe('useMasterDetailArray', () => {
  it('starts empty with no selection', () => {
    const { result } = setup()
    expect(result.current.fields).toHaveLength(0)
    expect(result.current.selectedIndex).toBeNull()
  })

  it('appends a row and selects it', () => {
    const { result } = setup()

    act(() => result.current.handleAdd())
    expect(result.current.fields).toHaveLength(1)
    expect(result.current.selectedIndex).toBe(0)

    act(() => result.current.handleAdd())
    expect(result.current.fields).toHaveLength(2)
    expect(result.current.selectedIndex).toBe(1)
  })

  it('selects a given index', () => {
    const { result } = setup()
    act(() => result.current.handleAdd())
    act(() => result.current.handleAdd())

    act(() => result.current.select(0))
    expect(result.current.selectedIndex).toBe(0)
  })

  it('opens and dismisses the delete-confirmation flow without removing', () => {
    const { result } = setup()
    act(() => result.current.handleAdd())

    act(() => result.current.requestRemove(0))
    expect(result.current.deleteIndex).toBe(0)

    act(() => result.current.cancelRemove())
    expect(result.current.deleteIndex).toBeNull()
    expect(result.current.fields).toHaveLength(1)
  })

  it('clamps selection when the selected row is confirmed for removal', () => {
    const { result } = setup()
    act(() => result.current.handleAdd())
    act(() => result.current.handleAdd())
    act(() => result.current.handleAdd())
    act(() => result.current.select(2))

    act(() => result.current.requestRemove(2))
    act(() => result.current.confirmRemove())
    expect(result.current.fields).toHaveLength(2)
    expect(result.current.selectedIndex).toBe(1)
    expect(result.current.deleteIndex).toBeNull()
  })

  it('shifts selection down when an earlier row is removed', () => {
    const { result } = setup()
    act(() => result.current.handleAdd())
    act(() => result.current.handleAdd())
    act(() => result.current.select(1))

    act(() => result.current.requestRemove(0))
    act(() => result.current.confirmRemove())
    expect(result.current.selectedIndex).toBe(0)
  })

  it('clears selection when the last row is removed', () => {
    const { result } = setup()
    act(() => result.current.handleAdd())

    act(() => result.current.requestRemove(0))
    act(() => result.current.confirmRemove())
    expect(result.current.fields).toHaveLength(0)
    expect(result.current.selectedIndex).toBeNull()
  })

  it('reports row validation errors via hasRowError', () => {
    const { Wrapper, getForm } = createFormWrapper({
      features: [{ name: 'Rage' }, { name: '' }],
    })
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })

    act(() => {
      getForm().setError('features.1.name', { type: 'required', message: 'Required' })
    })

    expect(result.current.hasRowError(0)).toBe(false)
    expect(result.current.hasRowError(1)).toBe(true)
  })

  it('auto-selects the first invalid row after submit', async () => {
    const { Wrapper, getForm } = createFormWrapper({
      features: [{ name: 'Rage' }, { name: '' }],
    })
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.select(0)
      getForm().setError('features.1.name', { type: 'required', message: 'Required' })
    })

    await act(async () => {
      await getForm().handleSubmit(() => undefined)()
    })

    expect(result.current.selectedIndex).toBe(1)
  })

  it('exposes autoSelectFirstInvalid to jump to the first errored row', () => {
    const { Wrapper, getForm } = createFormWrapper({
      features: [{ name: 'Rage' }, { name: '' }],
    })
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.select(0)
      getForm().setError('features.1.name', { type: 'required', message: 'Required' })
    })

    act(() => {
      result.current.autoSelectFirstInvalid()
    })

    expect(result.current.selectedIndex).toBe(1)
  })

  it('moves a row and keeps the selection on the moved row', () => {
    const { Wrapper, getForm } = createFormWrapper({
      features: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
    })
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })

    act(() => result.current.select(0))
    act(() => result.current.moveDown(0))

    expect(
      getForm()
        .getValues('features')
        .map((row) => row.name),
    ).toEqual(['B', 'A', 'C'])
    expect(result.current.selectedIndex).toBe(1)
  })

  it('does not move up the first row', () => {
    const { Wrapper, getForm } = createFormWrapper({
      features: [{ name: 'A' }, { name: 'B' }],
    })
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })

    act(() => result.current.moveUp(0))

    expect(
      getForm()
        .getValues('features')
        .map((row) => row.name),
    ).toEqual(['A', 'B'])
  })

  it('does not move down the last row', () => {
    const { Wrapper, getForm } = createFormWrapper({
      features: [{ name: 'A' }, { name: 'B' }],
    })
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })

    act(() => result.current.moveDown(1))

    expect(
      getForm()
        .getValues('features')
        .map((row) => row.name),
    ).toEqual(['A', 'B'])
  })

  it('reports row validation errors for nested dot paths via hasRowError', () => {
    type HeritageForm = {
      heritageChoices: Array<{ options: FeatureRow[] }>
    }

    let formRef: UseFormReturn<HeritageForm> | null = null

    function NestedWrapper({ children }: { children: ReactNode }) {
      const form = useForm<HeritageForm>({
        defaultValues: {
          heritageChoices: [{ options: [{ name: 'A' }, { name: '' }] }],
        },
      })
      formRef = form
      return <FormProvider {...form}>{children}</FormProvider>
    }

    const { result } = renderHook(
      () => useMasterDetailArray('heritageChoices.0.options', makeDefaults),
      { wrapper: NestedWrapper },
    )

    act(() => {
      if (!formRef) throw new Error('Form not initialized')
      formRef.setError('heritageChoices.0.options.1.name', {
        type: 'required',
        message: 'Required',
      })
    })

    expect(result.current.hasRowError(0)).toBe(false)
    expect(result.current.hasRowError(1)).toBe(true)
  })
})

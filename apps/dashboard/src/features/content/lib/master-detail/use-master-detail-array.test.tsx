import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldErrors,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import {
  autoSelectFirstInvalid,
  findFirstInvalidRowIndex,
  useMasterDetailArray,
} from './use-master-detail-array'

type FeatureRow = { name: string }

function createFormWrapper<T extends FieldValues>(defaultValues: DefaultValues<T>) {
  const holder: { form?: UseFormReturn<T, unknown, T> } = {}

  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm<T>({ defaultValues })
    useEffect(() => {
      holder.form = form
    }, [form])
    return <FormProvider {...form}>{children}</FormProvider>
  }

  return {
    Wrapper,
    getForm: () => {
      if (!holder.form) throw new Error('Form not initialized')
      return holder.form
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
      heritage: {
        options: [undefined, { name: { message: 'Required', type: 'required' } }],
      },
    } as unknown as FieldErrors

    expect(findFirstInvalidRowIndex(errors, 'heritage.options')).toBe(1)
  })

  it('returns the first invalid package index for class starting equipment options', () => {
    const errors = {
      characterCreation: {
        startingEquipment: {
          options: [undefined, { label: { message: 'Required', type: 'required' } }],
        },
      },
    } as unknown as FieldErrors

    expect(findFirstInvalidRowIndex(errors, 'characterCreation.startingEquipment.options')).toBe(1)
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
      heritage: { options: FeatureRow[] }
    }

    const { Wrapper, getForm } = createFormWrapper<HeritageForm>({
      heritage: { options: [{ name: 'A' }, { name: '' }] },
    })

    const { result } = renderHook(() => useMasterDetailArray('heritage.options', makeDefaults), {
      wrapper: Wrapper,
    })

    act(() => {
      getForm().setError('heritage.options.1.name', {
        type: 'required',
        message: 'Required',
      })
    })

    expect(result.current.hasRowError(0)).toBe(false)
    expect(result.current.hasRowError(1)).toBe(true)
  })

  it('reports row validation errors for class starting equipment package paths', () => {
    type StartingEquipmentForm = {
      characterCreation: {
        startingEquipment: {
          choose: number
          options: Array<{ id: string; label: string; items: never[] }>
        }
      }
    }

    const { Wrapper, getForm } = createFormWrapper<StartingEquipmentForm>({
      characterCreation: {
        startingEquipment: {
          choose: 1,
          options: [
            { id: 'standard', label: 'Standard Equipment', items: [] },
            { id: 'gold', label: '', items: [] },
          ],
        },
      },
    })

    const { result } = renderHook(
      () => useMasterDetailArray('characterCreation.startingEquipment.options', makeDefaults),
      { wrapper: Wrapper },
    )

    act(() => {
      getForm().setError('characterCreation.startingEquipment.options.1.label', {
        type: 'required',
        message: 'Required',
      })
    })

    expect(result.current.hasRowError(0)).toBe(false)
    expect(result.current.hasRowError(1)).toBe(true)
  })
})

import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { useMasterDetailArray } from './use-master-detail-array'

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm({ defaultValues: { features: [] as Array<{ name: string }> } })
  return <FormProvider {...form}>{children}</FormProvider>
}

const makeDefaults = () => ({ name: '' })

describe('useMasterDetailArray', () => {
  it('starts empty with no selection', () => {
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })
    expect(result.current.fields).toHaveLength(0)
    expect(result.current.selectedIndex).toBeNull()
  })

  it('appends a row and selects it', () => {
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })

    act(() => result.current.handleAdd())
    expect(result.current.fields).toHaveLength(1)
    expect(result.current.selectedIndex).toBe(0)

    act(() => result.current.handleAdd())
    expect(result.current.fields).toHaveLength(2)
    expect(result.current.selectedIndex).toBe(1)
  })

  it('selects a given index', () => {
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })
    act(() => result.current.handleAdd())
    act(() => result.current.handleAdd())

    act(() => result.current.select(0))
    expect(result.current.selectedIndex).toBe(0)
  })

  it('clamps selection when the selected row is removed', () => {
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })
    act(() => result.current.handleAdd())
    act(() => result.current.handleAdd())
    act(() => result.current.handleAdd())
    act(() => result.current.select(2))

    act(() => result.current.handleRemove(2))
    expect(result.current.fields).toHaveLength(2)
    expect(result.current.selectedIndex).toBe(1)
  })

  it('shifts selection down when an earlier row is removed', () => {
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })
    act(() => result.current.handleAdd())
    act(() => result.current.handleAdd())
    act(() => result.current.select(1))

    act(() => result.current.handleRemove(0))
    expect(result.current.selectedIndex).toBe(0)
  })

  it('clears selection when the last row is removed', () => {
    const { result } = renderHook(() => useMasterDetailArray('features', makeDefaults), {
      wrapper: Wrapper,
    })
    act(() => result.current.handleAdd())

    act(() => result.current.handleRemove(0))
    expect(result.current.fields).toHaveLength(0)
    expect(result.current.selectedIndex).toBeNull()
  })
})

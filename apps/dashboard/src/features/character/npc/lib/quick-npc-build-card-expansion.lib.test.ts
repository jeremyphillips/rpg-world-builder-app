/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useQuickNpcBuildCardExpandedAttribute } from './quick-npc-build-card-expansion.lib'

describe('useQuickNpcBuildCardExpandedAttribute', () => {
  it('closes class expansion when class progression becomes inapplicable', () => {
    const { result, rerender } = renderHook(
      ({ classProgressionApplicable, classId }) =>
        useQuickNpcBuildCardExpandedAttribute({ classProgressionApplicable, classId }),
      {
        initialProps: { classProgressionApplicable: true, classId: '' },
      },
    )

    expect(result.current[0]).toBe('class')

    rerender({ classProgressionApplicable: false, classId: '' })

    expect(result.current[0]).toBeNull()
  })

  it('opens class when progression becomes applicable with an empty classId', () => {
    const { result, rerender } = renderHook(
      ({ classProgressionApplicable, classId }) =>
        useQuickNpcBuildCardExpandedAttribute({ classProgressionApplicable, classId }),
      {
        initialProps: { classProgressionApplicable: false, classId: '' },
      },
    )

    expect(result.current[0]).toBeNull()

    rerender({ classProgressionApplicable: true, classId: '' })

    expect(result.current[0]).toBe('class')
  })

  it('reopens class when classId is cleared externally', () => {
    const { result, rerender } = renderHook(
      ({ classProgressionApplicable, classId }) =>
        useQuickNpcBuildCardExpandedAttribute({ classProgressionApplicable, classId }),
      {
        initialProps: { classProgressionApplicable: true, classId: 'rogue-id' },
      },
    )

    act(() => {
      result.current[1]('level')
    })
    expect(result.current[0]).toBe('level')

    rerender({ classProgressionApplicable: true, classId: '' })

    expect(result.current[0]).toBe('class')
  })
})

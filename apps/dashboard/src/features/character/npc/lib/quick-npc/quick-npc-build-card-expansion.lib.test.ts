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
        useQuickNpcBuildCardExpandedAttribute({
          classProgressionApplicable,
          classId,
          roleRowEnabled: false,
          npcTemplateId: '',
        }),
      {
        initialProps: {
          classProgressionApplicable: true,
          classId: '',
          roleRowEnabled: false,
          npcTemplateId: '',
        },
      },
    )

    expect(result.current[0]).toBe('class')

    rerender({
      classProgressionApplicable: false,
      classId: '',
      roleRowEnabled: false,
      npcTemplateId: '',
    })

    expect(result.current[0]).toBeNull()
  })

  it('opens class when progression becomes applicable with an empty classId', () => {
    const { result, rerender } = renderHook(
      ({ classProgressionApplicable, classId }) =>
        useQuickNpcBuildCardExpandedAttribute({
          classProgressionApplicable,
          classId,
          roleRowEnabled: false,
          npcTemplateId: '',
        }),
      {
        initialProps: {
          classProgressionApplicable: false,
          classId: '',
          roleRowEnabled: false,
          npcTemplateId: '',
        },
      },
    )

    expect(result.current[0]).toBeNull()

    rerender({
      classProgressionApplicable: true,
      classId: '',
      roleRowEnabled: false,
      npcTemplateId: '',
    })

    expect(result.current[0]).toBe('class')
  })

  it('reopens class when classId is cleared externally', () => {
    const { result, rerender } = renderHook(
      ({ classProgressionApplicable, classId }) =>
        useQuickNpcBuildCardExpandedAttribute({
          classProgressionApplicable,
          classId,
          roleRowEnabled: false,
          npcTemplateId: '',
        }),
      {
        initialProps: {
          classProgressionApplicable: true,
          classId: 'rogue-id',
          roleRowEnabled: false,
          npcTemplateId: '',
        },
      },
    )

    act(() => {
      result.current[1]('role')
    })
    expect(result.current[0]).toBe('role')

    rerender({
      classProgressionApplicable: true,
      classId: '',
      roleRowEnabled: false,
      npcTemplateId: '',
    })

    expect(result.current[0]).toBe('class')
  })

  it('opens role when the org-member role row is enabled and unset', () => {
    const { result } = renderHook(() =>
      useQuickNpcBuildCardExpandedAttribute({
        classProgressionApplicable: true,
        classId: '',
        roleRowEnabled: true,
        npcTemplateId: '',
      }),
    )

    expect(result.current[0]).toBe('role')
  })
})

import { describe, expect, it } from 'vitest'

import {
  buildArrayAddMenuItems,
  resolveArrayAddMenuAppendDefaults,
  resolveArrayAddMenuItemPresentation,
} from './array-add-menu.lib'

describe('array-add-menu.lib', () => {
  it('resolves static and factory append defaults', () => {
    expect(resolveArrayAddMenuAppendDefaults({ grantType: 'movement' })).toEqual({
      grantType: 'movement',
    })
    expect(resolveArrayAddMenuAppendDefaults(() => ({ grantType: 'languages' }))).toEqual({
      grantType: 'languages',
    })
  })

  it('applies duplicate policies', () => {
    const item = {
      id: 'movement-bonus',
      label: 'Movement bonus',
      appendDefaults: { grantType: 'movement' },
      isDuplicate: (items: unknown[]) =>
        (items as Array<{ grantType?: string }>).some((row) => row.grantType === 'movement'),
    }

    expect(resolveArrayAddMenuItemPresentation(item, [])).toEqual({ disabled: false })
    expect(resolveArrayAddMenuItemPresentation(item, [{ grantType: 'movement' }])).toEqual({
      disabled: false,
    })
    expect(
      resolveArrayAddMenuItemPresentation({ ...item, duplicatePolicy: 'warn' as const }, [
        { grantType: 'movement' },
      ]),
    ).toEqual({ disabled: false, note: 'Already added' })
    expect(
      resolveArrayAddMenuItemPresentation({ ...item, duplicatePolicy: 'block' as const }, [
        { grantType: 'movement' },
      ]),
    ).toEqual({ disabled: true, note: 'Already added' })
  })

  it('builds button dropdown items from menu config', () => {
    const menu = {
      groups: [{ id: 'combat-traits', label: 'Combat & traits' }],
      items: [
        {
          id: 'movement-bonus',
          label: 'Movement bonus',
          groupId: 'combat-traits',
          appendDefaults: { grantType: 'movement' },
          duplicatePolicy: 'block' as const,
          isDuplicate: (items: unknown[]) =>
            (items as Array<{ grantType?: string }>).some((row) => row.grantType === 'movement'),
        },
      ],
    }

    expect(buildArrayAddMenuItems(menu, [{ grantType: 'movement' }])).toEqual([
      expect.objectContaining({
        id: 'movement-bonus',
        disabled: true,
        note: 'Already added',
      }),
    ])
  })
})

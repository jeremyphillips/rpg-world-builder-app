import { describe, expect, it, vi } from 'vitest'

import { buildRelationshipOverflowActions } from './resolve-relationship-overflow-actions'

describe('buildRelationshipOverflowActions', () => {
  it('shows view and remove when supported regardless of availability semantics', () => {
    const view = vi.fn()
    const remove = vi.fn()

    const actions = buildRelationshipOverflowActions({
      capabilities: {
        view: { supported: true, availability: 'available' },
        remove: { supported: true, availability: 'available' },
      },
      labels: { view: 'View location', remove: 'Remove' },
      handlers: { view, remove },
    })

    expect(actions).toHaveLength(2)
    actions[0]?.onSelect()
    actions[1]?.onSelect()
    expect(view).toHaveBeenCalledOnce()
    expect(remove).toHaveBeenCalledOnce()
  })

  it('shows alternative mutations only when availability is available', () => {
    const actions = buildRelationshipOverflowActions({
      capabilities: {
        changeKind: { supported: true, availability: 'available' },
        changeTarget: { supported: true, availability: 'unavailable' },
        replaceSubject: { supported: true, availability: 'unknown' },
      },
      labels: {
        changeKind: 'Change type',
        changeTarget: 'Change location',
        replaceSubject: 'Replace',
      },
      handlers: {
        changeKind: () => undefined,
        changeTarget: () => undefined,
        replaceSubject: () => undefined,
      },
    })

    expect(actions.map((action) => action.id)).toEqual(['changeKind'])
  })
})

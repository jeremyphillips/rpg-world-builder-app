import { describe, expect, it } from 'vitest'

import { resolveOverviewQueryState } from './campaign-overview-query-state'

function queryState(overrides: { isPending?: boolean; isError?: boolean; error?: Error | null }) {
  return {
    isPending: overrides.isPending ?? false,
    isError: overrides.isError ?? false,
    error: overrides.error ?? null,
  }
}

describe('resolveOverviewQueryState', () => {
  it('includes invite query state only for managers', () => {
    const members = queryState({})
    const party = queryState({ isPending: true })
    const invites = queryState({ isError: true, error: new Error('Invite failure') })

    expect(resolveOverviewQueryState(members, party, invites, false)).toEqual({
      isPending: true,
      isError: false,
      errorLabel: undefined,
    })

    expect(resolveOverviewQueryState(members, party, invites, true)).toEqual({
      isPending: true,
      isError: true,
      errorLabel: 'Invite failure',
    })
  })
})

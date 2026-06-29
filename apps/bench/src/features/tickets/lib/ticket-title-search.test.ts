import { describe, expect, it } from 'vitest'

import { normalizeTicketTitleSearchText, ticketTitleMatchesSearch } from './ticket-title-search'

describe('normalizeTicketTitleSearchText', () => {
  it('lowercases and strips special characters', () => {
    expect(normalizeTicketTitleSearchText('  Fix: Auth Bug!  ')).toBe('fixauthbug')
  })
})

describe('ticketTitleMatchesSearch', () => {
  it('matches normalized substrings', () => {
    expect(ticketTitleMatchesSearch('Validate epic area on create', 'epic area')).toBe(true)
  })

  it('returns all titles when search is empty', () => {
    expect(ticketTitleMatchesSearch('Any title', '')).toBe(true)
    expect(ticketTitleMatchesSearch('Any title', undefined)).toBe(true)
    expect(ticketTitleMatchesSearch('Any title', '!!!')).toBe(true)
  })
})

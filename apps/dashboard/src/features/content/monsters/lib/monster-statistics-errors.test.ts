import { describe, expect, it } from 'vitest'

import {
  statisticsFieldIsInvalid,
  statisticsIssueLabel,
  statisticsIssuesForDisplay,
} from './monster-statistics-errors'

describe('statisticsIssuesForDisplay', () => {
  it('keeps statistics paths and drops other tabs', () => {
    expect(
      statisticsIssuesForDisplay([
        { path: 'creatureType', message: 'Choose a creature type.' },
        { path: 'armorClass.bonus', message: 'Enter a bonus of at least 1.' },
        { path: 'actions.0.name', message: 'Enter a name.' },
        { path: 'abilityScores.str', message: 'Enter a score from 1 to 30.' },
      ]),
    ).toEqual([
      { path: 'armorClass.bonus', message: 'Enter a bonus of at least 1.' },
      { path: 'abilityScores.str', message: 'Enter a score from 1 to 30.' },
    ])
  })
})

describe('statisticsFieldIsInvalid', () => {
  it('matches the issue path, its parent, and its children', () => {
    const issues = [{ path: 'armorClass.bonus', message: 'Enter a bonus of at least 1.' }]
    expect(statisticsFieldIsInvalid(issues, 'armorClass.bonus')).toBe(true)
    expect(statisticsFieldIsInvalid(issues, 'armorClass')).toBe(true)
    expect(statisticsFieldIsInvalid(issues, 'hitPoints')).toBe(false)
  })
})

describe('statisticsIssueLabel', () => {
  it('names the ability and the section', () => {
    expect(statisticsIssueLabel('abilityScores.str')).toBe('STR')
    expect(statisticsIssueLabel('challengeRating')).toBe('Challenge rating')
  })
})

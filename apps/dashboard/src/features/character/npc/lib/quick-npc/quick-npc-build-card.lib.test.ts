import { describe, expect, it } from 'vitest'

import {
  QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  QUICK_NPC_BUILD_CHANGE_ROLE_LABEL,
  QUICK_NPC_BUILD_DONE_LABEL,
  resolveQuickNpcBuildCardExpandActionLabel,
} from './quick-npc-build-card.lib'
import {
  buildQuickNpcRoleRadioCardPresentation,
  QUICK_NPC_ROLE_ALL_GROUP_EYEBROW,
} from './quick-npc-npc-template-option.lib'
import { QUICK_NPC_RECOMMENDED_GROUP_EYEBROW } from './quick-npc-affinity-option-groups.lib'

describe('buildQuickNpcRoleRadioCardPresentation', () => {
  it('groups the suggested template under Recommended with all others below', () => {
    const presentation = buildQuickNpcRoleRadioCardPresentation('criminal')
    expect(presentation.optionGroups?.[0]).toMatchObject({
      id: 'recommended',
      eyebrow: QUICK_NPC_RECOMMENDED_GROUP_EYEBROW,
      options: [{ value: 'criminal', label: 'Criminal' }],
    })
    expect(presentation.optionGroups?.[1]?.eyebrow).toBe(QUICK_NPC_ROLE_ALL_GROUP_EYEBROW)
    expect(presentation.optionGroups?.[1]?.options.some((o) => o.value === 'criminal')).toBe(false)
  })

  it('returns a flat list when there is no suggestion', () => {
    const presentation = buildQuickNpcRoleRadioCardPresentation(undefined)
    expect(presentation.optionGroups).toBeUndefined()
    expect(presentation.options.length).toBeGreaterThan(0)
  })
})

describe('resolveQuickNpcBuildCardExpandActionLabel', () => {
  it.each([
    ['role', QUICK_NPC_BUILD_CHANGE_ROLE_LABEL],
    ['class', QUICK_NPC_BUILD_CHANGE_CLASS_LABEL],
  ] as const)('returns the change label for %s when collapsed', (kind, expected) => {
    expect(resolveQuickNpcBuildCardExpandActionLabel(kind, false)).toBe(expected)
  })

  it.each(['role', 'class'] as const)('returns Done when %s row is expanded', (kind) => {
    expect(resolveQuickNpcBuildCardExpandActionLabel(kind, true)).toBe(QUICK_NPC_BUILD_DONE_LABEL)
  })
})

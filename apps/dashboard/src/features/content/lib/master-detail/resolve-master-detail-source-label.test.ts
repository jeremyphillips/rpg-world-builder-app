import { describe, expect, it } from 'vitest'

import { resolveMasterDetailSourceLabel } from './resolve-master-detail-source-label'

describe('resolveMasterDetailSourceLabel', () => {
  it('uses catalog layer labels for persisted rows and one unsaved label', () => {
    expect(resolveMasterDetailSourceLabel('system')).toBe('System')
    expect(resolveMasterDetailSourceLabel('homebrew')).toBe('Homebrew')
    expect(resolveMasterDetailSourceLabel('unsaved')).toBe('Unsaved')
  })
})

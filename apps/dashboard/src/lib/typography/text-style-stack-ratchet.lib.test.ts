import { describe, expect, it } from 'vitest'

import {
  classStringViolatesMigratedStacks,
  extractCnMergedClassStrings,
  findTextStyleStackViolations,
  textTagUsesTextStyleUtility,
  textTagViolatesMigratedStacks,
} from './text-style-stack-ratchet.lib'

describe('text-style-stack-ratchet.lib', () => {
  it('flags sm + muted in any token order', () => {
    expect(classStringViolatesMigratedStacks('text-muted-foreground text-sm')).toMatch(/supporting/)
  })

  it('allows sm + muted when medium weight is present (deferred)', () => {
    expect(
      classStringViolatesMigratedStacks('text-xs font-medium text-muted-foreground'),
    ).toBeNull()
  })

  it('flags sm + font-medium without color', () => {
    expect(classStringViolatesMigratedStacks('truncate text-sm font-medium')).toMatch(/label/)
  })

  it('allows sm + font-medium + foreground (deferred compact body)', () => {
    expect(classStringViolatesMigratedStacks('text-sm font-medium text-foreground')).toBeNull()
  })

  it('detects cn merged literals', () => {
    const merged = extractCnMergedClassStrings(`className={cn('text-sm', 'text-muted-foreground')}`)
    expect(merged).toEqual(['text-sm text-muted-foreground'])
    expect(classStringViolatesMigratedStacks(merged[0]!)).not.toBeNull()
  })

  it('flags Text with text-style utility in className', () => {
    expect(
      textTagUsesTextStyleUtility('<Text as="p" className="mt-2 text-style-supporting">'),
    ).not.toBeNull()
  })

  it('allows Text with variant and layout-only className', () => {
    expect(
      textTagUsesTextStyleUtility('<Text variant="label" className="text-foreground truncate">'),
    ).toBeNull()
  })

  it('flags muted + text-sm on Text', () => {
    expect(
      textTagViolatesMigratedStacks('<Text variant="muted" className="text-sm">'),
    ).not.toBeNull()
  })

  it('flags retired Text variant="small"', () => {
    expect(textTagViolatesMigratedStacks('<Text variant="small">')).toMatch(/retired/)
  })

  it('flags retired text-style-small utility', () => {
    expect(classStringViolatesMigratedStacks('text-style-small')).toMatch(/retired/)
  })

  it('allows body + font-medium on Text (deferred)', () => {
    expect(
      textTagViolatesMigratedStacks('<Text variant="body" className="font-medium">'),
    ).toBeNull()
  })

  it('findTextStyleStackViolations skips its own test files', () => {
    expect(findTextStyleStackViolations('', 'text-style-stack-ratchet.lib.test.ts')).toEqual([])
  })
})

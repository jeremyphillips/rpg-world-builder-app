import { describe, expect, it } from 'vitest'

import {
  classStringViolatesMigratedStacks,
  extractCnMergedClassStrings,
  extractTemplateLiteralClassStrings,
  findTextStyleStackViolations,
  pTagViolatesTypographyOwnership,
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

  it('detects cn ternary branches merged with sibling literals', () => {
    const merged = extractCnMergedClassStrings(
      `className={cn(show ? 'text-sm' : 'hidden', 'text-muted-foreground')}`,
    )
    expect(merged.some((s) => classStringViolatesMigratedStacks(s))).toBe(true)
  })

  it('detects static template literal class strings', () => {
    const literals = extractTemplateLiteralClassStrings(
      'className={`text-sm text-muted-foreground`}',
    )
    expect(literals).toEqual(['text-sm text-muted-foreground'])
    expect(classStringViolatesMigratedStacks(literals[0]!)).not.toBeNull()
  })

  it('skips template literals with interpolation', () => {
    expect(extractTemplateLiteralClassStrings('className={`text-sm ${active}`}')).toEqual([])
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

  it('flags redundant muted on supporting', () => {
    expect(
      textTagViolatesMigratedStacks(
        '<Text variant="supporting" className="text-muted-foreground">',
      ),
    ).toMatch(/redundant/)
  })

  it('reads braced string variant on Text', () => {
    expect(
      textTagViolatesMigratedStacks("<Text variant={'muted'} className='text-sm'>"),
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

  it('flags p with text-style utility in className', () => {
    expect(pTagViolatesTypographyOwnership('<p className="text-style-supporting">')).toMatch(
      /text-style/,
    )
  })

  it('flags p with font-body-emphasis', () => {
    expect(pTagViolatesTypographyOwnership('<p className="text-sm font-body-emphasis">')).toMatch(
      /emphasis/,
    )
  })

  it('flags p with heading-style utility', () => {
    expect(pTagViolatesTypographyOwnership('<p className="heading-style-card">')).toMatch(
      /heading-style/,
    )
  })

  it('allows p with layout-only className', () => {
    expect(pTagViolatesTypographyOwnership('<p className="px-4 py-3 text-center">')).toBeNull()
  })

  it('allows Card description shell class on p', () => {
    expect(
      pTagViolatesTypographyOwnership('<p className={cn(UI_CARD_DESCRIPTION_CLASS, className)}>'),
    ).toBeNull()
  })

  it('allows sr-only p', () => {
    expect(pTagViolatesTypographyOwnership('<p className="sr-only">')).toBeNull()
  })

  it('flags p with cn text-style in className', () => {
    expect(
      findTextStyleStackViolations(
        `<p className={cn('py-3 text-center text-style-supporting', inset)}>`,
        'example.tsx',
      ),
    ).toEqual([
      { file: 'example.tsx', reason: 'p className includes text-style-* (use <Text variant="…">)' },
    ])
  })

  it('flags multiline p opening tag with text-style utility', () => {
    expect(
      findTextStyleStackViolations(
        `<p\n  className="text-style-supporting"\n  id="hint"\n>`,
        'example.tsx',
      ),
    ).toEqual([
      { file: 'example.tsx', reason: 'p className includes text-style-* (use <Text variant="…">)' },
    ])
  })
})

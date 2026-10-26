import { describe, expect, it } from 'vitest'

import { resolveArrayAddButtonSize } from '../../../components/ui/field-sizing.variants'

describe('resolveArrayAddButtonSize', () => {
  it('uses xs for inline text add actions', () => {
    expect(resolveArrayAddButtonSize('md', undefined, 'inline', 'text')).toBe('xs')
    expect(resolveArrayAddButtonSize('md', undefined, 'inline', 'outline')).toBe('sm')
    expect(resolveArrayAddButtonSize('md', undefined, 'stacked', 'text')).toBe('default')
  })
})

import { describe, expect, it } from 'vitest'
import * as contracts from '../../../index'
import * as envelope from './envelope'

describe('catalogLayer rename guard', () => {
  it('does not export removed content source symbols', () => {
    expect('CONTENT_SOURCES' in contracts).toBe(false)
    expect('contentSourceSchema' in contracts).toBe(false)
    expect('ContentSource' in contracts).toBe(false)
    expect('CONTENT_SOURCES' in envelope).toBe(false)
    expect('contentSourceSchema' in envelope).toBe(false)
  })
})

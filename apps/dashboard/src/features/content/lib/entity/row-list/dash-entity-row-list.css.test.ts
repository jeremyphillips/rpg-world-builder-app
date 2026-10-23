import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'dash-entity-row-list.css'),
  'utf8',
)

describe('dash-entity-row-list CSS', () => {
  it('rules only consecutive groups', () => {
    expect(css).toContain(
      ".dash-entity-row-list > [data-slot='entity-row-list-group'] + [data-slot='entity-row-list-group']",
    )
    const rule = css.slice(css.indexOf('.dash-entity-row-list'))
    expect(rule).toContain('border-top: 1px solid var(--border-subtle)')
    expect(rule).not.toMatch(/margin|padding/)
  })
})

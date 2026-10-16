import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'choice-control.css')
const css = readFileSync(cssPath, 'utf8')

describe('choice-control circle appearance CSS', () => {
  it('keeps the checked root transparent and hides indeterminate marks', () => {
    expect(css).toContain(
      ".ui-choice-control--checkbox.ui-choice-control--circle[data-state='checked'],",
    )
    expect(css).toContain("[aria-checked='true']::before")
    expect(css).toContain('background-color: transparent')
    expect(css).toContain(
      ".ui-choice-control--checkbox.ui-choice-control--circle[data-state='indeterminate']",
    )
    expect(css).toContain('display: none')
  })
})

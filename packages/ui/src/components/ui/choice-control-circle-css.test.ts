import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'choice-control.css')
const css = readFileSync(cssPath, 'utf8')

describe('choice-control circle appearance CSS', () => {
  it('reads checked circle fill from the shared choice tone variables', () => {
    expect(css).toContain("[data-choice-tone='success']")
    expect(css).toContain('var(--choice-indicator-fill, var(--primary))')
    expect(css).not.toContain('background-color: var(--success)')
    expect(css).not.toContain('color: var(--success-foreground)')
  })

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

  it('suppresses default control shadow only when not focus-visible so the shared focus ring can paint', () => {
    expect(css).toContain(
      '.ui-choice-control--checkbox.ui-choice-control--circle:not(:focus-visible)',
    )
    expect(css).toMatch(
      /\.ui-choice-control--checkbox\.ui-choice-control--circle:not\(:focus-visible\)\s*\{[^}]*box-shadow:\s*none/s,
    )
    expect(css).not.toMatch(
      /\.ui-choice-control--checkbox\.ui-choice-control--circle\s*\{[^}]*box-shadow:\s*none/s,
    )
  })

  it('uses lift surface and choice border on hover without shadow', () => {
    expect(css).toMatch(
      /\.ui-choice-control--checkbox\.ui-choice-control--circle:hover:not\(:disabled\)\s*\{[^}]*background-color:\s*var\(--surface-lift\)/s,
    )
    expect(css).toMatch(
      /\.ui-choice-control--checkbox\.ui-choice-control--circle:hover:not\(:disabled\)\s*\{[^}]*border-color:\s*var\(--choice-control-border\)/s,
    )
    expect(css).not.toContain('var(--control-hover-bg)')
  })

  it('expands the circle label on hover and focus without clipping the root', () => {
    expect(css).toContain('.ui-choice-control-expand-anchor')
    expect(css).toContain('vertical-align: middle')
    expect(css).toContain('isolation: isolate')
    expect(css).toContain('grid-template-columns: minmax(0, 0fr)')
    expect(css).toContain('grid-template-columns: minmax(0, 1fr)')
    expect(css).toContain('.ui-choice-control__expand-reserve')
    expect(css).toContain('visibility: hidden')
    const clipInner = css.match(/\.ui-choice-control__expand-clip-inner\s*\{[^}]+\}/s)?.[0]
    expect(clipInner).toContain('overflow: hidden')
    const expandRoot = css.match(
      /\.ui-choice-control--checkbox\.ui-choice-control--circle\.ui-choice-control--circle-expand\s*\{[^}]+\}/s,
    )?.[0]
    expect(expandRoot).toBeDefined()
    expect(expandRoot).not.toContain('overflow')
    expect(css).not.toMatch(/\.ui-choice-control__expand-label\s*\{[^}]*opacity/s)
  })

  it('keeps the circular indicator flat at rest with a solid unchecked fill', () => {
    const circleBeforeBlock = css.match(
      /\.ui-choice-control--checkbox\.ui-choice-control--circle::before\s*\{[^}]+\}/s,
    )?.[0]
    expect(circleBeforeBlock).toBeDefined()
    expect(circleBeforeBlock).toContain('background-color: var(--background)')
    expect(circleBeforeBlock).not.toContain('box-shadow')
  })
})

import { expect } from 'vitest'

/** Asserts catalog description fields store HTML, not plain strings. */
export function expectRichTextHtml(value: string | undefined): void {
  if (value === undefined || value === '') return
  expect(value.trimStart().startsWith('<')).toBe(true)
}

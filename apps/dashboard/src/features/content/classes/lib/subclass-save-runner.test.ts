import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const subclassDetailEditorHookPath = fileURLToPath(
  new URL('../hooks/use-subclass-detail-editor.ts', import.meta.url),
)

describe('subclass save runner adoption', () => {
  it('routes body save through useRunnerFormSubmit with an isolated producer session', () => {
    const source = readFileSync(subclassDetailEditorHookPath, 'utf8')
    expect(source).toContain('useRunnerFormSubmit')
    expect(source).toContain('FormUiProvider')
    expect(source).not.toContain('form.handleSubmit((values')
  })
})

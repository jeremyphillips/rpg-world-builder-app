import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// @ts-expect-error — JS eslint helper module (no .d.ts)
import { inlineMetadataSeparatorRestrictions } from '@rpg/config/eslint/inline-metadata-separator-restrictions'

describe('inline metadata ESLint guard (dashboard no-restricted-syntax merge)', () => {
  it('reports hand-rolled JSX metadata separators in a merged rule block', async () => {
    const eslint = new ESLint({
      overrideConfig: [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: {
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
          rules: {
            'no-restricted-syntax': [
              'error',
              ...inlineMetadataSeparatorRestrictions,
              {
                selector: 'Literal[value=/hover:bg-row-(hover|selected)/]',
                message: 'fixture decoy rule',
              },
            ],
          },
        },
      ],
    })

    const code = `export function Bad() { return <span>{'a'} · {'b'}</span> }`
    const [result] = await eslint.lintText(code, { filePath: 'src/features/example/bad.tsx' })

    expect(result?.messages.some((m) => m.ruleId === 'no-restricted-syntax')).toBe(true)
  })
})

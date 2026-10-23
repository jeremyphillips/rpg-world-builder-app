import { RuleTester } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, it } from 'vitest'

import { noIconProviderImport, noInlineSvg } from './rpg-icons.js'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
})

const filename = '/repo/apps/dashboard/src/example.tsx'

tester.run('rpg-icons/no-icon-provider-import', noIconProviderImport, {
  valid: [
    {
      filename,
      code: `import { useState } from 'react'`,
    },
    {
      filename: '/repo/packages/ui/src/components/ui/icon/icon-glyphs.lucide.ts',
      code: `import { Check, X } from 'lucide-react'`,
    },
    {
      filename: '/repo/packages/ui/src/components/ui/icon/icon-glyphs.lucide.test.ts',
      code: `import { Trash2 } from 'lucide-react'`,
    },
  ],
  invalid: [
    {
      filename,
      code: `import { Check } from 'lucide-react'`,
      errors: [{ messageId: 'forbidden', data: { name: 'Check' } }],
    },
    {
      filename,
      code: `import type { LucideIcon } from 'lucide-react'`,
      errors: [{ messageId: 'forbidden', data: { name: 'LucideIcon' } }],
    },
    {
      filename,
      code: `const { Check } = require('lucide-react')`,
      errors: [{ messageId: 'forbidden', data: { name: 'Check' } }],
    },
    {
      filename,
      code: `async function load() { const { Check } = await import('lucide-react'); return Check }`,
      errors: [{ messageId: 'forbidden', data: { name: 'Check' } }],
    },
  ],
})

tester.run('rpg-icons/no-inline-svg', noInlineSvg, {
  valid: [
    {
      filename: '/repo/packages/ui/src/components/ui/overlay-arrow.client.tsx',
      code: `export function Arrow() { return <svg /> }`,
    },
    {
      filename: '/repo/packages/ui/src/components/ui/icon/icon-glyphs.custom.tsx',
      code: `export function Glyph() { return <svg /> }`,
    },
    {
      filename: '/repo/packages/ui/src/components/ui/icon.stories.tsx',
      code: `export const Story = () => <svg />`,
    },
    {
      filename: '/repo/packages/ui/src/components/ui/icon.test.tsx',
      code: `export const Story = () => <svg />`,
    },
    {
      filename: '/repo/packages/ui/src/components/ui/button.client.tsx',
      code: `export function Button() { return <button><Icon /></button> }`,
    },
  ],
  invalid: [
    {
      filename: '/repo/apps/dashboard/src/foo.tsx',
      code: `export function Chart() { return <svg viewBox="0 0 1 1" /> }`,
      errors: [{ messageId: 'forbidden' }],
    },
  ],
})

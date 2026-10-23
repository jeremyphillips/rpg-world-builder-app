import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { RuleTester } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import { ICON_PROVIDER_ALLOWLIST, noIconProviderImport } from './rpg-icons.js'

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

function listed(names) {
  return [{ baseline: { 'apps/dashboard/src/example.tsx': names } }]
}

const filename = '/repo/apps/dashboard/src/example.tsx'

tester.run('rpg-icons/no-icon-provider-import', noIconProviderImport, {
  valid: [
    {
      filename,
      options: listed(['Check']),
      code: `import { Check } from 'lucide-react'`,
    },
    {
      filename,
      options: listed(['Link']),
      code: `import { Link as LinkIcon } from 'lucide-react'`,
    },
    {
      filename,
      options: [{ baseline: {} }],
      code: `import { useState } from 'react'`,
    },
    {
      filename: '/repo/packages/ui/src/components/ui/icon/icon-glyphs.lucide.ts',
      options: [{ baseline: {} }],
      code: `import { Check, X } from 'lucide-react'`,
    },
    {
      filename: '/repo/packages/ui/src/components/ui/icon/icon-glyphs.lucide.test.ts',
      options: [{ baseline: {} }],
      code: `import { Trash2 } from 'lucide-react'`,
    },
  ],
  invalid: [
    {
      filename,
      options: listed(['Check']),
      code: `import { X } from 'lucide-react'`,
      errors: [
        { messageId: 'stale', data: { name: 'Check' } },
        { messageId: 'unlisted', data: { name: 'X' } },
      ],
    },
    {
      filename,
      options: listed(['Check']),
      code: `import { Check, X } from 'lucide-react'`,
      errors: [{ messageId: 'unlisted', data: { name: 'X' } }],
    },
    {
      filename,
      options: listed(['LinkIcon']),
      code: `import { Link as LinkIcon } from 'lucide-react'`,
      errors: [
        { messageId: 'stale', data: { name: 'LinkIcon' } },
        { messageId: 'unlisted', data: { name: 'Link' } },
      ],
    },
    {
      filename,
      options: listed([]),
      code: `import type { LucideIcon } from 'lucide-react'`,
      errors: [{ messageId: 'unlisted', data: { name: 'LucideIcon' } }],
    },
    {
      filename,
      options: listed([]),
      code: `import Lucide from 'lucide-react'`,
      errors: [{ messageId: 'unlisted', data: { name: 'default' } }],
    },
    {
      filename,
      options: listed([]),
      code: `import * as icons from 'lucide-react'`,
      errors: [{ messageId: 'unlisted', data: { name: '*' } }],
    },
    {
      filename,
      options: listed([]),
      code: `export { Check as CheckIcon } from 'lucide-react'`,
      errors: [{ messageId: 'unlisted', data: { name: 'Check' } }],
    },
    {
      filename,
      options: listed([]),
      code: `export * from 'lucide-react'`,
      errors: [{ messageId: 'unlisted', data: { name: '*' } }],
    },
    {
      filename,
      options: listed([]),
      code: `export * as icons from '@phosphor-icons/react'`,
      errors: [{ messageId: 'unlisted', data: { name: '*' } }],
    },
    {
      filename,
      options: listed([]),
      code: `const { Check } = require('lucide-react')`,
      errors: [{ messageId: 'unlisted', data: { name: 'Check' } }],
    },
    {
      filename,
      options: listed([]),
      code: `const icons = require('@radix-ui/react-icons')`,
      errors: [{ messageId: 'unlisted', data: { name: '*' } }],
    },
    {
      filename,
      options: listed([]),
      code: `async function load() { const { Check } = await import('lucide-react'); return Check }`,
      errors: [{ messageId: 'unlisted', data: { name: 'Check' } }],
    },
    {
      filename,
      options: listed([]),
      code: `const pending = import('react-icons/lu')`,
      errors: [{ messageId: 'unlisted', data: { name: '*' } }],
    },
    {
      filename,
      options: listed([]),
      code: `import icons = require('lucide-react')`,
      errors: [{ messageId: 'unlisted', data: { name: '*' } }],
    },
    {
      filename,
      options: listed([]),
      code: `type Icon = import('@heroicons/react/24/outline').CheckIcon`,
      errors: [{ messageId: 'unlisted', data: { name: 'CheckIcon' } }],
    },
    {
      filename,
      options: listed([]),
      code: `import { Check } from 'lucide-react/dynamic'`,
      errors: [{ messageId: 'unlisted', data: { name: 'Check' } }],
    },
    {
      filename,
      options: listed(['Check', 'X']),
      code: `import { Check } from 'lucide-react'`,
      errors: [{ messageId: 'stale', data: { name: 'X' } }],
    },
  ],
})

describe('icon provider baseline', () => {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')
  const baseline = JSON.parse(
    readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'icon-provider-baseline.json'),
      'utf8',
    ),
  )

  it('lists only files that exist under the icon-provider scope', () => {
    const paths = Object.keys(baseline)
    if (paths.length === 0) {
      return
    }
    for (const relativePath of paths) {
      expect(relativePath.startsWith('packages/ui/') || relativePath.startsWith('apps/')).toBe(true)
      expect(
        relativePath.startsWith('packages/ui/') ||
          relativePath.startsWith('apps/dashboard/') ||
          relativePath.startsWith('apps/bench/') ||
          relativePath.startsWith('apps/public/'),
      ).toBe(true)
      expect(ICON_PROVIDER_ALLOWLIST.has(relativePath)).toBe(false)
      expect(existsSync(join(repoRoot, relativePath))).toBe(true)
      const names = baseline[relativePath]
      expect(names.length).toBeGreaterThan(0)
      expect(new Set(names).size).toBe(names.length)
      expect([...names].sort()).toEqual(names)
    }
    expect([...paths].sort()).toEqual(paths)
  })
})

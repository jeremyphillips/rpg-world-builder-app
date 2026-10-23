import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import tseslint from 'typescript-eslint'

import {
  ICON_PROVIDER_ALLOWLIST,
  collectIconProviderBindings,
  repoRelativePath,
} from './rpg-icons.js'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')
const roots = ['packages/ui', 'apps/dashboard', 'apps/bench', 'apps/public']

function walk(dir, files) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === 'storybook-static') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, files)
    else if (/\.(ts|tsx)$/.test(entry)) files.push(full)
  }
}

const files = []
for (const root of roots) walk(join(repoRoot, root), files)

const baseline = {}
for (const file of files) {
  const relativePath = repoRelativePath(file)
  if (ICON_PROVIDER_ALLOWLIST.has(relativePath)) continue
  const text = readFileSync(file, 'utf8')
  if (
    !/lucide-react|lucide\/|@lucide\/|react-icons|@heroicons\/|@phosphor-icons\/|@tabler\/icons-react|@radix-ui\/react-icons/.test(
      text,
    )
  ) {
    continue
  }
  const { ast } = tseslint.parser.parseForESLint(text, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    filePath: file,
  })
  const names = [...collectIconProviderBindings(ast).keys()].sort()
  if (names.length > 0) baseline[relativePath] = names
}

const ordered = Object.fromEntries(
  Object.keys(baseline)
    .sort()
    .map((key) => [key, baseline[key]]),
)
const destination = join(dirname(fileURLToPath(import.meta.url)), 'icon-provider-baseline.json')
writeFileSync(destination, `${JSON.stringify(ordered, null, 2)}\n`)
console.log(`wrote ${Object.keys(ordered).length} files to ${destination}`)

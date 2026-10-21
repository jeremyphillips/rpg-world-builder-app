#!/usr/bin/env node
/**
 * Remove Storybook dev/build caches that can retain imports for deleted *.stories.tsx
 * files (common after refactors). pnpm hoists cache to the repo root and per-package
 * node_modules — clear every known location.
 */
import { rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')

const cacheDirs = [
  join(repoRoot, 'node_modules/.cache/storybook'),
  join(repoRoot, 'apps/dashboard/node_modules/.cache/storybook'),
  join(repoRoot, 'packages/ui/node_modules/.cache/storybook'),
]

for (const dir of cacheDirs) {
  try {
    rmSync(dir, { recursive: true, force: true })
  } catch {
    // Best-effort — missing cache is fine.
  }
}

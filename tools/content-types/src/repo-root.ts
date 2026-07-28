import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = join(fileURLToPath(import.meta.url), '../..')

/** Monorepo root — walks up from this tooling package until pnpm-workspace.yaml is found. */
export function resolveRepoRoot(): string {
  let current = PACKAGE_ROOT
  while (current !== dirname(current)) {
    if (existsSync(join(current, 'pnpm-workspace.yaml'))) {
      return current
    }
    current = dirname(current)
  }
  throw new Error('Could not resolve monorepo root from @rpg/content-types')
}

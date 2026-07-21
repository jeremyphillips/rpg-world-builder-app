import type { TermAuditConfig, TermAuditConfigEntry } from './types'

export const DEFAULT_IGNORED_GLOBS = [
  '.git/**',
  'node_modules/**',
  '**/node_modules/**',
  'dist/**',
  '**/dist/**',
  'coverage/**',
  '**/coverage/**',
  'generated/**',
  '**/generated/**',
  '**/*.json',
  '**/*.snap',
] as const

export const DEFAULT_TERM_AUDIT_CONFIG: TermAuditConfig = {
  ignore: DEFAULT_IGNORED_GLOBS,
  contextual: [],
}

function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§§')
    .replace(/\*/g, '[^/]*')
    .replace(/§§/g, '.*')

  return new RegExp(`^${escaped}$`)
}

export function matchesGlob(path: string, glob: string): boolean {
  return globToRegExp(glob).test(path)
}

export function findConfigEntry(
  config: TermAuditConfig,
  targetKey: string,
  relativePath: string,
): TermAuditConfigEntry | undefined {
  return config.contextual.find(
    (entry) => entry.target === targetKey && matchesGlob(relativePath, entry.path),
  )
}

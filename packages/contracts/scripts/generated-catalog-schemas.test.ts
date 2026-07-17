import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { CATALOG_SCHEMA_MANIFEST } from './catalog-schema-manifest'
import { findEnumOnlyRefs } from './json-schema-post-process'

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url))
const CONTRACTS_ROOT = join(SCRIPTS_DIR, '..')
const REPO_ROOT = join(CONTRACTS_ROOT, '../..')
const GENERATED_DIR = join(CONTRACTS_ROOT, 'generated')
const CATALOG_DATA_ROOT = join(REPO_ROOT, 'packages/catalog/src')

function loadGeneratedSchema(file: string): unknown {
  return JSON.parse(readFileSync(join(GENERATED_DIR, file), 'utf8'))
}

function listCatalogDataJsonFiles(dir = CATALOG_DATA_ROOT): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'data') {
        files.push(...listJsonFilesRecursive(path))
      } else {
        files.push(...listCatalogDataJsonFiles(path))
      }
    }
  }

  return files
}

function listJsonFilesRecursive(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listJsonFilesRecursive(path))
    } else if (entry.name.endsWith('.json')) {
      files.push(path)
    }
  }

  return files
}

function escapeRegexLiteral(value: string): string {
  return value.replace(/[.+^${}()|[\]\\]/g, '\\$&')
}

function globToRegExp(pattern: string): RegExp {
  const alternations: string[] = []
  const withAlternations = pattern.replace(/\{([^}]+)\}/g, (_, group: string) => {
    const token = `__ALT${alternations.length}__`
    alternations.push(group.split(',').map(escapeRegexLiteral).join('|'))
    return token
  })
  let escaped = withAlternations
    .replace(/\*\*\//g, '__GLOBSTAR_SLASH__')
    .replace(/\*\*/g, '__GLOBSTAR__')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[^/]*')
    .replace(/__GLOBSTAR_SLASH__/g, '(?:[^/]+/)*')
    .replace(/__GLOBSTAR__/g, '.*')

  for (const [index, alternation] of alternations.entries()) {
    escaped = escaped.replace(`__ALT${index}__`, `(?:${alternation})`)
  }

  return new RegExp(`^${escaped}$`)
}

function matchesAnyPattern(relativePath: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => globToRegExp(pattern).test(relativePath))
}

function collectObjectPaths(
  node: unknown,
  predicate: (path: string[], value: Record<string, unknown>) => boolean,
  path: string[] = [],
): string[][] {
  if (Array.isArray(node)) {
    return node.flatMap((item, index) =>
      collectObjectPaths(item, predicate, [...path, String(index)]),
    )
  }
  if (typeof node !== 'object' || node === null) return []

  const obj = node as Record<string, unknown>
  const matches = predicate(path, obj) ? [path] : []

  return matches.concat(
    Object.entries(obj).flatMap(([key, value]) =>
      collectObjectPaths(value, predicate, [...path, key]),
    ),
  )
}

describe('generated catalog JSON schemas', () => {
  it('manifest lists every generated catalog artifact', () => {
    const manifestFiles = CATALOG_SCHEMA_MANIFEST.map((entry) => entry.file)
    const generatedFiles = readdirSync(GENERATED_DIR).filter((name) =>
      name.endsWith('.schema.json'),
    )

    expect(new Set(manifestFiles)).toEqual(new Set(generatedFiles))
  })

  it('maps every catalog data JSON file through the manifest', () => {
    const catalogFiles = listCatalogDataJsonFiles().map((absolute) =>
      absolute.slice(REPO_ROOT.length + 1),
    )

    const patterns = CATALOG_SCHEMA_MANIFEST.flatMap((entry) => entry.fileMatch)
    const unmapped = catalogFiles.filter((file) => !matchesAnyPattern(file, patterns))

    expect(unmapped).toEqual([])
  })

  it('inlines enum-only refs in species schema for editor hover', () => {
    const schema = loadGeneratedSchema('catalog-species-list.schema.json')
    expect(findEnumOnlyRefs(schema)).toEqual([])
  })

  it('keeps vocab-backed enum hover on inlined spell grant fields', () => {
    const schema = loadGeneratedSchema('catalog-species-list.schema.json')

    const availabilityPaths = collectObjectPaths(
      schema,
      (_path, value) =>
        value.type === 'string' &&
        Array.isArray(value.enum) &&
        value.enum.includes('always_prepared') &&
        typeof value.description === 'string' &&
        String(value.description).includes('always_prepared'),
    )
    expect(availabilityPaths.length).toBeGreaterThan(0)

    const frequencyPaths = collectObjectPaths(
      schema,
      (_path, value) =>
        value.type === 'string' &&
        Array.isArray(value.enum) &&
        value.enum.includes('at_will') &&
        typeof value.description === 'string' &&
        String(value.description).includes('at_will | once_per_long_rest'),
    )
    expect(frequencyPaths.length).toBeGreaterThan(0)
  })

  it('surfaces closed-set hover on weapon category enums in equipment schema', () => {
    const schema = loadGeneratedSchema('catalog-equipment-list.schema.json')

    const weaponCategoryPaths = collectObjectPaths(
      schema,
      (_path, value) =>
        value.type === 'string' &&
        Array.isArray(value.enum) &&
        value.enum.includes('simple') &&
        value.enum.includes('martial') &&
        typeof value.description === 'string' &&
        String(value.description).includes('simple | martial'),
    )
    expect(weaponCategoryPaths.length).toBeGreaterThan(0)
  })

  it('surfaces union branch hover on proficiency grant kind fields', () => {
    const schema = loadGeneratedSchema('catalog-class.schema.json')

    const grantKindPaths = collectObjectPaths(
      schema,
      (_path, value) =>
        typeof value.markdownDescription === 'string' &&
        String(value.markdownDescription).includes('Branch on **kind**: **fixed** | **choice**'),
    )
    expect(grantKindPaths.length).toBeGreaterThan(0)
  })

  it('synthesizes plain descriptions for bare structural const branches', () => {
    const schema = loadGeneratedSchema('catalog-class.schema.json')

    const fixedKindConsts = collectObjectPaths(
      schema,
      (_path, value) =>
        value.type === 'string' &&
        value.const === 'fixed' &&
        typeof value.description === 'string' &&
        String(value.description) === 'fixed',
    )
    expect(fixedKindConsts.length).toBeGreaterThan(0)
  })

  it('synthesizes plain descriptions on structural proficiency grant kind consts', () => {
    const schema = loadGeneratedSchema('catalog-species-list.schema.json')

    const fixedKindConsts = collectObjectPaths(
      schema,
      (_path, value) => value.type === 'string' && value.const === 'fixed',
    )

    expect(fixedKindConsts.length).toBeGreaterThan(0)
    for (const path of fixedKindConsts) {
      let node: unknown = schema
      for (const segment of path) {
        node = (node as Record<string, unknown>)[segment]
      }
      expect((node as Record<string, unknown>).description).toBe('fixed')
    }
  })
})

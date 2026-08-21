import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const ENTITY_ROOT = join(__dirname, '..')

describe('entity item anatomy guard', () => {
  it('keeps status row spacing on the canonical lane', () => {
    const source = readFileSync(join(ENTITY_ROOT, 'summary/entity-summary.variants.ts'), 'utf8')
    expect(source).toMatch(/entityItemStatusRowVariants[\s\S]*mt-1/)
  })

  it('does not assign collection inset on EntityItem root', () => {
    const source = readFileSync(join(ENTITY_ROOT, 'item/entity-item.variants.ts'), 'utf8')
    expect(source).not.toMatch(/\bpx-\d/)
    expect(source).not.toMatch(/\bpx-\[/)
  })

  it('does not publish leading offset vars from anatomy or leading rail', () => {
    for (const file of [
      'item/entity-item.client.tsx',
      'item/entity-leading-rail.client.tsx',
      'item/entity-item-trailing.client.tsx',
    ]) {
      const source = readFileSync(join(ENTITY_ROOT, file), 'utf8')
      expect(source, `${file} must not publish --entity-leading-offset`).not.toMatch(
        /--entity-leading-offset/,
      )
    }
  })

  it('publishes leading offset from DEC and CEC surface roots only', () => {
    const decSource = readFileSync(
      join(ENTITY_ROOT, 'surfaces/cards/disclosure/disclosure-entity-card.client.tsx'),
      'utf8',
    )
    const frameSource = readFileSync(
      join(ENTITY_ROOT, 'surfaces/cards/content/entity-card-frame.client.tsx'),
      'utf8',
    )

    expect(decSource).toMatch(/buildEntityContentOffsetStyle/)
    expect(frameSource).toMatch(/buildEntityLeadingChromeSizeStyle/)
  })

  it('keeps explicit grid tracks without global horizontal gap', () => {
    const variantsSource = readFileSync(join(ENTITY_ROOT, 'item/entity-item.variants.ts'), 'utf8')
    const anatomyBlock = variantsSource.slice(
      variantsSource.indexOf('export const entityItemAnatomyVariants'),
      variantsSource.indexOf('export const entityItemLeadingSlotVariants'),
    )

    expect(variantsSource).toMatch(/col-start-2/)
    expect(variantsSource).toMatch(/col-start-3/)
    expect(anatomyBlock).not.toMatch(/\bgap-x-/)
  })

  it('keeps DEC on entity-card CLI row layout without consumer padding props', () => {
    const decSource = readFileSync(
      join(ENTITY_ROOT, 'surfaces/cards/disclosure/disclosure-entity-card.client.tsx'),
      'utf8',
    )

    expect(decSource).toMatch(/rowLayout="entity-card"/)
    expect(decSource).toMatch(/toolbarLeadingChrome="none"/)
    expect(decSource).toMatch(/DisclosureEntityCardHeader/)
    expect(decSource).not.toMatch(/\bEntityLeadingRail\b/)
    expect(decSource).not.toMatch(/\bclassName=\{[^}]*px-/)
    expect(decSource).not.toMatch(/\bclassName=\{[^}]*py-/)
  })

  it('does not export DisclosureEntityCardHeader from the content feature barrel', () => {
    const barrelSource = readFileSync(join(ENTITY_ROOT, '../../index.ts'), 'utf8')

    expect(barrelSource).not.toMatch(/DisclosureEntityCardHeader/)
  })

  it('keeps catalog entity row on entity-card CLI mode with shared anatomy', () => {
    const catalogRowSource = readFileSync(
      join(ENTITY_ROOT, 'surfaces/catalog/catalog-entity-row.client.tsx'),
      'utf8',
    )

    expect(catalogRowSource).toMatch(/rowLayout="entity-card"/)
    expect(catalogRowSource).toMatch(/toolbarLeadingChrome="none"/)
    expect(catalogRowSource).toMatch(/DisclosureEntityCardHeader/)
  })

  it('keeps entity-backed catalog pickers on CatalogEntityPickerSheet', () => {
    const featureRoot = join(ENTITY_ROOT, '../..')
    const allowlist = new Set([
      join(ENTITY_ROOT, 'surfaces/catalog/catalog-entity-picker-sheet.client.tsx'),
      join(ENTITY_ROOT, 'surfaces/cards/content/content-entity-card.test.tsx'),
    ])
    const entityPickerPattern =
      /(picker|drawer)\.(client|integration)\.(tsx|ts)$|(picker|drawer)\.client\.(tsx|ts)$/

    function walk(dir: string): string[] {
      return readdirSync(dir).flatMap((entry) => {
        const fullPath = join(dir, entry)
        if (statSync(fullPath).isDirectory()) {
          return walk(fullPath)
        }
        return fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') ? [fullPath] : []
      })
    }

    const violations: string[] = []

    for (const filePath of walk(featureRoot)) {
      if (!entityPickerPattern.test(filePath)) continue
      if (filePath.includes('.test.') || filePath.includes('.stories.')) continue
      if (allowlist.has(filePath)) continue

      const source = readFileSync(filePath, 'utf8')
      if (source.includes("from '@rpg/ui'") && source.match(/CatalogPickerSheet/)) {
        violations.push(filePath.replace(featureRoot + '/', ''))
      }
    }

    expect(violations).toEqual([])
  })

  it('does not import item/ from summary/', () => {
    const summaryDir = join(ENTITY_ROOT, 'summary')
    for (const file of readdirSync(summaryDir)) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue
      const source = readFileSync(join(summaryDir, file), 'utf8')
      expect(source, `summary/${file} must not import item/`).not.toMatch(/from ['"].*\/item\//)
    }
  })

  it('does not import surfaces/ from item/', () => {
    const itemDir = join(ENTITY_ROOT, 'item')
    for (const file of readdirSync(itemDir)) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue
      const source = readFileSync(join(itemDir, file), 'utf8')
      expect(source, `item/${file} must not import surfaces/`).not.toMatch(
        /from ['"].*\/surfaces\//,
      )
    }
  })
})

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { catalogPickerCardListClasses } from './catalog-picker-sheet.variants'

const variantsPath = fileURLToPath(new URL('./catalog-picker-sheet.variants.ts', import.meta.url))
const rowsPath = fileURLToPath(new URL('./catalog-picker-sheet-rows.client.tsx', import.meta.url))

describe('catalog picker card list spacing SSOT', () => {
  it('uses gap-only flex stack for sibling picker cards', () => {
    expect(catalogPickerCardListClasses).toContain('gap-2')
    expect(catalogPickerCardListClasses).toContain('flex flex-col')
    expect(catalogPickerCardListClasses).not.toMatch(/\bspace-y-/)

    const variantsSource = readFileSync(variantsPath, 'utf8')
    expect(variantsSource).not.toMatch(/space-y-\d/)
  })

  it('marks results list hosts for drift checks', () => {
    const rowsSource = readFileSync(rowsPath, 'utf8')
    expect(rowsSource).toContain('data-picker-card-list')
    expect(rowsSource).toContain('catalogPickerSheetListVariants')
  })
})

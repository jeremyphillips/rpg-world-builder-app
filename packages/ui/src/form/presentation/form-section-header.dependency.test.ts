import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const headerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'form-section-header.client.tsx'),
  'utf8',
)

describe('FormSectionHeader dependency boundary', () => {
  it('stays free of react-hook-form and form section context', () => {
    expect(headerSource).not.toMatch(/react-hook-form/)
    expect(headerSource).not.toMatch(/form-section\.context/)
  })
})

describe('FieldGroupLegend composition boundary', () => {
  it('may import FormSectionHeader from form presentation', () => {
    const legendSource = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '../../components/ui/field-group-legend.client.tsx',
      ),
      'utf8',
    )
    expect(legendSource).toMatch(/form-section-header/)
    expect(legendSource).not.toMatch(/react-hook-form/)
  })
})

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const ENTITY_ROOT = join(__dirname)

describe('entity item anatomy guard', () => {
  it('does not assign collection inset on EntityItem root', () => {
    const source = readFileSync(join(ENTITY_ROOT, 'entity-item.variants.ts'), 'utf8')
    expect(source).not.toMatch(/\bpx-\d/)
    expect(source).not.toMatch(/\bpx-\[/)
  })

  it('does not publish leading offset vars from anatomy or leading rail', () => {
    for (const file of [
      'entity-item.client.tsx',
      'entity-leading-rail.client.tsx',
      'entity-item-trailing.client.tsx',
    ]) {
      const source = readFileSync(join(ENTITY_ROOT, file), 'utf8')
      expect(source, `${file} must not publish --entity-leading-offset`).not.toMatch(
        /--entity-leading-offset/,
      )
    }
  })

  it('publishes leading offset from DEC and CEC surface roots only', () => {
    const decSource = readFileSync(join(ENTITY_ROOT, 'disclosure-entity-card.client.tsx'), 'utf8')
    const frameSource = readFileSync(join(ENTITY_ROOT, 'entity-card-frame.client.tsx'), 'utf8')

    expect(decSource).toMatch(/buildEntityLeadingOffsetStyle/)
    expect(frameSource).toMatch(/buildEntityLeadingOffsetStyle/)
  })

  it('keeps explicit grid tracks without global horizontal gap', () => {
    const variantsSource = readFileSync(join(ENTITY_ROOT, 'entity-item.variants.ts'), 'utf8')
    const anatomyBlock = variantsSource.slice(
      variantsSource.indexOf('export const entityItemAnatomyVariants'),
      variantsSource.indexOf('export const entityItemLeadingSlotVariants'),
    )

    expect(variantsSource).toMatch(/col-start-2/)
    expect(variantsSource).toMatch(/col-start-3/)
    expect(anatomyBlock).not.toMatch(/\bgap-x-/)
  })
})

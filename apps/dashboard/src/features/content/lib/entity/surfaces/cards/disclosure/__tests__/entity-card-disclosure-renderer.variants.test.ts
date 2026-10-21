import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { DASH_ENTITY_CARD_BODY_CLASS } from '../../../dash-entity-surface.variants'
import { disclosureEntityCardBodyWashVariants } from '../entity-card-disclosure-renderer.variants'

describe('disclosure entity card body wash', () => {
  it('uses dash-entity-card__body for expanded inline inset', () => {
    expect(disclosureEntityCardBodyWashVariants()).toContain(DASH_ENTITY_CARD_BODY_CLASS)
  })
})

describe('dash-entity-card content', () => {
  it('fills the available header region for full-width entity anatomy', () => {
    const cssPath = join(__dirname, '../../content/dash-entity-card.css')
    const css = readFileSync(cssPath, 'utf8')
    expect(css).toContain('.dash-entity-card__content')
    expect(css).toContain('width: 100%')
    expect(css).toContain('padding-block: var(--ui-card-inset-block)')
    expect(css).toContain('.dash-entity-card__body')
  })
})

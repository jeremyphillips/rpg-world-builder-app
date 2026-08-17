import { describe, expect, it } from 'vitest'

import { builderTestContext } from '../test-fixtures'
import { indexPlayableBuilderCatalog } from './index-playable-builder-catalog'
import { resolvePlayableBuilderContent } from './resolve-playable-builder-content'

describe('indexPlayableBuilderCatalog', () => {
  it('indexes resolver output without applying a second policy filter', () => {
    const playable = resolvePlayableBuilderContent(builderTestContext)
    const index = indexPlayableBuilderCatalog(builderTestContext)

    expect([...index.classes.keys()].sort()).toEqual(playable.classes.map(({ id }) => id).sort())
    expect([...index.species.keys()].sort()).toEqual(playable.species.map(({ id }) => id).sort())
    expect(index.skillProficiencies).toBe(builderTestContext.catalog.skillProficiencies)
    expect(index.languages).toBe(builderTestContext.catalog.languages)
  })
})

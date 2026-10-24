import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  collectContentTopInsetSelfReferences,
  findContentTopInsetSelfReferences,
} from './content-top-inset-self-reference.lib'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')

describe('content top inset self-reference', () => {
  it('flags a declaration that reads the same variable', () => {
    expect(
      findContentTopInsetSelfReferences(
        '--rpg-content-top-inset: calc(var(--rpg-content-top-inset, 0px) + 4rem);',
      ),
    ).toHaveLength(1)
    expect(
      findContentTopInsetSelfReferences(
        'export const x = "[--rpg-content-top-inset:var(--rpg-content-top-inset,0px)]"',
      ),
    ).toHaveLength(1)
  })

  it('allows the list total and reads of the resolved variable', () => {
    expect(
      findContentTopInsetSelfReferences(`
        --rpg-content-top-inset: calc(
          var(--app-sticky-chrome-block-size, 0px) + var(--rpg-page-heading-inset, 0px) +
            var(--rpg-form-docked-scroll-top-chrome-inset, 0px)
        );
        max-height: calc(100dvh - var(--rpg-content-top-inset, 0px));
      `),
    ).toEqual([])
  })

  it('ignores comments that only name the cycle', () => {
    expect(
      findContentTopInsetSelfReferences(`
        /* --rpg-content-top-inset: var(--rpg-content-top-inset, 0px); */
        // --rpg-content-top-inset: var(--rpg-content-top-inset, 0px);
      `),
    ).toEqual([])
  })

  it('finds no self-referencing declarations in source', () => {
    expect(collectContentTopInsetSelfReferences(repoRoot)).toEqual([])
  })
})

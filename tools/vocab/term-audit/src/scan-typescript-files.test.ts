import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { collectTermVariants } from './collect-term-variants'
import { scanTypeScriptFiles } from './scan-typescript-files'
import { resolveContentTypeTarget } from './resolve-term-target'

const fixturesRoot = join(dirname(fileURLToPath(import.meta.url)), '../test/fixtures')

describe('scanTypeScriptFiles', () => {
  it('classifies exact literal forms and canonical usages deterministically', () => {
    const result = scanTypeScriptFiles({
      repositoryRoot: fixturesRoot,
      config: { ignore: [], contextual: [] },
      ignore: [],
      targetKey: 'content-type:species',
      variants: collectTermVariants(resolveContentTypeTarget('species')),
    })

    expect(result.parseFailures).toEqual([])
    expect(result.usages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'Species', context: 'label' }),
        expect.objectContaining({ value: 'species', context: 'placeholder' }),
        expect.objectContaining({ value: 'Species', context: 'heading' }),
        expect.objectContaining({
          value: 'Species determines your ancestry.',
          context: 'sentence',
        }),
        expect.objectContaining({ context: 'canonical_usage' }),
      ]),
    )
    expect(result.usages).toEqual(
      [...result.usages].sort(
        (left, right) =>
          left.path.localeCompare(right.path) ||
          left.line - right.line ||
          left.column - right.column,
      ),
    )
  })
})

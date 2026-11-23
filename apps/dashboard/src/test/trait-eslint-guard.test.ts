import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const dashboardRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('trait ESLint import guards', () => {
  it('blocks resolveTraitFacingParts from trait form-field modules', async () => {
    const eslint = new ESLint({
      cwd: dashboardRoot,
      overrideConfigFile: path.join(dashboardRoot, 'eslint.config.js'),
    })

    const results = await eslint.lintText(
      "import { resolveTraitFacingParts } from '@rpg/contracts'\n",
      {
        filePath: path.join(
          dashboardRoot,
          'src/features/content/species/lib/species-trait-form-fields.ts',
        ),
      },
    )

    expect(
      results[0]?.messages.some(
        (message) => message.ruleId === 'no-restricted-imports' && message.severity === 2,
      ),
    ).toBe(true)
  })

  it('blocks formatLegendaryResistanceStatBlockTitle from monster presentation', async () => {
    const eslint = new ESLint({
      cwd: dashboardRoot,
      overrideConfigFile: path.join(dashboardRoot, 'eslint.config.js'),
    })

    const results = await eslint.lintText(
      "import { formatLegendaryResistanceStatBlockTitle } from '@rpg/contracts'\n",
      {
        filePath: path.join(dashboardRoot, 'src/features/content/monsters/lib/monster-display.ts'),
      },
    )

    expect(
      results[0]?.messages.some(
        (message) => message.ruleId === 'no-restricted-imports' && message.severity === 2,
      ),
    ).toBe(true)
  })

  it('allows resolveTraitFacingParts in trait facing adapters', async () => {
    const eslint = new ESLint({
      cwd: dashboardRoot,
      overrideConfigFile: path.join(dashboardRoot, 'eslint.config.js'),
    })

    const results = await eslint.lintText(
      "import { resolveTraitFacingParts } from '@rpg/contracts'\n",
      {
        filePath: path.join(
          dashboardRoot,
          'src/features/content/facing/domains/trait/resolve-trait-facing.ts',
        ),
      },
    )

    expect(
      results[0]?.messages.some(
        (message) => message.ruleId === 'no-restricted-imports' && message.severity === 2,
      ),
    ).toBe(false)
  })
})

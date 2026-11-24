import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const dashboardRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('facing presentation import guard', () => {
  const ruleId = '@typescript-eslint/no-restricted-imports'
  const eslint = new ESLint({
    cwd: dashboardRoot,
    overrideConfigFile: path.join(dashboardRoot, 'eslint.config.js'),
  })

  it.each([
    ["import { FacingHostPanel } from '@rpg/ui'", true],
    ["import * as UI from '@rpg/ui'; export const Panel = UI.FacingHostPanel", true],
    ["export { FacingHostPanel } from '@rpg/ui'", true],
    ["import { Button } from '@rpg/ui'", false],
  ])('checks a feature consumer after flat config merging: %s', async (source, restricted) => {
    const [result] = await eslint.lintText(source, {
      filePath: path.join(
        dashboardRoot,
        'src/features/content/monsters/components/form/actions/action-detail.tsx',
      ),
    })
    expect(result?.messages.some((message) => message.ruleId === ruleId)).toBe(restricted)
  })

  it.each([
    ['<input />', true],
    ['<select />', true],
    ['<textarea />', true],
    ['<Switch />', false],
  ])('checks registered action slot controls: %s', async (control, restricted) => {
    const [result] = await eslint.lintText(`export const Probe = () => ${control}`, {
      filePath: path.join(
        dashboardRoot,
        'src/features/content/monsters/components/form/actions/shared/turn-limit.slot.tsx',
      ),
    })
    expect(result?.messages.some((message) => message.ruleId === 'no-restricted-syntax')).toBe(
      restricted,
    )
  })

  it('allows the structured facing owner to import the panel', async () => {
    const [result] = await eslint.lintText("import { FacingHostPanel } from '@rpg/ui'", {
      filePath: path.join(
        dashboardRoot,
        'src/features/content/facing/structured-facing-host-panel.tsx',
      ),
    })
    expect(result?.messages.some((message) => message.ruleId === ruleId)).toBe(false)
  })
})

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

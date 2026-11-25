import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const dashboardRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('monster acquisition ESLint import guards', () => {
  it('blocks MONSTER_SECTION_KINDS from acquisition modules', async () => {
    const eslint = new ESLint({
      cwd: dashboardRoot,
      overrideConfigFile: path.join(dashboardRoot, 'eslint.config.js'),
    })

    const results = await eslint.lintText(
      "import { MONSTER_SECTION_KINDS } from '@rpg/contracts'\n",
      {
        filePath: path.join(
          dashboardRoot,
          'src/features/content/monsters/lib/actions/acquisition/fixture.ts',
        ),
      },
    )

    expect(
      results[0]?.messages.some(
        (message) => message.ruleId === 'no-restricted-imports' && message.severity === 2,
      ),
    ).toBe(true)
  })

  it('blocks section-tuples deep imports from acquisition modules', async () => {
    const eslint = new ESLint({
      cwd: dashboardRoot,
      overrideConfigFile: path.join(dashboardRoot, 'eslint.config.js'),
    })

    const results = await eslint.lintText(
      "import { monsterActionSchema } from '@rpg/contracts/src/rpg/content/monster/action/section-tuples'\n",
      {
        filePath: path.join(
          dashboardRoot,
          'src/features/content/monsters/lib/actions/acquisition/fixture.ts',
        ),
      },
    )

    expect(
      results[0]?.messages.some(
        (message) => message.ruleId === 'no-restricted-imports' && message.severity === 2,
      ),
    ).toBe(true)
  })

  it.each([
    ['fixture.ts', 'formatLegendaryResistanceStatBlockTitle', true],
    ['fixture-form-fields.ts', 'resolveTraitFacingParts', true],
    ['fixture-form-fields.ts', 'MONSTER_SECTION_KINDS', true],
    ['fixture.ts', 'monsterSectionAllowsKind', false],
  ])('preserves effective import policy in %s for %s', async (file, name, restricted) => {
    const eslint = new ESLint({
      cwd: dashboardRoot,
      overrideConfigFile: path.join(dashboardRoot, 'eslint.config.js'),
    })

    const [result] = await eslint.lintText(
      `import { ${name} } from '@rpg/contracts'
`,
      {
        filePath: path.join(
          dashboardRoot,
          'src/features/content/monsters/lib/actions/acquisition',
          file,
        ),
      },
    )

    expect(
      result?.messages.some(
        (message) => message.ruleId === 'no-restricted-imports' && message.severity === 2,
      ),
    ).toBe(restricted)
  })
})

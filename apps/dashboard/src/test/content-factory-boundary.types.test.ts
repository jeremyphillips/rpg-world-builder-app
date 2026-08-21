import ts from 'typescript'
import { join } from 'node:path'
import { it, expect } from 'vitest'

import {
  collectContentFactoryBoundaryViolations,
  resolveProtectedTypeNamesForTest,
} from './content-factory-boundary.lib'

it('resolves protected content type names from factory return types', { timeout: 30_000 }, () => {
  const dashboardRoot = join(import.meta.dirname, '../..')
  const configPath = ts.findConfigFile(dashboardRoot, ts.sys.fileExists, 'tsconfig.json')
  const configFile = ts.readConfigFile(configPath!, ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dashboardRoot)
  const program = ts.createProgram(parsed.fileNames, parsed.options)

  expect(resolveProtectedTypeNamesForTest(program).sort()).toEqual(
    [
      'Campaign',
      'CampaignListItem',
      'CampaignNpcDetail',
      'CampaignNpcListItem',
      'CharacterBuildCatalog',
      'CharacterClass',
      'ClassStored',
      'Equipment',
      'Feat',
      'Location',
      'Organization',
      'PcCharacter',
      'SkillProficiency',
      'Species',
      'Spell',
      'Subclass',
    ].sort(),
  )
})

it('does not flag locations/fixtures.ts after makeLocation migration', { timeout: 30_000 }, () => {
  const violations = collectContentFactoryBoundaryViolations()
  expect(
    violations.some((violation) => violation.file === 'features/content/locations/fixtures.ts'),
  ).toBe(false)
})

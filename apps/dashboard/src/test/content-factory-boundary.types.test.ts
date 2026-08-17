import ts from 'typescript'
import { join } from 'node:path'
import { it, expect } from 'vitest'

import {
  collectContentFactoryBoundaryViolations,
  resolveProtectedTypeNamesForTest,
} from './content-factory-boundary.lib'

it('resolves protected content type names from factory return types', () => {
  const dashboardRoot = join(import.meta.dirname, '../..')
  const configPath = ts.findConfigFile(dashboardRoot, ts.sys.fileExists, 'tsconfig.json')
  const configFile = ts.readConfigFile(configPath!, ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dashboardRoot)
  const program = ts.createProgram(parsed.fileNames, parsed.options)

  expect(resolveProtectedTypeNamesForTest(program).sort()).toEqual(
    [
      'CharacterClass',
      'Equipment',
      'Feat',
      'Location',
      'Organization',
      'SkillProficiency',
      'Species',
      'Spell',
    ].sort(),
  )
})

it('flags hand-rolled location fixtures outside factory allowlist', () => {
  const violations = collectContentFactoryBoundaryViolations()
  expect(
    violations.some((violation) => violation.file === 'features/content/locations/fixtures.ts'),
  ).toBe(true)
})

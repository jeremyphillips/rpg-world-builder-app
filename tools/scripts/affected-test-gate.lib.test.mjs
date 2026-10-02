import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  formatAffectedValidationSummary,
  listFailedTasksFromTurboLog,
  listFailedTasksFromTurboOutput,
  resolveAffectedGateExitCode,
} from './affected-test-gate.lib.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

describe('resolveAffectedGateExitCode', () => {
  it('returns zero when turbo succeeds and no failed tasks are recorded', () => {
    expect(resolveAffectedGateExitCode(0, [])).toBe(0)
  })

  it('returns nonzero when failed tasks are recorded', () => {
    expect(resolveAffectedGateExitCode(1, ['@rpg/contracts#test'])).toBe(1)
    expect(resolveAffectedGateExitCode(0, ['@rpg/contracts#test'])).toBe(1)
  })
})

describe('formatAffectedValidationSummary', () => {
  it('lists every failed task', () => {
    expect(formatAffectedValidationSummary(['@rpg/contracts#test', '@rpg/dashboard#test'])).toBe(
      'Affected validation failed:\n- @rpg/contracts#test\n- @rpg/dashboard#test',
    )
  })

  it('reports success when nothing failed', () => {
    expect(formatAffectedValidationSummary([])).toBe('Affected validation passed.')
  })
})

describe('listFailedTasksFromTurboOutput', () => {
  it('parses the Failed line from turbo human output', () => {
    const fixture = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), '__fixtures__/turbo-failure-output.txt'),
      'utf8',
    )
    expect(listFailedTasksFromTurboOutput(fixture)).toEqual([
      '@rpg/contracts#test',
      '@rpg/dashboard#test',
    ])
  })
})

describe('listFailedTasksFromTurboLog', () => {
  it('parses failed tasks from a structured turbo log file', () => {
    const logContents = readFileSync(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        '__fixtures__/turbo-probe-failure.turbo.json',
      ),
      'utf8',
    )
    expect(listFailedTasksFromTurboLog(logContents)).toEqual(['@rpg/contracts#test'])
  })
})

describe('hook contracts', () => {
  it('keeps pre-commit fast and moves broad affected tests to pre-push', () => {
    const preCommit = readFileSync(resolve(repoRoot, '.husky/pre-commit'), 'utf8')
    const prePushScript = readFileSync(resolve(repoRoot, 'package.json'), 'utf8')
    const commitMsg = readFileSync(resolve(repoRoot, '.husky/commit-msg'), 'utf8')

    expect(preCommit).not.toContain('test:affected:local')
    expect(preCommit).not.toContain('typecheck:affected')
    expect(prePushScript).toContain('test:affected:gate')
    expect(prePushScript).toContain('typecheck:affected')
    expect(commitMsg).toContain('commitlint')
  })
})

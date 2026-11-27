import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LOG_RELATIVE,
  checkDispatchModel,
  evaluateModelCheck,
  parseJsonlContent,
  rowsForDispatch,
  runCli,
} from './agent-workflow-model-check.mjs'

const scriptPath = fileURLToPath(new URL('./agent-workflow-model-check.mjs', import.meta.url))
const DISPATCH = 'wf-readiness-20261127T162200Z-d4e5f6'

function row(dispatchId, model) {
  return JSON.stringify({
    timestamp: '2026-11-27T16:22:00.000Z',
    dispatchId,
    subagent_model: model,
  })
}

describe('agent-workflow-model-check helpers', () => {
  it('parses jsonl content and ignores blank lines', () => {
    const rows = parseJsonlContent(`{"dispatchId":"a"}\n\n{"dispatchId":"b"}\n`)
    expect(rows).toEqual([{ dispatchId: 'a' }, { dispatchId: 'b' }])
  })

  it('filters rows by dispatch id', () => {
    const rows = [
      { dispatchId: DISPATCH, subagent_model: 'composer-2.5' },
      { dispatchId: 'other', subagent_model: 'composer-2.5' },
    ]
    expect(rowsForDispatch(rows, DISPATCH)).toHaveLength(1)
    expect(rowsForDispatch(rows, DISPATCH)[0].subagent_model).toBe('composer-2.5')
  })

  it('passes when exactly one row matches an allowed model', () => {
    const result = evaluateModelCheck(
      [{ subagent_model: 'composer-2.5' }],
      new Set(['composer-2.5']),
    )
    expect(result).toEqual({ count: 1, model: 'composer-2.5', ok: true })
  })

  it('fails when count is zero, greater than one, or model is not allowed', () => {
    expect(evaluateModelCheck([], ['composer-2.5'])).toEqual({
      count: 0,
      model: null,
      ok: false,
    })
    expect(
      evaluateModelCheck(
        [{ subagent_model: 'composer-2.5' }, { subagent_model: 'composer-2.5' }],
        ['composer-2.5'],
      ),
    ).toEqual({ count: 2, model: 'composer-2.5', ok: false })
    expect(evaluateModelCheck([{ subagent_model: 'gpt-5.6-sol-low' }], ['composer-2.5'])).toEqual({
      count: 1,
      model: 'gpt-5.6-sol-low',
      ok: false,
    })
  })

  it('accepts premium models when listed in allowed argv models', () => {
    const result = evaluateModelCheck(
      [{ subagent_model: 'claude-sonnet-5-5-low' }],
      ['composer-2.5', 'claude-sonnet-5-5-low'],
    )
    expect(result.ok).toBe(true)
  })

  it('reads matching rows from a log path via checkDispatchModel', () => {
    const logPath = '/tmp/log.jsonl'
    const content = [row('other', 'composer-2.5'), row(DISPATCH, 'composer-2.5')].join('\n')
    const result = checkDispatchModel(DISPATCH, {
      allowedModels: ['composer-2.5'],
      logPath,
      exists: (path) => path === logPath,
      readFile: () => content,
    })
    expect(result).toEqual({ count: 1, model: 'composer-2.5', ok: true })
  })

  it('treats a missing log file as zero matches', () => {
    const result = checkDispatchModel(DISPATCH, {
      allowedModels: ['composer-2.5'],
      logPath: '/missing.jsonl',
      exists: () => false,
    })
    expect(result).toEqual({ count: 0, model: null, ok: false })
  })
})

describe('agent-workflow-model-check CLI', () => {
  it('prints usage and exits 2 without a dispatch id', () => {
    const err = []
    let code
    const result = runCli([], {
      exit: (c) => {
        code = c
      },
      writeOut: () => {},
      writeErr: (text) => err.push(text),
    })
    expect(result).toBeNull()
    expect(code).toBe(2)
    expect(err.join('')).toContain('usage:')
  })

  it('prints json result and exits 0 when the model check passes', () => {
    const out = []
    let code
    const result = runCli([DISPATCH, 'composer-2.5'], {
      cwd: '/repo',
      exists: () => true,
      readFile: () => row(DISPATCH, 'composer-2.5'),
      writeOut: (text) => out.push(text),
      writeErr: () => {},
      exit: (c) => {
        code = c
      },
    })
    expect(result?.ok).toBe(true)
    expect(JSON.parse(out.join(''))).toEqual({
      count: 1,
      model: 'composer-2.5',
      ok: true,
    })
    expect(code).toBe(0)
  })

  it('exits 2 when the model check fails', () => {
    let code
    runCli([DISPATCH, 'composer-2.5'], {
      cwd: '/repo',
      exists: () => true,
      readFile: () => '',
      writeOut: () => {},
      writeErr: () => {},
      exit: (c) => {
        code = c
      },
    })
    expect(code).toBe(2)
  })

  it('runs from the repo root against the default jsonl path', () => {
    const dir = mkdtempSync(resolve(tmpdir(), 'model-check-'))
    try {
      const logDir = resolve(dir, '.tmp/agent-workflow')
      mkdirSync(logDir, { recursive: true })
      writeFileSync(
        resolve(logDir, 'subagent-start.jsonl'),
        `${row(DISPATCH, 'composer-2.5')}\n`,
        'utf8',
      )
      const result = spawnSync(process.execPath, [scriptPath, DISPATCH, 'composer-2.5'], {
        cwd: dir,
        encoding: 'utf8',
      })
      expect(result.error).toBeUndefined()
      expect(result.status).toBe(0)
      expect(JSON.parse(result.stdout.trim())).toEqual({
        count: 1,
        model: 'composer-2.5',
        ok: true,
      })
      expect(DEFAULT_LOG_RELATIVE).toBe('.tmp/agent-workflow/subagent-start.jsonl')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

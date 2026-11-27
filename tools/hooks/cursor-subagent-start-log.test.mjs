import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { parseDispatchId, runHook } from './cursor-subagent-start-log.mjs'

const scriptPath = fileURLToPath(new URL('./cursor-subagent-start-log.mjs', import.meta.url))
const ALLOW = '{"permission":"allow"}\n'
const DISPATCH = 'wf-foundation-20261127T154500Z-ab12cd'

function validInput(task = `Dispatch: ${DISPATCH}\nDo the work.`) {
  return JSON.stringify({
    subagent_id: 'sa-1',
    subagent_type: 'verifier',
    subagent_model: 'composer-2.5',
    tool_call_id: 'tc-1',
    parent_conversation_id: 'conv-1',
    task,
    is_parallel_worker: false,
  })
}

function capture(raw, appendLine = () => {}) {
  const out = []
  const err = []
  expect(() =>
    runHook(raw, {
      writeOut: (text) => out.push(text),
      writeErr: (text) => err.push(text),
      appendLine,
      now: () => '2026-11-27T15:45:00.000Z',
    }),
  ).not.toThrow()
  return { stdout: out.join(''), stderr: err.join('') }
}

describe('cursor-subagent-start-log', () => {
  it('allows valid input and appends exactly one line', () => {
    const lines = []
    const { stdout, stderr } = capture(validInput(), (line) => lines.push(line))
    expect(stdout).toBe(ALLOW)
    expect(stderr).toBe('')
    expect(lines).toHaveLength(1)
    expect(JSON.parse(lines[0])).toEqual({
      timestamp: '2026-11-27T15:45:00.000Z',
      subagent_id: 'sa-1',
      subagent_type: 'verifier',
      subagent_model: 'composer-2.5',
      tool_call_id: 'tc-1',
      parent_conversation_id: 'conv-1',
      dispatchId: DISPATCH,
    })
  })

  it('allows malformed input with diagnostics on stderr only', () => {
    const lines = []
    const { stdout, stderr } = capture('{', (line) => lines.push(line))
    expect(stdout).toBe(ALLOW)
    expect(stderr).toContain('malformed input')
    expect(lines).toHaveLength(0)
  })

  it('allows a missing log directory when append fails', () => {
    const { stdout, stderr } = capture(validInput(), () => {
      const error = new Error(
        "ENOENT: no such file or directory, open '.tmp/agent-workflow/subagent-start.jsonl'",
      )
      error.code = 'ENOENT'
      throw error
    })
    expect(stdout).toBe(ALLOW)
    expect(stderr).toContain('append failed')
    expect(stderr).toContain('ENOENT')
  })

  it('allows an injected filesystem failure and still prints only the permission JSON', () => {
    const { stdout, stderr } = capture(validInput(), () => {
      throw new Error('EIO: simulated filesystem failure')
    })
    expect(stdout).toBe(ALLOW)
    expect(stderr).toContain('simulated filesystem failure')
    expect(stdout.trim()).toBe('{"permission":"allow"}')
  })

  it('records a null dispatch id when the task has none', () => {
    const lines = []
    const { stdout } = capture(validInput('No dispatch in this prompt.'), (line) =>
      lines.push(line),
    )
    expect(stdout).toBe(ALLOW)
    expect(lines).toHaveLength(1)
    expect(JSON.parse(lines[0]).dispatchId).toBeNull()
  })

  it('parses a dispatch id and ignores nearby text', () => {
    expect(parseDispatchId(`before ${DISPATCH} after`)).toBeNull()
    expect(parseDispatchId(`Dispatch: ${DISPATCH}`)).toBe(DISPATCH)
    expect(parseDispatchId('Dispatch: wf-not-a-dispatch')).toBeNull()
    expect(parseDispatchId('wf-not-a-dispatch')).toBeNull()
    expect(parseDispatchId(undefined)).toBeNull()
  })

  it('parses a dispatch id from a multiline task on the second or third line', () => {
    const id = 'wf-readiness-20261127T162000Z-ab12cd'
    expect(parseDispatchId(`Preamble line one.\nDispatch: ${id}\nDo the work.`)).toBe(id)
    expect(
      parseDispatchId(`Preamble line one.\nMore context.\nDispatch: ${id}\nTail instruction.`),
    ).toBe(id)
  })

  it('parses a dispatch id whose six-character suffix is not limited to hex digits', () => {
    const id = 'wf-readiness-20261127T162000Z-g7h8i9'
    expect(parseDispatchId(`Dispatch: ${id}`)).toBe(id)
  })

  it('records dispatch id from a multiline task when logging', () => {
    const id = 'wf-readiness-20261127T162000Z-b2c3d4'
    const lines = []
    const task = `Kind: remediate\nDispatch: ${id}\nDo the work.`
    const { stdout } = capture(validInput(task), (line) => lines.push(line))
    expect(stdout).toBe(ALLOW)
    expect(lines).toHaveLength(1)
    expect(JSON.parse(lines[0]).dispatchId).toBe(id)
  })

  it('does not throw from the CLI and writes exactly the permission JSON', () => {
    const dir = mkdtempSync(resolve(tmpdir(), 'subagent-start-'))
    try {
      const result = spawnSync(process.execPath, [scriptPath], {
        input: validInput(),
        cwd: dir,
        encoding: 'utf8',
      })
      expect(result.error).toBeUndefined()
      expect(result.status).toBe(0)
      expect(result.stdout).toBe(ALLOW)
      const log = readFileSync(resolve(dir, '.tmp/agent-workflow/subagent-start.jsonl'), 'utf8')
      const lines = log.split('\n').filter((line) => line.length > 0)
      expect(lines).toHaveLength(1)
      expect(JSON.parse(lines[0]).dispatchId).toBe(DISPATCH)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

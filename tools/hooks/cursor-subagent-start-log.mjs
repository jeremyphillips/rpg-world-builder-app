import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ALLOW = '{"permission":"allow"}\n'
const LOG_RELATIVE = '.tmp/agent-workflow/subagent-start.jsonl'
const DISPATCH_ID = /wf-[a-z0-9]+(?:-[a-z0-9]+)*-\d{8}T\d{6}Z-[a-z0-9]{6}/
const DISPATCH_LINE = /^Dispatch:\s*(.*)$/

export function parseDispatchId(task) {
  if (typeof task !== 'string') return null
  for (const line of task.split(/\r?\n/)) {
    const dispatchLine = line.match(DISPATCH_LINE)
    if (!dispatchLine) continue
    const match = dispatchLine[1].match(DISPATCH_ID)
    if (match) return match[0]
  }
  return null
}

function isPayloadDispatchId(value) {
  return typeof value === 'string' && parseDispatchId(`Dispatch: ${value}`) === value
}

export function resolveDispatchId(source) {
  const payload = source && typeof source === 'object' ? source : {}
  if (isPayloadDispatchId(payload.dispatch_id)) {
    return payload.dispatch_id
  }
  return parseDispatchId(payload.task)
}

export function buildLogRecord(input, timestamp) {
  const source = input && typeof input === 'object' ? input : {}
  return {
    timestamp,
    subagent_id: source.subagent_id ?? null,
    subagent_type: source.subagent_type ?? null,
    subagent_model: source.subagent_model ?? null,
    tool_call_id: source.tool_call_id ?? null,
    parent_conversation_id: source.parent_conversation_id ?? null,
    dispatchId: resolveDispatchId(source),
  }
}

/**
 * @param {string} raw
 * @param {{
 *   writeOut: (text: string) => void,
 *   writeErr: (text: string) => void,
 *   appendLine: (line: string) => void,
 *   now?: () => string,
 * }} io
 */
export function runHook(raw, io) {
  const writeOut = io.writeOut
  const writeErr = io.writeErr
  try {
    let input
    try {
      input = JSON.parse(raw)
    } catch (error) {
      writeErr(
        `subagentStart log: malformed input: ${error instanceof Error ? error.message : String(error)}\n`,
      )
      writeOut(ALLOW)
      return
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      writeErr('subagentStart log: input is not an object\n')
      writeOut(ALLOW)
      return
    }
    const record = buildLogRecord(input, (io.now ?? (() => new Date().toISOString()))())
    try {
      io.appendLine(`${JSON.stringify(record)}\n`)
    } catch (error) {
      writeErr(
        `subagentStart log: append failed: ${error instanceof Error ? error.message : String(error)}\n`,
      )
    }
  } catch (error) {
    writeErr(`subagentStart log: ${error instanceof Error ? error.message : String(error)}\n`)
  }
  writeOut(ALLOW)
}

function defaultAppendLine(line) {
  const path = resolve(process.cwd(), LOG_RELATIVE)
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, line)
}

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isMain) {
  readStdin()
    .then((raw) => {
      runHook(raw, {
        writeOut: (text) => process.stdout.write(text),
        writeErr: (text) => process.stderr.write(text),
        appendLine: defaultAppendLine,
      })
    })
    .catch((error) => {
      process.stderr.write(
        `subagentStart log: ${error instanceof Error ? error.message : String(error)}\n`,
      )
      process.stdout.write(ALLOW)
    })
}

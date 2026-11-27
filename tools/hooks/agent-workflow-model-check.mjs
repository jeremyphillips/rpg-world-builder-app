import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {string} */
export const DEFAULT_LOG_RELATIVE = '.tmp/agent-workflow/subagent-start.jsonl'

/**
 * @param {string} content
 * @returns {Record<string, unknown>[]}
 */
export function parseJsonlContent(content) {
  if (typeof content !== 'string' || content.length === 0) return []
  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

/**
 * @param {Iterable<Record<string, unknown>>} rows
 * @param {string} dispatchId
 * @returns {Record<string, unknown>[]}
 */
export function rowsForDispatch(rows, dispatchId) {
  if (typeof dispatchId !== 'string' || dispatchId.length === 0) return []
  return [...rows].filter((row) => row && row.dispatchId === dispatchId)
}

/**
 * @param {Record<string, unknown>[]} matchingRows
 * @param {Iterable<string>} allowedModels
 * @returns {{ count: number, model: string | null, ok: boolean }}
 */
export function evaluateModelCheck(matchingRows, allowedModels) {
  const allowed = allowedModels instanceof Set ? allowedModels : new Set(allowedModels)
  const count = matchingRows.length
  const model = matchingRows[0]?.subagent_model ?? null
  const ok = count === 1 && allowed.has(matchingRows[0].subagent_model)
  return { count, model, ok }
}

/**
 * @param {string} dispatchId
 * @param {{
 *   allowedModels: Iterable<string>,
 *   logPath: string,
 *   exists?: (path: string) => boolean,
 *   readFile?: (path: string, encoding: string) => string,
 * }} options
 * @returns {{ count: number, model: string | null, ok: boolean }}
 */
export function checkDispatchModel(dispatchId, options) {
  const exists = options.exists ?? existsSync
  const readFile = options.readFile ?? ((path, encoding) => readFileSync(path, encoding))
  if (!exists(options.logPath)) {
    return evaluateModelCheck([], options.allowedModels)
  }
  const rows = parseJsonlContent(readFile(options.logPath, 'utf8'))
  return evaluateModelCheck(rowsForDispatch(rows, dispatchId), options.allowedModels)
}

/**
 * @param {string[]} argvFromScript
 * @param {{
 *   cwd?: string,
 *   exists?: (path: string) => boolean,
 *   readFile?: (path: string, encoding: string) => string,
 *   writeOut?: (text: string) => void,
 *   writeErr?: (text: string) => void,
 *   exit?: (code: number) => void,
 * }} io
 * @returns {{ count: number, model: string | null, ok: boolean } | null}
 */
export function runCli(argvFromScript, io = {}) {
  const writeOut = io.writeOut ?? ((text) => process.stdout.write(text))
  const writeErr = io.writeErr ?? ((text) => process.stderr.write(text))
  const exit = io.exit ?? ((code) => process.exit(code))
  const cwd = io.cwd ?? process.cwd()

  const dispatchId = argvFromScript[0]
  const allowedModels = argvFromScript.slice(1)

  if (!dispatchId) {
    writeErr(
      `usage: agent-workflow-model-check.mjs <dispatch-id> <allowed-model> [...allowed-models]\n`,
    )
    exit(2)
    return null
  }

  const result = checkDispatchModel(dispatchId, {
    allowedModels,
    logPath: resolve(cwd, DEFAULT_LOG_RELATIVE),
    exists: io.exists,
    readFile: io.readFile,
  })

  writeOut(`${JSON.stringify(result)}\n`)
  exit(result.ok ? 0 : 2)
  return result
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isMain) {
  runCli(process.argv.slice(2))
}

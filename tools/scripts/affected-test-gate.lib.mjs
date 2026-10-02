/**
 * Helpers for affected Turbo test gates (pre-push) and diagnostics (collect).
 */

/**
 * @param {number | null | undefined} turboExitCode
 * @param {readonly string[]} failedTasks
 */
export function resolveAffectedGateExitCode(turboExitCode, failedTasks) {
  if (failedTasks.length > 0) {
    return turboExitCode && turboExitCode !== 0 ? turboExitCode : 1
  }
  return turboExitCode === 0 ? 0 : (turboExitCode ?? 1)
}

/**
 * @param {readonly string[]} failedTasks
 */
export function formatAffectedValidationSummary(failedTasks) {
  if (failedTasks.length === 0) {
    return 'Affected validation passed.'
  }

  const lines = ['Affected validation failed:']
  for (const task of failedTasks) {
    lines.push(`- ${task}`)
  }
  return lines.join('\n')
}

/**
 * Turbo `--log-file` writes a JSON array with comma-separated entries (not strict JSON).
 *
 * @param {string} logContents
 * @returns {Array<{ source?: string, level?: string, text?: string }>}
 */
export function parseTurboStructuredLog(logContents) {
  const trimmed = logContents.trim()
  if (!trimmed) {
    return []
  }

  const normalized = trimmed.replace(/\[\s*\n/, '[').replace(/\n\s*\]$/, ']')
  try {
    const parsed = JSON.parse(normalized)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * @param {string} logContents
 * @returns {string[]}
 */
export function listFailedTasksFromTurboLog(logContents) {
  const failed = new Set()

  for (const event of parseTurboStructuredLog(logContents)) {
    if (event.source !== 'turbo' || !event.text) {
      continue
    }

    if (event.level === 'info' && event.text.startsWith('Failed:')) {
      const taskList = event.text.replace(/^Failed:\s*/, '')
      for (const task of taskList.split(',')) {
        const normalized = task.trim()
        if (normalized) {
          failed.add(normalized)
        }
      }
      continue
    }

    if (event.level === 'error') {
      const match = event.text.match(/^(@[^:\s]+#\S+):/)
      if (match) {
        failed.add(match[1])
      }
    }
  }

  return [...failed].sort()
}

/**
 * Fallback when structured log is missing or incomplete.
 *
 * @param {string} output
 * @returns {string[]}
 */
export function listFailedTasksFromTurboOutput(output) {
  const failed = new Set()
  for (const line of output.split('\n')) {
    const failedLine = line.match(/^Failed:\s+(.+)$/)
    if (failedLine) {
      for (const task of failedLine[1].split(',')) {
        const normalized = task.trim()
        if (normalized) {
          failed.add(normalized)
        }
      }
    }
  }
  return [...failed].sort()
}

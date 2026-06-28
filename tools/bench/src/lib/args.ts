import { parseArgs } from 'node:util'

import type { TicketCreatedBy } from '@rpg/contracts/dev-bench'

export type OutputFormat = 'json' | 'text'

export interface GlobalFlags {
  format: OutputFormat
  help: boolean
}

const GLOBAL_OPTIONS = {
  format: { type: 'string' as const },
  help: { type: 'boolean' as const, short: 'h' as const },
}

export function parseGlobalArgs(argv: string[]): { flags: GlobalFlags; positionals: string[] } {
  const { values, positionals } = parseArgs({
    args: argv,
    options: GLOBAL_OPTIONS,
    allowPositionals: true,
    strict: false,
  })

  const format = values.format === 'text' ? 'text' : 'json'

  return {
    flags: {
      format,
      help: values.help === true,
    },
    positionals,
  }
}

export function requireJsonFlag(values: Record<string, unknown>, command: string): string {
  const json = values.json
  if (typeof json !== 'string' || json.length === 0) {
    throw new Error(`Missing required --json for ${command}`)
  }
  return json
}

export function parseCreatedByFlag(values: Record<string, unknown>): TicketCreatedBy | undefined {
  const createdBy = values['created-by']
  if (createdBy === 'user' || createdBy === 'agent') {
    return createdBy
  }
  return undefined
}

export function parseJsonObject(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new Error('Invalid JSON in --json')
  }
}

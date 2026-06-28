import type { TicketCreatedBy } from '@rpg/contracts/dev-bench'

export type OutputFormat = 'json' | 'text'

export interface GlobalFlags {
  format: OutputFormat
  help: boolean
}

/** Parse only global flags; leave command flags (--json, filters, etc.) intact. */
export function parseGlobalArgs(argv: string[]): { flags: GlobalFlags; positionals: string[] } {
  const positionals: string[] = []
  let format: OutputFormat = 'json'
  let help = false

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === undefined) {
      continue
    }

    if (arg === '--format') {
      const next = argv[index + 1]
      if (next !== undefined) {
        format = next === 'text' ? 'text' : 'json'
        index += 1
      }
      continue
    }

    if (arg === '--help' || arg === '-h') {
      help = true
      continue
    }

    positionals.push(arg)
  }

  return {
    flags: { format, help },
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

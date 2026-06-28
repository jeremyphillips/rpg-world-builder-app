import { parseGlobalArgs } from './lib/args'
import { writeFailure } from './lib/output'
import { runAddTicket } from './commands/add-ticket'
import { runCreateEpic } from './commands/create-epic'
import { runGetTicket } from './commands/get-ticket'
import { runListEpics } from './commands/list-epics'
import { runListTickets } from './commands/list-tickets'
import { runSeedEpics } from './commands/seed-epics'
import { runUpdateTicket } from './commands/update-ticket'

const HELP = `Dev Bench CLI — agent-friendly ticket and epic commands.

Usage:
  pnpm bench <command> [options]

Commands:
  add-ticket      Create a ticket (--json required)
  get-ticket      Read a ticket by BENCH-### or Mongo id
  list-tickets    List tickets with optional filters
  update-ticket   Update a ticket (--json required)
  create-epic     Create an epic (--json required)
  list-epics      List epics with optional filters
  seed-epics      Idempotently create starter epics

Global flags:
  --format json|text   Output format (default: json)
  -h, --help           Show this help

Environment:
  BENCH_API_URL        API base URL (default: http://localhost:5001)

Ensure apps/api is running before using the CLI.
`

type CommandRunner = (
  argv: string[],
  flags: ReturnType<typeof parseGlobalArgs>['flags'],
) => Promise<void>

const COMMANDS: Record<string, CommandRunner> = {
  'add-ticket': runAddTicket,
  'get-ticket': runGetTicket,
  'list-tickets': runListTickets,
  'update-ticket': runUpdateTicket,
  'create-epic': runCreateEpic,
  'list-epics': runListEpics,
  'seed-epics': runSeedEpics,
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2)
  const { flags, positionals } = parseGlobalArgs(rawArgs)

  if (flags.help || positionals.length === 0 || positionals[0] === 'help') {
    process.stdout.write(HELP)
    return
  }

  const command = positionals[0]!
  const commandArgs = positionals.slice(1)
  const runner = COMMANDS[command]

  if (!runner) {
    writeFailure(flags.format, new Error(`Unknown command: ${command}`))
  }

  try {
    await runner(commandArgs, flags)
  } catch (error) {
    writeFailure(flags.format, error)
  }
}

void main()

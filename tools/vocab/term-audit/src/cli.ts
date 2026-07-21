import { pathToFileURL } from 'node:url'

import { auditTermUsage, repositoryRootFromPackage } from './audit-term-usage'
import { formatTermAuditReport } from './format-term-audit-report'
import {
  resolveContentTypeTarget,
  resolveTermTarget,
  resolveVocabularySetTarget,
  TermAuditTargetError,
} from './resolve-term-target'
import { VOCAB_TERM_AUDIT_CONFIG } from '../term-audit.config'

export const TERM_AUDIT_EXIT_CODE = {
  success: 0,
  invalidTarget: 2,
  configurationOrParseFailure: 3,
  baselineExceeded: 4,
} as const

type CliOptions = {
  term?: string
  contentType?: string
  vocabularySet?: string
  includeCompact: boolean
  format: 'human' | 'json'
  ignore: string[]
  help: boolean
}

const VALUE_OPTION_KEYS = {
  '--term': 'term',
  '--content-type': 'contentType',
  '--vocab-set': 'vocabularySet',
} as const satisfies Record<
  string,
  keyof Pick<CliOptions, 'term' | 'contentType' | 'vocabularySet'>
>

function requireValue(argument: string, value: string | undefined): string {
  if (!value) throw new Error(`${argument} requires a value`)
  return value
}

function setFormat(options: CliOptions, value: string | undefined): void {
  const format = requireValue('--format', value)
  if (format !== 'human' && format !== 'json') throw new Error(`Invalid format: ${format}`)
  options.format = format
}

function hasExactlyOneTarget(options: CliOptions): boolean {
  return [options.term, options.contentType, options.vocabularySet].filter(Boolean).length === 1
}

function usage(): string {
  return `Usage: pnpm vocab:audit (--term <id> | --content-type <id> | --vocab-set <id>) [options]

Options:
  --format <human|json>   Output format (default: human)
  --include-compact       Include a term compactLabel in the exact-match scan
  --ignore <glob>         Exclude matching files (repeatable)
  --help                  Show this help
`
}

export function parseCliArgs(argv: readonly string[]): CliOptions {
  const options: CliOptions = {
    includeCompact: false,
    format: 'human',
    ignore: [],
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const value = argv[index + 1]

    const targetKey = VALUE_OPTION_KEYS[argument as keyof typeof VALUE_OPTION_KEYS]
    if (targetKey) {
      options[targetKey] = requireValue(argument ?? 'target option', value)
      index += 1
      continue
    }
    if (argument === '--format') {
      setFormat(options, value)
      index += 1
      continue
    }
    if (argument === '--ignore') {
      options.ignore.push(requireValue(argument, value))
      index += 1
      continue
    }
    if (argument === '--include-compact') {
      options.includeCompact = true
      continue
    }
    if (argument === '--help' || argument === '-h') {
      options.help = true
      continue
    }
    throw new Error(`Unknown argument: ${argument}`)
  }

  if (!options.help && !hasExactlyOneTarget(options)) {
    throw new Error('Provide exactly one target: --term, --content-type, or --vocab-set.')
  }
  return options
}

function resolveCliTarget(options: CliOptions) {
  if (options.term) return resolveTermTarget(options.term)
  if (options.contentType) return resolveContentTypeTarget(options.contentType)
  if (options.vocabularySet) return resolveVocabularySetTarget(options.vocabularySet)
  throw new Error('No audit target supplied.')
}

export function runCli(argv: readonly string[]): number {
  let options: CliOptions
  try {
    options = parseCliArgs(argv)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    console.error(usage())
    return TERM_AUDIT_EXIT_CODE.invalidTarget
  }

  if (options.help) {
    console.log(usage())
    return TERM_AUDIT_EXIT_CODE.success
  }

  try {
    const report = auditTermUsage({
      repositoryRoot: repositoryRootFromPackage(import.meta.url),
      target: resolveCliTarget(options),
      includeCompact: options.includeCompact,
      ignore: options.ignore,
      config: VOCAB_TERM_AUDIT_CONFIG,
    })
    if (report.parseFailures.length > 0) {
      console.error(formatTermAuditReport(report))
      return TERM_AUDIT_EXIT_CODE.configurationOrParseFailure
    }
    console.log(
      options.format === 'json' ? JSON.stringify(report, null, 2) : formatTermAuditReport(report),
    )
    return TERM_AUDIT_EXIT_CODE.success
  } catch (error) {
    if (error instanceof TermAuditTargetError) {
      console.error(error.message)
      return TERM_AUDIT_EXIT_CODE.invalidTarget
    }
    console.error(error instanceof Error ? error.stack : String(error))
    return TERM_AUDIT_EXIT_CODE.configurationOrParseFailure
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = runCli(process.argv.slice(2))
}

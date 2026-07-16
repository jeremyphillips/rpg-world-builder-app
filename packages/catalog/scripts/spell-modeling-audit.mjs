/**
 * Spell modeling audit CLI — summary, filters, and promotion backlog from seed metadata.
 *
 * Run from repo root:
 *   pnpm catalog:spell-modeling-audit
 *   pnpm catalog:spell-modeling-audit --status non-meaningful-partial
 *   pnpm catalog:spell-modeling-audit --gap dynamic-target-count
 */
import { MODELING_STATUS_LADDER } from '@rpg/contracts'

import {
  buildSpellModelingAudit,
  spellModelingAuditViolations,
} from '../src/spells/spell-modeling-audit.ts'

const DEFAULT_RULESET = 'srd-cc-5.2.1'

function printHelp() {
  console.log(`Usage: pnpm catalog:spell-modeling-audit [options]

Options:
  --ruleset <id>           Ruleset seed catalog (default: ${DEFAULT_RULESET})
  --status <status>        List spells with this effective modeling status
  --gap <code>             List spells declaring this modeling gap code
  --unreviewed             List spells without reviewed modeling metadata
  --undocumented-gaps      List prose-only spells without modeling.gaps
  --editor-eligible        List spells eligible for the resolution editor
  --display-ready          List spells at sufficient-for-display or higher
  --json                   Emit filtered results as JSON
  --fail-on-violations     Exit 1 when consistency violations exist (default)
  --help                   Show this help

Effective statuses: ${MODELING_STATUS_LADDER.join(', ')}

Examples:
  pnpm catalog:spell-modeling-audit
  pnpm catalog:spell-modeling-audit --status meaningful-partial
  pnpm catalog:spell-modeling-audit --status non-meaningful-partial
  pnpm catalog:spell-modeling-audit --gap flammability-rules
`)
}

function parseArgs(argv) {
  const options = {
    rulesetId: DEFAULT_RULESET,
    status: undefined,
    gap: undefined,
    unreviewed: false,
    undocumentedGaps: false,
    editorEligible: false,
    displayReady: false,
    json: false,
    failOnViolations: true,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true
        break
      case '--ruleset':
        options.rulesetId = argv[++index]
        break
      case '--status':
        options.status = argv[++index]
        break
      case '--gap':
        options.gap = argv[++index]
        break
      case '--unreviewed':
        options.unreviewed = true
        break
      case '--undocumented-gaps':
        options.undocumentedGaps = true
        break
      case '--editor-eligible':
        options.editorEligible = true
        break
      case '--display-ready':
        options.displayReady = true
        break
      case '--json':
        options.json = true
        break
      case '--no-fail-on-violations':
        options.failOnViolations = false
        break
      default:
        console.error(`Unknown argument: ${arg}`)
        printHelp()
        process.exit(1)
    }
  }

  return options
}

function gapFrequency(entries) {
  const counts = new Map()

  for (const entry of entries) {
    for (const gap of entry.gaps) {
      counts.set(gap.code, (counts.get(gap.code) ?? 0) + 1)
    }
  }

  return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right))
}

function filterEntries(audit, options) {
  let entries = audit.entries

  if (options.status) {
    if (!MODELING_STATUS_LADDER.includes(options.status)) {
      console.error(
        `Invalid status: ${options.status}. Expected one of: ${MODELING_STATUS_LADDER.join(', ')}`,
      )
      process.exit(1)
    }
    entries = entries.filter((entry) => entry.effectiveStatus === options.status)
  }

  if (options.gap) {
    entries = entries.filter((entry) => entry.gaps.some((gap) => gap.code === options.gap))
  }

  if (options.unreviewed) {
    entries = entries.filter((entry) => !entry.reviewed)
  }

  if (options.undocumentedGaps) {
    entries = entries.filter(
      (entry) => entry.effectiveStatus === 'prose-only' && entry.gaps.length === 0,
    )
  }

  if (options.editorEligible) {
    entries = entries.filter((entry) => entry.editorEligible)
  }

  if (options.displayReady) {
    entries = entries.filter((entry) => entry.displayReady)
  }

  return entries
}

function hasFilters(options) {
  return (
    options.status !== undefined ||
    options.gap !== undefined ||
    options.unreviewed ||
    options.undocumentedGaps ||
    options.editorEligible ||
    options.displayReady
  )
}

function printSummary(audit) {
  console.log(`Spell modeling audit — ${audit.rulesetId}`)
  console.log(`Total spells: ${audit.totalSpells}`)
  console.log(`Unreviewed: ${audit.unreviewed.length}`)
  console.log(`Prose-only without documented gaps: ${audit.proseOnlyWithoutDocumentedGaps.length}`)
  console.log(`Violations: ${audit.violationCount}`)
  console.log('')
  console.log('Status summary:')

  for (const status of MODELING_STATUS_LADDER) {
    const count = audit.byEffectiveStatus[status]?.length ?? 0
    console.log(`  ${status}: ${count}`)
  }

  const gaps = gapFrequency(audit.entries)
  if (gaps.length > 0) {
    console.log('')
    console.log('Gap frequency:')
    for (const [code, count] of gaps) {
      console.log(`  ${code}: ${count}`)
    }
  }

  if (audit.violationCount > 0) {
    console.log('')
    console.log('Violations:')
    for (const violation of spellModelingAuditViolations(audit)) {
      console.log(`  ${violation.slug} — ${violation.code}: ${violation.message}`)
    }
  }
}

function printFiltered(entries, options) {
  if (options.json) {
    console.log(
      JSON.stringify(
        entries.map((entry) => ({
          slug: entry.slug,
          effectiveStatus: entry.effectiveStatus,
          explicitStatus: entry.explicitStatus ?? null,
          reviewed: entry.reviewed,
          gaps: entry.gaps,
          hasResolution: entry.hasResolution,
          editorEligible: entry.editorEligible,
          displayReady: entry.displayReady,
        })),
        null,
        2,
      ),
    )
    return
  }

  if (entries.length === 0) {
    console.log('No spells matched the filter.')
    return
  }

  for (const entry of entries) {
    const gapCodes = entry.gaps.map((gap) => gap.code).join(', ') || '—'
    console.log(
      `${entry.slug}\t${entry.effectiveStatus}\t${entry.explicitStatus ?? '—'}\t${gapCodes}`,
    )
  }
}

const options = parseArgs(process.argv.slice(2))

if (options.help) {
  printHelp()
  process.exit(0)
}

const audit = buildSpellModelingAudit(options.rulesetId)

if (hasFilters(options)) {
  const entries = filterEntries(audit, options)
  if (!options.json && entries.length > 0) {
    console.log('slug\teffectiveStatus\texplicitStatus\tgaps')
  }
  printFiltered(entries, options)
} else {
  printSummary(audit)
}

if (options.failOnViolations && audit.violationCount > 0) {
  process.exit(1)
}

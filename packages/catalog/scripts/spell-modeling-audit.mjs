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
  blockerFrequency,
  buildSpellModelingAudit,
  capabilityUnlockCounts,
  isBlockedFromDisplayPromotion,
  isBlockedFromEditorPromotion,
  residualGapFrequency,
  spellModelingAuditViolations,
} from '../src/spells/spell-modeling-audit.ts'

const DEFAULT_RULESET = 'srd-cc-5.2.1'

function printHelp() {
  console.log(`Usage: pnpm catalog:spell-modeling-audit [options]

Options:
  --ruleset <id>           Ruleset seed catalog (default: ${DEFAULT_RULESET})
  --status <status>        List spells with this effective modeling status
  --gap <code>             List spells with this code in blocker or residual gaps
  --blocker <code>         List spells with this blocker code
  --residual-gap <code>    List spells with this residual gap code
  --capability <id>        List spells whose blocker references this capability id
  --blocked-from <status>  List spells blocked from promotion to this status
  --unreviewed             List spells without reviewed modeling metadata
  --undocumented-blocker   List prose-only spells without modeling.blocker
  --undocumented-gaps      Alias for --undocumented-blocker
  --editor-eligible        List spells eligible for the resolution editor
  --display-ready          List spells at sufficient-for-display or higher
  --json                   Emit filtered results as JSON
  --fail-on-violations     Exit 1 when consistency violations exist (default)
  --help                   Show this help

Effective statuses: ${MODELING_STATUS_LADDER.join(', ')}

Examples:
  pnpm catalog:spell-modeling-audit
  pnpm catalog:spell-modeling-audit --status meaningful-partial
  pnpm catalog:spell-modeling-audit --blocked-from meaningful-partial
  pnpm catalog:spell-modeling-audit --capability stat-modifier
  pnpm catalog:spell-modeling-audit --residual-gap flammability-rules
`)
}

function parseArgs(argv) {
  const options = {
    rulesetId: DEFAULT_RULESET,
    status: undefined,
    gap: undefined,
    blocker: undefined,
    residualGap: undefined,
    capability: undefined,
    blockedFrom: undefined,
    unreviewed: false,
    undocumentedBlocker: false,
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
      case '--blocker':
        options.blocker = argv[++index]
        break
      case '--residual-gap':
        options.residualGap = argv[++index]
        break
      case '--capability':
        options.capability = argv[++index]
        break
      case '--blocked-from':
        options.blockedFrom = argv[++index]
        break
      case '--unreviewed':
        options.unreviewed = true
        break
      case '--undocumented-blocker':
      case '--undocumented-gaps':
        options.undocumentedBlocker = true
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

function printFrequencyMap(title, counts) {
  const entries = [...counts.entries()].sort(([left], [right]) => left.localeCompare(right))
  if (entries.length === 0) return
  console.log('')
  console.log(`${title}:`)
  for (const [code, count] of entries) {
    console.log(`  ${code}: ${count}`)
  }
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
    entries = entries.filter(
      (entry) =>
        entry.blocker?.code === options.gap || entry.gaps.some((gap) => gap.code === options.gap),
    )
  }

  if (options.blocker) {
    entries = entries.filter((entry) => entry.blocker?.code === options.blocker)
  }

  if (options.residualGap) {
    entries = entries.filter((entry) => entry.gaps.some((gap) => gap.code === options.residualGap))
  }

  if (options.capability) {
    entries = entries.filter((entry) => entry.blocker?.capabilityId === options.capability)
  }

  if (options.blockedFrom) {
    if (!MODELING_STATUS_LADDER.includes(options.blockedFrom)) {
      console.error(
        `Invalid blocked-from status: ${options.blockedFrom}. Expected one of: ${MODELING_STATUS_LADDER.join(', ')}`,
      )
      process.exit(1)
    }
    entries = entries.filter((entry) => entry.blockedFrom === options.blockedFrom)
  }

  if (options.unreviewed) {
    entries = entries.filter((entry) => !entry.reviewed)
  }

  if (options.undocumentedBlocker) {
    entries = entries.filter(
      (entry) => entry.effectiveStatus === 'prose-only' && entry.blocker === undefined,
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
    options.blocker !== undefined ||
    options.residualGap !== undefined ||
    options.capability !== undefined ||
    options.blockedFrom !== undefined ||
    options.unreviewed ||
    options.undocumentedBlocker ||
    options.editorEligible ||
    options.displayReady
  )
}

function printSummary(audit) {
  console.log(`Spell modeling audit — ${audit.rulesetId}`)
  console.log(`Total spells: ${audit.totalSpells}`)
  console.log(`Unreviewed: ${audit.unreviewed.length}`)
  console.log(
    `Prose-only without documented blocker: ${audit.proseOnlyWithoutDocumentedBlocker.length}`,
  )
  console.log(`Violations: ${audit.violationCount}`)
  console.log('')
  console.log('Status summary:')

  for (const status of MODELING_STATUS_LADDER) {
    const count = audit.byEffectiveStatus[status]?.length ?? 0
    console.log(`  ${status}: ${count}`)
  }

  printFrequencyMap('Blocker frequency', blockerFrequency(audit.entries))
  printFrequencyMap('Residual gap frequency', residualGapFrequency(audit.entries))
  printFrequencyMap('Capability unlock counts', capabilityUnlockCounts(audit.entries))

  const editorBlocked = audit.entries.filter(isBlockedFromEditorPromotion).length
  const displayBlocked = audit.entries.filter(isBlockedFromDisplayPromotion).length
  if (editorBlocked > 0 || displayBlocked > 0) {
    console.log('')
    console.log('Promotion backlog:')
    console.log(`  blocked from meaningful-partial: ${editorBlocked}`)
    console.log(`  blocked from sufficient-for-display: ${displayBlocked}`)
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
          blockedFrom: entry.blockedFrom ?? null,
          blocker: entry.blocker ?? null,
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
    const blockerCode = entry.blocker?.code ?? '—'
    const capabilityId = entry.blocker?.capabilityId ?? '—'
    const gapCodes = entry.gaps.map((gap) => gap.code).join(', ') || '—'
    console.log(
      `${entry.slug}\t${entry.effectiveStatus}\t${entry.blockedFrom ?? '—'}\t${blockerCode}\t${capabilityId}\t${gapCodes}`,
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
    console.log('slug\teffectiveStatus\tblockedFrom\tblocker\tcapability\tresidualGaps')
  }
  printFiltered(entries, options)
} else {
  printSummary(audit)
}

if (options.failOnViolations && audit.violationCount > 0) {
  process.exit(1)
}

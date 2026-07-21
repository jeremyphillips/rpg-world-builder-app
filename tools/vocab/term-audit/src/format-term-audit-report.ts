import type { TermAuditReport, TermUsage, TermUsageDisposition } from './types'

const DISPOSITION_HEADINGS: Record<TermUsageDisposition, string> = {
  replaceable: 'Likely replaceable',
  contextual: 'Contextual prose',
  ignored: 'Ignored',
  unknown: 'Unknown',
}

function formatUsage(usage: TermUsage): string {
  const lines = [
    `${usage.path}:${usage.line}:${usage.column}`,
    `  context: ${usage.context}`,
    `  value: ${JSON.stringify(usage.value)}`,
  ]
  if (usage.suggestion) lines.push(`  suggestion: ${usage.suggestion}`)
  return lines.join('\n')
}

export function formatTermAuditReport(report: TermAuditReport): string {
  const lines = [
    `Term audit: ${report.target.id}`,
    `Canonical source: ${report.target.kind === 'content_type' ? 'CONTENT_TYPE_TERMS' : 'VOCABULARY_OPTION_SET_TERMS'}.${report.target.id}`,
    '',
    'Search forms',
    ...report.variants.map((variant) => `- ${variant.form}: ${variant.value}`),
    '',
    'Summary',
    `- Canonical usages: ${report.summary.canonical}`,
    `- Direct literals: ${report.usages.length - report.summary.canonical}`,
    `- Likely replaceable: ${report.summary.replaceable}`,
    `- Contextual: ${report.summary.contextual}`,
    `- Ignored: ${report.summary.ignored}`,
    `- Unknown: ${report.summary.unknown}`,
  ]

  for (const disposition of ['replaceable', 'contextual', 'ignored', 'unknown'] as const) {
    const usages = report.usages.filter(
      (usage) => usage.context !== 'canonical_usage' && usage.disposition === disposition,
    )
    if (usages.length === 0) continue
    lines.push('', DISPOSITION_HEADINGS[disposition], ...usages.map(formatUsage))
  }

  if (report.parseFailures.length > 0) {
    lines.push(
      '',
      'Parse failures',
      ...report.parseFailures.map((entry) => `- ${entry.path}: ${entry.reason}`),
    )
  }
  if (report.skippedFiles.length > 0) {
    lines.push(
      '',
      'Skipped files',
      ...report.skippedFiles.map((entry) => `- ${entry.path}: ${entry.reason}`),
    )
  }

  return `${lines.join('\n')}\n`
}

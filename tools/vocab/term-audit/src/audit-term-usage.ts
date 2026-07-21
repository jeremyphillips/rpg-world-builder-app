import { join } from 'node:path'

import { collectTermVariants } from './collect-term-variants'
import { DEFAULT_TERM_AUDIT_CONFIG } from './config'
import { scanTypeScriptFiles } from './scan-typescript-files'
import type { TermAuditConfig, TermAuditReport, TermAuditTarget } from './types'

export function auditTermUsage(options: {
  repositoryRoot: string
  target: TermAuditTarget
  includeCompact?: boolean
  ignore?: readonly string[]
  config?: TermAuditConfig
}): TermAuditReport {
  const suppliedConfig = options.config ?? DEFAULT_TERM_AUDIT_CONFIG
  const config: TermAuditConfig = {
    ignore: [...DEFAULT_TERM_AUDIT_CONFIG.ignore, ...suppliedConfig.ignore],
    contextual: suppliedConfig.contextual,
  }
  const variants = collectTermVariants(options.target, { includeCompact: options.includeCompact })
  const targetKey = `${options.target.kind === 'content_type' ? 'content-type' : 'vocab-set'}:${options.target.id}`
  const scanResult = scanTypeScriptFiles({
    repositoryRoot: options.repositoryRoot,
    variants,
    targetKey,
    config,
    ignore: [...config.ignore, ...(options.ignore ?? [])],
  })

  const summary = {
    canonical: 0,
    replaceable: 0,
    contextual: 0,
    ignored: 0,
    unknown: 0,
  }

  for (const usage of scanResult.usages) {
    if (usage.context === 'canonical_usage') {
      summary.canonical += 1
      continue
    }
    summary[usage.disposition] += 1
  }

  return {
    schemaVersion: 1,
    target: options.target,
    variants,
    usages: scanResult.usages,
    skippedFiles: scanResult.skippedFiles,
    parseFailures: scanResult.parseFailures,
    summary,
  }
}

/** Resolve the repository from the package directory, not the caller's CWD. */
export function repositoryRootFromPackage(importMetaUrl: string): string {
  return join(new URL('../../../../', importMetaUrl).pathname)
}

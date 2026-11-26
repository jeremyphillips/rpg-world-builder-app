/**
 * Evaluate Fallow `health --format json` complexity findings for repo gates.
 * Enforced numeric thresholds live in `.fallowrc.json` only; this module
 * applies gate policy (which metrics fail pre-commit vs coverage-backed runs).
 *
 * Fallow 2.89: `exceeded` on each finding is one of cyclomatic | cognitive |
 * both | crap (and combined findings include non-crap metrics in `exceeded`
 * when cyclomatic or cognitive tripped). CRAP uses >= maxCrap; refer to Fallow
 * for boundary behavior on cyclomatic/cognitive.
 */

/** @typedef {'pre-commit' | 'coverage'} FallowHealthGateMode */

/**
 * @param {string | undefined} exceeded
 * @returns {boolean}
 */
export function exceededIncludesStaticComplexity(exceeded) {
  if (!exceeded) return false
  if (exceeded === 'crap') return false
  return exceeded === 'cyclomatic' || exceeded === 'cognitive' || exceeded === 'both'
}

/**
 * @param {unknown} finding
 * @param {FallowHealthGateMode} mode
 * @returns {boolean}
 */
export function findingFailsGate(finding, mode) {
  if (!finding || typeof finding !== 'object') return false
  const exceeded = /** @type {{ exceeded?: string }} */ (finding).exceeded
  if (mode === 'coverage') return Boolean(exceeded)
  return exceededIncludesStaticComplexity(exceeded)
}

/**
 * @param {unknown[]} findings
 * @param {FallowHealthGateMode} mode
 * @returns {unknown[]}
 */
export function selectGateFailures(findings, mode) {
  if (!Array.isArray(findings)) return []
  return findings.filter((finding) => findingFailsGate(finding, mode))
}

/**
 * @param {unknown[]} gateFailures
 * @returns {string}
 */
export function formatGateFailureSummary(gateFailures) {
  if (gateFailures.length === 0) {
    return '✓ No functions exceed complexity thresholds for this gate'
  }
  const lines = gateFailures.map((raw) => {
    const f = /** @type {{ path?: string; name?: string; line?: number; exceeded?: string; cyclomatic?: number; cognitive?: number; crap?: number }} */ (
      raw
    )
    const loc = f.path && f.line ? `${f.path}:${f.line}` : (f.path ?? 'unknown')
    const metrics = [
      f.cyclomatic != null ? `${f.cyclomatic} cyclomatic` : null,
      f.cognitive != null ? `${f.cognitive} cognitive` : null,
      f.crap != null ? `${f.crap} CRAP` : null,
    ]
      .filter(Boolean)
      .join(', ')
    return `  ${loc} ${f.name ?? ''} (${f.exceeded ?? 'unknown'}; ${metrics})`
  })
  return ['✗ Functions exceed complexity thresholds for this gate:', ...lines].join('\n')
}

/**
 * @param {unknown} payload
 * @param {FallowHealthGateMode} mode
 * @returns {{ ok: boolean; gateFailures: unknown[]; summaryLine: string }}
 */
export function evaluateFallowHealthGate(payload, mode) {
  const findings =
    payload && typeof payload === 'object' && Array.isArray(/** @type {{ findings?: unknown[] }} */ (payload).findings)
      ? /** @type {{ findings: unknown[] }} */ (payload).findings
      : []
  const gateFailures = selectGateFailures(findings, mode)
  return {
    ok: gateFailures.length === 0,
    gateFailures,
    summaryLine: formatGateFailureSummary(gateFailures),
  }
}
import { readFileSync } from 'node:fs'

const COLOR_UTILITIES = new Set([
  'text-foreground',
  'text-muted-foreground',
  'text-primary',
  'text-destructive',
  'text-success',
  'text-warning',
  'text-info',
  'text-card-foreground',
  'text-foreground-subtle',
])

const TEXT_STYLE_UTILITY_RE = /\btext-style-[a-z0-9-]+\b/

function tokenizeClassString(value: string): string[] {
  return value.split(/\s+/).filter(Boolean)
}

function hasColorUtility(tokens: string[]): boolean {
  return tokens.some((t) => COLOR_UTILITIES.has(t) || t.startsWith('text-semantic-'))
}

function withoutEmphasisWeight(set: Set<string>): boolean {
  return !set.has('font-medium') && !set.has('font-semibold')
}

function supportingStackViolation(set: Set<string>): string | null {
  if (!withoutEmphasisWeight(set)) return null
  if (set.has('text-sm') && set.has('text-muted-foreground')) {
    return 'text-sm + text-muted-foreground (use text-style-supporting)'
  }
  return null
}

function captionStackViolation(set: Set<string>): string | null {
  if (!withoutEmphasisWeight(set)) return null
  const hasXs = set.has('text-xs') && !set.has('text-xs-meta')
  if (hasXs && set.has('text-muted-foreground')) {
    return 'text-xs + text-muted-foreground (use text-style-caption)'
  }
  return null
}

function labelStackViolation(set: Set<string>, tokens: string[]): string | null {
  if (!set.has('text-sm') || set.has('font-semibold')) return null
  if (!set.has('font-medium') || hasColorUtility(tokens)) return null
  return 'text-sm + font-medium without color (use text-style-label)'
}

function retiredSmallUtility(classString: string): string | null {
  if (/\btext-style-small\b/.test(classString)) {
    return 'text-style-small retired (use text-style-supporting)'
  }
  return null
}

export function classStringViolatesMigratedStacks(classString: string): string | null {
  const retired = retiredSmallUtility(classString)
  if (retired) return retired
  const tokens = tokenizeClassString(classString)
  const set = new Set(tokens)
  return (
    supportingStackViolation(set) ?? captionStackViolation(set) ?? labelStackViolation(set, tokens)
  )
}

const TEXT_TAG_RE = /<Text\b[\s\S]*?>/g

function parseTextTagFlags(flat: string) {
  return {
    variant: flat.match(/variant="([^"]+)"/)?.[1] ?? 'body',
    hasMed: /\bfont-medium\b/.test(flat),
    hasSemi: /\bfont-semibold\b/.test(flat),
    hasSm: /\btext-sm\b/.test(flat),
    hasXs: /\btext-xs\b/.test(flat) && !/\btext-xs-meta\b/.test(flat),
    hasMutedFg: /\btext-muted-foreground\b/.test(flat),
  }
}

function mutedVariantSizeViolation(flags: ReturnType<typeof parseTextTagFlags>): string | null {
  const { variant, hasMed, hasSemi, hasSm, hasXs } = flags
  if (variant !== 'muted') return null
  if (hasSm && !hasMed && !hasSemi) {
    return 'Text variant="muted" + text-sm (use variant="supporting")'
  }
  if (hasXs && !hasMed) {
    return 'Text variant="muted" + text-xs (use variant="caption")'
  }
  return null
}

function redundantMutedOnRoleVariant(flags: ReturnType<typeof parseTextTagFlags>): string | null {
  const { variant, hasMutedFg } = flags
  if (variant === 'caption' && hasMutedFg) {
    return 'Text variant="caption" + text-muted-foreground (redundant)'
  }
  return null
}

function retiredSmallVariant(flags: ReturnType<typeof parseTextTagFlags>): string | null {
  if (flags.variant === 'small') {
    return 'Text variant="small" retired (use variant="supporting")'
  }
  return null
}

export function textTagViolatesMigratedStacks(tag: string): string | null {
  const flat = tag.replace(/\s+/g, ' ')
  const flags = parseTextTagFlags(flat)
  return (
    retiredSmallVariant(flags) ??
    mutedVariantSizeViolation(flags) ??
    redundantMutedOnRoleVariant(flags)
  )
}

/** `Text` owns roles via `variant` — not `text-style-*` utilities in `className`. */
export function textTagUsesTextStyleUtility(tag: string): string | null {
  const flat = tag.replace(/\s+/g, ' ')
  if (!TEXT_STYLE_UTILITY_RE.test(flat)) return null
  return 'Text className includes text-style-* (use matching variant prop)'
}

function extractQuotedClassStrings(source: string): string[] {
  const out: string[] = []
  const re = /[`'"]([^`'"]{0,500})[`'"]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source))) {
    const inner = match[1]
    if (inner == null) continue
    if (/\b(text-sm|text-xs|text-muted-foreground|font-medium)\b/.test(inner)) {
      out.push(inner)
    }
  }
  return out
}

/** Join string-literal args inside `cn(...)` for stack detection. */
export function extractCnMergedClassStrings(source: string): string[] {
  const out: string[] = []
  const cnRe = /cn\s*\(\s*([^)]{0,800})\s*\)/g
  let match: RegExpExecArray | null
  while ((match = cnRe.exec(source))) {
    const inner = match[1]
    if (inner == null) continue
    if (inner.includes('?') || inner.includes(':')) continue
    const literals = [...inner.matchAll(/['"`]([^'"`]+)['"`]/g)]
      .map((m) => m[1])
      .filter((literal): literal is string => literal != null)
    if (literals.length === 0) continue
    const merged = literals.join(' ')
    if (/\b(text-sm|text-xs|text-muted-foreground|font-medium)\b/.test(merged)) {
      out.push(merged)
    }
  }
  return out
}

export function findTextStyleStackViolations(
  source: string,
  filePath: string,
): { file: string; reason: string }[] {
  const hits: { file: string; reason: string }[] = []
  if (filePath.endsWith('text-style-stack-ratchet.lib.ts')) return hits
  if (filePath.endsWith('text-style-stack-ratchet.lib.test.ts')) return hits
  if (filePath.endsWith('text-style-stack-ratchet.test.ts')) return hits

  const classStrings = [
    ...extractQuotedClassStrings(source),
    ...extractCnMergedClassStrings(source),
  ]

  for (const classString of classStrings) {
    const reason = classStringViolatesMigratedStacks(classString)
    if (reason) hits.push({ file: filePath, reason })
  }

  let tagMatch: RegExpExecArray | null
  const tagRe = new RegExp(TEXT_TAG_RE.source, 'g')
  while ((tagMatch = tagRe.exec(source))) {
    const tag = tagMatch[0]
    const migrated = textTagViolatesMigratedStacks(tag)
    if (migrated) hits.push({ file: filePath, reason: migrated })
    const textStyleOnText = textTagUsesTextStyleUtility(tag)
    if (textStyleOnText) hits.push({ file: filePath, reason: textStyleOnText })
  }

  return hits
}

export function readSource(path: string): string {
  return readFileSync(path, 'utf8')
}

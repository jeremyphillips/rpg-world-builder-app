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

const STACK_SCAN_KEYWORD_RE = /\b(text-sm|text-xs|text-muted-foreground|font-medium)\b/

const TEXT_STYLE_UTILITY_RE = /\btext-style-[a-z0-9-]+\b/

const RATCHET_SELF_PATH_RE = /text-style-stack-ratchet/

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
  const hasXs = set.has('text-xs')
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

/** Opening `<p …>` — multiline attributes; respects quoted `className` strings. */
const PTAG_OPEN_RE = /<p\b(?:[^>"']|"[^"]*"|'[^']*')*>/g

const HEADING_STYLE_UTILITY_RE = /\bheading-style-[a-z0-9-]+\b/

const P_TAG_CARD_DESCRIPTION_CLASS_RE = /\bui-card__description\b/

function parseVariantFromTag(flat: string): string {
  const doubleQuoted = flat.match(/variant="([^"]+)"/)?.[1]
  if (doubleQuoted) return doubleQuoted
  const singleQuoted = flat.match(/variant='([^']+)'/)?.[1]
  if (singleQuoted) return singleQuoted
  const bracedLiteral = flat.match(/variant=\{['"`]([^'"`]+)['"`]\}/)?.[1]
  if (bracedLiteral) return bracedLiteral
  return 'body'
}

function parseTextTagFlags(flat: string) {
  return {
    variant: parseVariantFromTag(flat),
    hasMed: /\bfont-medium\b/.test(flat),
    hasSemi: /\bfont-semibold\b/.test(flat),
    hasSm: /\btext-sm\b/.test(flat),
    hasXs: /\btext-xs\b/.test(flat),
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
  if (!hasMutedFg) return null
  if (variant === 'caption' || variant === 'supporting') {
    return `Text variant="${variant}" + text-muted-foreground (redundant)`
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

function openingTagFlat(tag: string): string {
  return tag.replace(/\s+/g, ' ')
}

function openingTagIncludesTextStyleUtility(flat: string): boolean {
  return TEXT_STYLE_UTILITY_RE.test(flat)
}

/** `Text` owns roles via `variant` — not `text-style-*` utilities in `className`. */
export function textTagUsesTextStyleUtility(tag: string): string | null {
  const flat = openingTagFlat(tag)
  if (!openingTagIncludesTextStyleUtility(flat)) return null
  return 'Text className includes text-style-* (use matching variant prop)'
}

function pTagIsExempt(flat: string): boolean {
  if (/\bsr-only\b/.test(flat)) return true
  if (P_TAG_CARD_DESCRIPTION_CLASS_RE.test(flat)) return true
  return false
}

/** Paragraph copy uses `<Text>` — not typography composites on raw `<p>`. */
export function pTagViolatesTypographyOwnership(tag: string): string | null {
  const flat = openingTagFlat(tag)
  if (pTagIsExempt(flat)) return null
  if (openingTagIncludesTextStyleUtility(flat)) {
    return 'p className includes text-style-* (use <Text variant="…">)'
  }
  if (/\bfont-body-emphasis\b/.test(flat)) {
    return 'p className includes font-body-emphasis (use <Text variant="emphasis">)'
  }
  if (HEADING_STYLE_UTILITY_RE.test(flat)) {
    return 'p className includes heading-style-* (use <Heading variant="…"> or <Text>)'
  }
  return null
}

function classFragmentLooksRelevant(fragment: string): boolean {
  return STACK_SCAN_KEYWORD_RE.test(fragment)
}

function literalsFromFragment(fragment: string): string[] {
  return [...fragment.matchAll(/['"`]([^'"`]+)['"`]/g)]
    .map((m) => m[1])
    .filter((literal): literal is string => literal != null && classFragmentLooksRelevant(literal))
}

function pushMergedLiteralStrings(out: string[], literals: string[]): void {
  if (literals.length === 0) return
  const merged = literals.join(' ')
  if (classFragmentLooksRelevant(merged)) out.push(merged)
}

function extractQuotedClassStrings(source: string): string[] {
  const out: string[] = []
  const re = /['"]([^'"]{0,500})['"]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source))) {
    const inner = match[1]
    if (inner == null) continue
    if (classFragmentLooksRelevant(inner)) out.push(inner)
  }
  return out
}

/** Static template literals (no `${` interpolation). */
export function extractTemplateLiteralClassStrings(source: string): string[] {
  const out: string[] = []
  const re = /`([^`]{0,500})`/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source))) {
    const inner = match[1]
    if (inner == null || inner.includes('${')) continue
    if (classFragmentLooksRelevant(inner)) out.push(inner)
  }
  return out
}

function extractTernaryCnMergedStrings(inner: string): string[] {
  const out: string[] = []
  const segments: string[] = []
  const withoutTernaries = inner.replace(/\?[^:]*:[^,)]*/g, (ternary) => {
    const body = ternary.slice(1)
    const colon = body.indexOf(':')
    if (colon === -1) return ''
    segments.push(body.slice(0, colon), body.slice(colon + 1))
    return ''
  })
  segments.push(withoutTernaries)

  for (const segment of segments) {
    pushMergedLiteralStrings(out, literalsFromFragment(segment))
  }

  pushMergedLiteralStrings(out, literalsFromFragment(inner))
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

    if (inner.includes('?') && inner.includes(':')) {
      out.push(...extractTernaryCnMergedStrings(inner))
      continue
    }

    const literals = literalsFromFragment(inner)
    pushMergedLiteralStrings(out, literals)
  }
  return out
}

export function findTextStyleStackViolations(
  source: string,
  filePath: string,
): { file: string; reason: string }[] {
  const hits: { file: string; reason: string }[] = []
  if (RATCHET_SELF_PATH_RE.test(filePath)) return hits

  const classStrings = [
    ...extractQuotedClassStrings(source),
    ...extractTemplateLiteralClassStrings(source),
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

  let pMatch: RegExpExecArray | null
  const pRe = new RegExp(PTAG_OPEN_RE.source, 'g')
  while ((pMatch = pRe.exec(source))) {
    const pTag = pMatch[0]
    const pTypography = pTagViolatesTypographyOwnership(pTag)
    if (pTypography) hits.push({ file: filePath, reason: pTypography })
  }

  return hits
}

export function readSource(path: string): string {
  return readFileSync(path, 'utf8')
}

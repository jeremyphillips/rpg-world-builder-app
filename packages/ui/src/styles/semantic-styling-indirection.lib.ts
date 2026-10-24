import ts from 'typescript'

/**
 * Shrink-only styling ratchet.
 *
 * Keys are file + exported symbol + violation type. A file may lose keys.
 * It may not gain one. Replacing a removed hit with a different symbol or
 * violation type in the same file is a new key and fails the baseline.
 * A per-file count is not the ratchet.
 *
 * Flags only:
 * - `cva()` with no `variants` and no `compoundVariants` (`empty-cva`)
 * - an exported const whose initializer is one class token, when the symbol
 *   is a styling export (`single-semantic-alias` or `single-utility-alias`)
 *
 * A styling export's name ends in `Classes`, `Variants`, or `ClassName`, or
 * the file is `*.variants.ts` / `*.styles.ts`, or the value is passed into
 * `className`, `cn()`, or `cva()` in the same file. A string that merely
 * looks like a utility is not a hit unless it meets that test.
 *
 * Does not flag multi-class recipes, `cn()` compositions, function resolvers,
 * class maps, local JSX, or files that merely lack `cva`.
 */

const SEMANTIC_CLASS_PATTERN = /^(ui|dash)-[a-z0-9-]+(__[a-z0-9-]+)?(--[a-z0-9-]+)?$/

/**
 * First segment of a hyphenated utility (`text-muted-foreground` → `text`).
 * Data-attribute names and enum slugs (`primary-detail`) are not in this set.
 */
const UTILITY_PREFIXES = new Set([
  'accent',
  'align',
  'animate',
  'appearance',
  'aspect',
  'auto',
  'backdrop',
  'basis',
  'bg',
  'blur',
  'border',
  'bottom',
  'box',
  'break',
  'brightness',
  'caption',
  'caret',
  'clear',
  'col',
  'columns',
  'contain',
  'content',
  'contrast',
  'cursor',
  'decoration',
  'delay',
  'diagonal',
  'divide',
  'duration',
  'ease',
  'end',
  'field',
  'fill',
  'flex',
  'float',
  'font',
  'from',
  'gap',
  'grayscale',
  'grid',
  'grow',
  'h',
  'heading',
  'hyphens',
  'indent',
  'inset',
  'isolation',
  'items',
  'justify',
  'leading',
  'left',
  'line',
  'lining',
  'list',
  'm',
  'max',
  'mb',
  'me',
  'min',
  'mix',
  'ml',
  'mr',
  'ms',
  'mt',
  'mx',
  'my',
  'normal',
  'not',
  'object',
  'oldstyle',
  'opacity',
  'order',
  'origin',
  'outline',
  'overflow',
  'overline',
  'overscroll',
  'p',
  'pb',
  'pe',
  'placeholder',
  'place',
  'pl',
  'pointer',
  'pr',
  'proportional',
  'ps',
  'pt',
  'px',
  'py',
  'right',
  'ring',
  'rotate',
  'rounded',
  'row',
  'scale',
  'scroll',
  'select',
  'self',
  'sepia',
  'shadow',
  'shrink',
  'size',
  'skew',
  'slashed',
  'snap',
  'space',
  'sr',
  'stacked',
  'start',
  'stroke',
  'subpixel',
  'table',
  'tabular',
  'text',
  'to',
  'top',
  'touch',
  'tracking',
  'transition',
  'translate',
  'underline',
  'via',
  'w',
  'whitespace',
  'will',
  'z',
])

/** Single-word utilities. Hyphenated, variant, and arbitrary classes are detected separately. */
const SINGLE_WORD_CLASS_TOKENS = new Set([
  'absolute',
  'antialiased',
  'block',
  'border',
  'capitalize',
  'collapse',
  'container',
  'contents',
  'fixed',
  'flex',
  'grid',
  'group',
  'hidden',
  'inline',
  'invisible',
  'isolate',
  'italic',
  'list',
  'lowercase',
  'peer',
  'pointer',
  'prose',
  'relative',
  'resize',
  'ring',
  'rounded',
  'shadow',
  'static',
  'sticky',
  'subpixel',
  'table',
  'transform',
  'truncate',
  'underline',
  'uppercase',
  'visible',
])

export const STYLING_VIOLATION_TYPES = [
  'empty-cva',
  'single-semantic-alias',
  'single-utility-alias',
] as const

export type StylingViolationType = (typeof STYLING_VIOLATION_TYPES)[number]

export type StylingIndirectionHit = {
  filePath: string
  symbol: string
  violationType: StylingViolationType
}

const STYLING_EXPORT_SUFFIX = /(?:Classes|Variants|ClassName)$/
const STYLING_MODULE_FILE = /\.(?:variants|styles)\.[cm]?tsx?$/

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression
  }
  return current
}

function stringLiteralText(expression: ts.Expression): string | undefined {
  const unwrapped = unwrapExpression(expression)
  if (ts.isStringLiteral(unwrapped) || ts.isNoSubstitutionTemplateLiteral(unwrapped)) {
    return unwrapped.text
  }
  return undefined
}

function isClassToken(text: string): boolean {
  const token = text.trim()
  if (token.length === 0 || /\s/.test(token)) return false
  if (SEMANTIC_CLASS_PATTERN.test(token)) return true
  if (SINGLE_WORD_CLASS_TOKENS.has(token)) return true
  // Attribute names (`data-viewport-fill`) are not classes. Variant utilities
  // (`data-[state=open]:flex`, `2xl:flex`) still contain `:`.
  if (/^data-[a-z0-9-]+$/.test(token)) return false
  if (/^(?:calc|minmax|clamp|var)\(/.test(token)) return false
  if (/^\d/.test(token) && !token.includes(':')) return false
  if (/[:/![\]]/.test(token)) return true
  const root = token.split('-')[0]
  return root !== undefined && UTILITY_PREFIXES.has(root)
}

function singleClassToken(expression: ts.Expression): string | undefined {
  const text = stringLiteralText(expression)
  if (text === undefined) return undefined
  const token = text.trim()
  if (!isClassToken(token)) return undefined
  if (token !== text.trim()) return undefined
  return token
}

function propertyNameText(name: ts.PropertyName): string | undefined {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNoSubstitutionTemplateLiteral(name)
  ) {
    return name.text
  }
  return undefined
}

function objectHasVariantAxis(config: ts.ObjectLiteralExpression): boolean {
  let hasSpread = false
  for (const property of config.properties) {
    if (ts.isSpreadAssignment(property)) {
      hasSpread = true
      continue
    }
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue
    const name = propertyNameText(property.name)
    if (name === 'variants' || name === 'compoundVariants') return true
  }
  // A spread may carry `variants`. Do not treat that call as proven-empty.
  return hasSpread
}

function cvaCallIsEmpty(node: ts.CallExpression): boolean {
  if (!ts.isIdentifier(node.expression) || node.expression.text !== 'cva') return false
  const config = node.arguments[1]
  if (config === undefined) return true
  if (!ts.isObjectLiteralExpression(config)) return false
  return !objectHasVariantAxis(config)
}

function hasExportModifier(node: ts.Node): boolean {
  return (
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
      false)
  )
}

function isExportedVariable(declaration: ts.VariableDeclaration): boolean {
  const list = declaration.parent
  if (!ts.isVariableDeclarationList(list)) return false
  const statement = list.parent
  return ts.isVariableStatement(statement) && hasExportModifier(statement)
}

function isExportedFunction(node: ts.FunctionDeclaration): boolean {
  return node.name !== undefined && hasExportModifier(node)
}

function exportedSymbolForCva(node: ts.CallExpression): string | undefined {
  let current: ts.Node = node
  while (current.parent) {
    const parent = current.parent
    if (
      ts.isVariableDeclaration(parent) &&
      parent.initializer !== undefined &&
      unwrapExpression(parent.initializer) === node &&
      ts.isIdentifier(parent.name) &&
      isExportedVariable(parent)
    ) {
      return parent.name.text
    }
    if (ts.isFunctionDeclaration(parent) && isExportedFunction(parent) && parent.name) {
      return parent.name.text
    }
    current = parent
  }
  return undefined
}

function isVariantsOrStylesFile(filePath: string): boolean {
  return STYLING_MODULE_FILE.test(filePath)
}

function isStylingExportName(name: string): boolean {
  return STYLING_EXPORT_SUFFIX.test(name)
}

function identifierIsDeclarationName(node: ts.Identifier): boolean {
  const parent = node.parent
  if (ts.isVariableDeclaration(parent) && parent.name === node) return true
  if (ts.isFunctionDeclaration(parent) && parent.name === node) return true
  if (ts.isImportSpecifier(parent)) return true
  if (ts.isBindingElement(parent) && parent.name === node) return true
  return false
}

function nodeIsInside(node: ts.Node, predicate: (candidate: ts.Node) => boolean): boolean {
  let current: ts.Node | undefined = node
  while (current) {
    if (predicate(current)) return true
    current = current.parent
  }
  return false
}

function valueIsPassedToStylingApi(sourceFile: ts.SourceFile, name: string): boolean {
  let found = false
  function visit(node: ts.Node) {
    if (found) return
    if (ts.isIdentifier(node) && node.text === name && !identifierIsDeclarationName(node)) {
      const passedToCnOrCva = nodeIsInside(node, (candidate) => {
        if (!ts.isCallExpression(candidate)) return false
        const callee = candidate.expression
        return ts.isIdentifier(callee) && (callee.text === 'cn' || callee.text === 'cva')
      })
      const passedToClassName = nodeIsInside(node, (candidate) => {
        if (ts.isJsxAttribute(candidate) && candidate.name.text === 'className') return true
        if (
          ts.isPropertyAssignment(candidate) &&
          propertyNameText(candidate.name) === 'className'
        ) {
          return true
        }
        return false
      })
      if (passedToCnOrCva || passedToClassName) found = true
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

function pushHit(
  hits: StylingIndirectionHit[],
  seen: Set<string>,
  filePath: string,
  symbol: string,
  violationType: StylingViolationType,
): void {
  const key = `${symbol}:${violationType}`
  if (seen.has(key)) return
  seen.add(key)
  hits.push({ filePath, symbol, violationType })
}

export function stylingIndirectionHitKey(hit: StylingIndirectionHit): string {
  return `${hit.filePath}:${hit.symbol}:${hit.violationType}`
}

function recordEmptyCvaHit(
  node: ts.Node,
  hits: StylingIndirectionHit[],
  seen: Set<string>,
  filePath: string,
): void {
  if (!ts.isCallExpression(node) || !cvaCallIsEmpty(node)) return
  const symbol = exportedSymbolForCva(node)
  if (symbol) pushHit(hits, seen, filePath, symbol, 'empty-cva')
}

function recordExportedAliasHits(
  node: ts.Node,
  hits: StylingIndirectionHit[],
  seen: Set<string>,
  filePath: string,
  sourceFile: ts.SourceFile,
): void {
  if (!ts.isVariableStatement(node) || !hasExportModifier(node)) return
  for (const declaration of node.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue
    const token = singleClassToken(declaration.initializer)
    if (!token) continue
    const symbol = declaration.name.text
    const stylingExport =
      isStylingExportName(symbol) ||
      isVariantsOrStylesFile(filePath) ||
      valueIsPassedToStylingApi(sourceFile, symbol)
    if (!stylingExport) continue
    pushHit(
      hits,
      seen,
      filePath,
      symbol,
      SEMANTIC_CLASS_PATTERN.test(token) ? 'single-semantic-alias' : 'single-utility-alias',
    )
  }
}

export function findStylingIndirectionInSource(
  filePath: string,
  sourceText: string,
): StylingIndirectionHit[] {
  const hits: StylingIndirectionHit[] = []
  const seen = new Set<string>()
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  function visit(node: ts.Node) {
    recordEmptyCvaHit(node, hits, seen, filePath)
    recordExportedAliasHits(node, hits, seen, filePath, sourceFile)
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return hits
}

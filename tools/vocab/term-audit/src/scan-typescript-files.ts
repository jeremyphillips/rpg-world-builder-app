import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'

import { findConfigEntry, matchesGlob } from './config'
import type {
  TermAuditConfig,
  TermAuditSkip,
  TermSearchVariant,
  TermUsage,
  TermUsageContext,
} from './types'

type ScanOptions = {
  repositoryRoot: string
  config: TermAuditConfig
  ignore: readonly string[]
  variants: readonly TermSearchVariant[]
  targetKey: string
}

type ScanResult = {
  usages: TermUsage[]
  skippedFiles: TermAuditSkip[]
  parseFailures: TermAuditSkip[]
}

function normalize(value: string): string {
  return value.trim()
}

function containsExactPhrase(value: string, phrase: string): boolean {
  let position = value.indexOf(phrase)
  while (position >= 0) {
    const before = value[position - 1]
    const after = value[position + phrase.length]
    if (!/[A-Za-z0-9_]/.test(before ?? '') && !/[A-Za-z0-9_]/.test(after ?? '')) {
      return true
    }
    position = value.indexOf(phrase, position + phrase.length)
  }
  return false
}

function matchingVariantForms(
  rawValue: string,
  variants: readonly TermSearchVariant[],
): TermSearchVariant['form'][] {
  const value = normalize(rawValue)
  return variants
    .filter((variant) => containsExactPhrase(value, normalize(variant.value)))
    .map((variant) => variant.form)
}

function isSourceFile(path: string): boolean {
  return /\.(?:ts|tsx)$/.test(path) && !path.endsWith('.d.ts')
}

function walkSourceFiles(root: string, options: ScanOptions, result: ScanResult): string[] {
  const files: string[] = []

  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      const relativePath = relative(root, path).replaceAll('\\', '/')

      if (entry.isSymbolicLink()) {
        result.skippedFiles.push({ path: relativePath, reason: 'symbolic link' })
        continue
      }

      if (entry.isDirectory()) {
        if (options.ignore.some((glob) => matchesGlob(`${relativePath}/`, glob))) {
          result.skippedFiles.push({ path: relativePath, reason: 'ignored directory' })
          continue
        }
        visit(path)
        continue
      }

      if (!entry.isFile() || !isSourceFile(path)) continue
      if (options.ignore.some((glob) => matchesGlob(relativePath, glob))) {
        result.skippedFiles.push({ path: relativePath, reason: 'ignored file' })
        continue
      }
      files.push(path)
    }
  }

  visit(root)
  return files.sort((left, right) => left.localeCompare(right))
}

function propertyName(node: ts.Node): string | undefined {
  if (!ts.isPropertyAssignment(node.parent)) return undefined
  const { name } = node.parent
  return ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined
}

function jsxAttributeName(node: ts.Node): string | undefined {
  if (!ts.isJsxAttribute(node.parent)) return undefined
  return ts.isIdentifier(node.parent.name) ? node.parent.name.text : undefined
}

function ancestor(node: ts.Node, predicate: (candidate: ts.Node) => boolean): ts.Node | undefined {
  let current: ts.Node | undefined = node.parent
  while (current) {
    if (predicate(current)) return current
    current = current.parent
  }
  return undefined
}

function classifyNamedUsage(name: string | undefined): TermUsageContext | undefined {
  if (name === 'placeholder') return 'placeholder'
  if (name === 'label') return 'label'
  if (name === 'heading' || name === 'title' || name === 'aria-label') return 'heading'
  return undefined
}

function isMessageUsage(node: ts.Node): boolean {
  return Boolean(
    ancestor(
      node,
      (candidate) =>
        ts.isCallExpression(candidate) &&
        ts.isIdentifier(candidate.expression) &&
        candidate.expression.text === 'defineMessage',
    ),
  )
}

function classifyUsage(node: ts.Node, filePath: string): TermUsageContext {
  if (filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) return 'test_expectation'
  if (filePath.endsWith('.stories.tsx')) return 'story_fixture'

  const namedContext = classifyNamedUsage(jsxAttributeName(node) ?? propertyName(node))
  if (namedContext) return namedContext
  if (isMessageUsage(node)) return 'message'
  if (/[.!?]$/.test(node.getText().replace(/^['"`]|['"`]$/g, ''))) return 'sentence'
  return 'unknown'
}

function suggestedHelper(context: TermUsageContext, targetId: string): string | undefined {
  if (context === 'heading') return `getContentTypeCollectionLabel('${targetId}')`
  if (context === 'label') return `getContentTypeItemLabel('${targetId}')`
  if (context === 'placeholder') return `getContentTypeSentenceLabel('${targetId}')`
  return undefined
}

function makeUsage(
  node: ts.Node,
  source: ts.SourceFile,
  filePath: string,
  rawValue: string,
  variants: readonly TermSearchVariant[],
  targetKey: string,
  context: TermUsageContext,
): TermUsage | undefined {
  const value = normalize(rawValue)
  const variantForms = matchingVariantForms(rawValue, variants)

  if (variantForms.length === 0) return undefined
  const position = source.getLineAndCharacterOfPosition(node.getStart(source))
  const suggestion = targetKey.startsWith('content-type:')
    ? suggestedHelper(context, targetKey.slice(13))
    : undefined

  return {
    path: filePath,
    line: position.line + 1,
    column: position.character + 1,
    context,
    disposition: suggestion ? 'replaceable' : 'unknown',
    value,
    variantForms: variantForms.sort(),
    ...(suggestion ? { suggestion } : {}),
  }
}

function canonicalUsage(
  node: ts.Node,
  source: ts.SourceFile,
  filePath: string,
): TermUsage | undefined {
  const expression =
    ts.isCallExpression(node) && ts.isIdentifier(node.expression)
      ? node.expression.text
      : ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)
        ? node.expression.text
        : undefined
  if (
    !expression ||
    !/^(?:getContentType|formatContent|[A-Z_]+CONTENT_TYPE_TERM)/.test(expression)
  ) {
    return undefined
  }

  const position = source.getLineAndCharacterOfPosition(node.getStart(source))
  return {
    path: filePath,
    line: position.line + 1,
    column: position.character + 1,
    context: 'canonical_usage',
    disposition: 'ignored',
    value: node.getText(source),
    variantForms: [],
  }
}

function scanComments(
  source: ts.SourceFile,
  filePath: string,
  options: ScanOptions,
  usages: TermUsage[],
): void {
  const commentPattern = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g
  for (const match of source.text.matchAll(commentPattern)) {
    const comment = match[0]
    if (!comment) continue
    const variantForms = matchingVariantForms(comment, options.variants)
    if (variantForms.length > 0) {
      const position = source.getLineAndCharacterOfPosition(match.index ?? 0)
      usages.push({
        path: filePath,
        line: position.line + 1,
        column: position.character + 1,
        context: 'comment',
        disposition: 'unknown',
        value: normalize(comment),
        variantForms,
      })
    }
  }
}

export function scanTypeScriptFiles(options: ScanOptions): ScanResult {
  const result: ScanResult = { usages: [], skippedFiles: [], parseFailures: [] }
  const files = walkSourceFiles(options.repositoryRoot, options, result)

  for (const path of files) {
    const filePath = relative(options.repositoryRoot, path).replaceAll('\\', '/')
    const sourceText = readFileSync(path, 'utf8')
    const source = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true)
    const parseDiagnostics = ts.transpileModule(sourceText, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      fileName: path,
      reportDiagnostics: true,
    }).diagnostics
    if (parseDiagnostics?.length) {
      result.parseFailures.push({
        path: filePath,
        reason: ts.flattenDiagnosticMessageText(
          parseDiagnostics[0]?.messageText ?? 'parse failure',
          '\n',
        ),
      })
      continue
    }

    const configEntry = findConfigEntry(options.config, options.targetKey, filePath)
    const visit = (node: ts.Node): void => {
      const canonical = canonicalUsage(node, source, filePath)
      if (canonical) result.usages.push(canonical)

      let rawValue: string | undefined
      if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isJsxText(node)
      ) {
        rawValue = node.text
      } else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        rawValue = node.text
      }

      if (rawValue !== undefined) {
        const context = classifyUsage(node, filePath)
        const usage = makeUsage(
          node,
          source,
          filePath,
          rawValue,
          options.variants,
          options.targetKey,
          context,
        )
        if (usage) {
          if (configEntry) {
            usage.disposition = 'contextual'
          }
          result.usages.push(usage)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
    scanComments(source, filePath, options, result.usages)
  }

  result.usages.sort(
    (left, right) =>
      left.path.localeCompare(right.path) || left.line - right.line || left.column - right.column,
  )
  result.skippedFiles.sort((left, right) => left.path.localeCompare(right.path))
  result.parseFailures.sort((left, right) => left.path.localeCompare(right.path))
  return result
}

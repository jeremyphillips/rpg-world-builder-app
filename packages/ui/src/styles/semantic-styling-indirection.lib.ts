import ts from 'typescript'

const SEMANTIC_CLASS_PATTERN = /^(ui|dash)-[a-z0-9-]+(__[a-z0-9-]+)?(--[a-z0-9-]+)?$/

export type StylingIndirectionHit = {
  filePath: string
  line: number
  message: string
}

function lineOf(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
}

function isSemanticClassLiteral(node: ts.Expression): boolean {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return SEMANTIC_CLASS_PATTERN.test(node.text)
  }
  return false
}

function cvaHasVariantConfig(args: ts.NodeArray<ts.Expression>): boolean {
  const config = args[1]
  return config !== undefined && ts.isObjectLiteralExpression(config)
}

function exportName(decl: ts.VariableDeclaration): string | undefined {
  if (ts.isIdentifier(decl.name)) return decl.name.text
  return undefined
}

function fileReferencesConstInVariantOrMergeGroup(
  sourceFile: ts.SourceFile,
  constName: string,
): boolean {
  const text = sourceFile.getFullText()
  if (text.includes(`${constName}:`) && text.includes('variants')) return true
  if (text.includes(`${constName},`) || text.includes(`${constName}]`)) return true
  if (text.includes(`...${constName}`)) return true
  return false
}

function isClassSpecsExport(name: string): boolean {
  return name.endsWith('_CLASS_SPECS') || name.endsWith('CLASS_SPECS')
}

function pushHit(
  hits: StylingIndirectionHit[],
  filePath: string,
  sourceFile: ts.SourceFile,
  node: ts.Node,
  message: string,
): void {
  hits.push({ filePath, line: lineOf(sourceFile, node), message })
}

function checkCvaWithoutVariants(
  node: ts.Node,
  hits: StylingIndirectionHit[],
  filePath: string,
  sourceFile: ts.SourceFile,
): void {
  if (!ts.isCallExpression(node)) return
  if (!ts.isIdentifier(node.expression) || node.expression.text !== 'cva') return
  if (cvaHasVariantConfig(node.arguments)) return
  pushHit(hits, filePath, sourceFile, node, 'cva() without a variant config object')
}

function checkZeroArgSemanticReturn(
  node: ts.Node,
  hits: StylingIndirectionHit[],
  filePath: string,
  sourceFile: ts.SourceFile,
): void {
  if (!ts.isFunctionDeclaration(node) || !node.body || !ts.isBlock(node.body)) return
  if (node.parameters.length > 0) return
  const returnStmt = node.body.statements.find(ts.isReturnStatement)
  if (!returnStmt?.expression || !isSemanticClassLiteral(returnStmt.expression)) return
  pushHit(
    hits,
    filePath,
    sourceFile,
    node,
    'zero-argument function returning a single semantic class',
  )
}

function checkExportedSemanticAlias(
  node: ts.Node,
  hits: StylingIndirectionHit[],
  filePath: string,
  sourceFile: ts.SourceFile,
): void {
  if (!ts.isVariableStatement(node)) return
  if (!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return
  for (const decl of node.declarationList.declarations) {
    const name = exportName(decl)
    if (!name || !decl.initializer || !isSemanticClassLiteral(decl.initializer)) continue
    if (isClassSpecsExport(name)) continue
    if (fileReferencesConstInVariantOrMergeGroup(sourceFile, name)) continue
    pushHit(
      hits,
      filePath,
      sourceFile,
      decl,
      `exported const ${name} is a single semantic class alias`,
    )
  }
}

export function findStylingIndirectionInSource(
  filePath: string,
  sourceText: string,
): StylingIndirectionHit[] {
  const hits: StylingIndirectionHit[] = []
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  function visit(node: ts.Node) {
    checkCvaWithoutVariants(node, hits, filePath, sourceFile)
    checkZeroArgSemanticReturn(node, hits, filePath, sourceFile)
    checkExportedSemanticAlias(node, hits, filePath, sourceFile)
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return hits
}

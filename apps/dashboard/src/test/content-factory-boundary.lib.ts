import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'

export type ViolationKind =
  | 'annotation-construction'
  | 'satisfies'
  | 'type-assertion'
  | 'local-factory'

export type ContentFactoryBoundaryViolation = {
  file: string
  kind: ViolationKind
  type: string
  line: number
  fingerprint: string
}

const SCAN_ROOT = join(import.meta.dirname, '..')
const ALLOWLIST_PREFIX = 'test/fixtures/factories/'
const PICK_CALL_PATTERN =
  /\bpick(?:Class|Species|Equipment|Spell|Feat|SkillProficiency|Subclass|Weapon|Armor|EquipmentByKind|SubclassesForClass)\(/

const SCAN_SUFFIXES = [
  '.test.ts',
  '.test.tsx',
  '.fixtures.ts',
  '.stories.tsx',
  '/fixtures.ts',
] as const

const FACTORY_FILES = [
  'test/fixtures/factories/character-class.ts',
  'test/fixtures/factories/spell.ts',
  'test/fixtures/factories/species.ts',
  'test/fixtures/factories/feat.ts',
  'test/fixtures/factories/equipment.ts',
  'test/fixtures/factories/skill-proficiency.ts',
  'test/fixtures/factories/organization.ts',
  'test/fixtures/factories/location.ts',
] as const

function createDashboardProgram(): ts.Program {
  const dashboardRoot = join(SCAN_ROOT, '..')
  const configPath = ts.findConfigFile(dashboardRoot, ts.sys.fileExists, 'tsconfig.json')
  if (!configPath) {
    throw new Error('Unable to locate dashboard tsconfig.json for content factory boundary guard')
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dashboardRoot)

  return ts.createProgram(parsed.fileNames, parsed.options)
}

function resolveProtectedTypeNames(program: ts.Program): Set<string> {
  const checker = program.getTypeChecker()
  const protectedTypes = new Set<string>()

  for (const relativePath of FACTORY_FILES) {
    const normalizedSuffix = relativePath.replaceAll('\\', '/')
    const sourceFile = program.getSourceFiles().find((file) => {
      const normalizedName = file.fileName.replaceAll('\\', '/')
      return normalizedName === normalizedSuffix || normalizedName.endsWith(`/${normalizedSuffix}`)
    })
    if (!sourceFile) continue

    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isFunctionDeclaration(node) || !node.name?.text.startsWith('make')) return
      if ((ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) === 0) return
      if (!node.type) return

      if (ts.isTypeReferenceNode(node.type)) {
        protectedTypes.add(node.type.typeName.getText(sourceFile))
        return
      }

      const explicitReturnType = checker.getTypeFromTypeNode(node.type)
      const symbol = explicitReturnType.aliasSymbol ?? explicitReturnType.getSymbol()
      const typeName = symbol?.getName()
      if (typeName && typeName !== '__type') protectedTypes.add(typeName)
    })
  }

  return protectedTypes
}

function collectSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      files.push(...collectSourceFiles(absolutePath))
      continue
    }

    if (
      SCAN_SUFFIXES.some((suffix) => entry.name.endsWith(suffix) || entry.name === 'fixtures.ts')
    ) {
      files.push(absolutePath)
    }
  }

  return files
}

function isAllowlisted(relativePath: string): boolean {
  return relativePath.startsWith(ALLOWLIST_PREFIX)
}

function isInvalidSchemaFixture(content: string): boolean {
  return content.includes('@invalid-schema-fixture')
}

function fingerprintViolation(
  relativePath: string,
  kind: ViolationKind,
  typeName: string,
  line: number,
  snippet: string,
): string {
  return createHash('sha256')
    .update(`${relativePath}|${kind}|${typeName}|${line}|${snippet.trim()}`)
    .digest('hex')
    .slice(0, 16)
}

function scanFile(
  absolutePath: string,
  protectedTypes: Set<string>,
): ContentFactoryBoundaryViolation[] {
  const relativePath = relative(SCAN_ROOT, absolutePath).replaceAll('\\', '/')
  if (isAllowlisted(relativePath)) return []

  const content = readFileSync(absolutePath, 'utf8')
  if (isInvalidSchemaFixture(content)) return []

  const violations: ContentFactoryBoundaryViolation[] = []
  const lines = content.split('\n')
  const typePattern = [...protectedTypes].join('|')

  if (!typePattern) return violations

  const patterns: Array<{ kind: ViolationKind; regex: RegExp }> = [
    {
      kind: 'annotation-construction',
      regex: new RegExp(`:\\s*(?:${typePattern})\\s*=\\s*[{\\[]`, 'g'),
    },
    {
      kind: 'satisfies',
      regex: new RegExp(`satisfies\\s+(?:const\\s+)?(?:${typePattern})\\b`, 'g'),
    },
    {
      kind: 'type-assertion',
      regex: new RegExp(`\\}\\s*as\\s+(?:const\\s+)?(?:${typePattern})\\b`, 'g'),
    },
    {
      kind: 'type-assertion',
      regex: new RegExp(`as\\s+(?:unknown\\s+as\\s+)?(?:${typePattern})\\b`, 'g'),
    },
    {
      kind: 'local-factory',
      regex: new RegExp(
        `function\\s+make\\w+\\([^)]*\\)\\s*(?::\\s*(?:${typePattern}))?\\s*\\{`,
        'g',
      ),
    },
  ]

  for (const { kind, regex } of patterns) {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]!
      if (PICK_CALL_PATTERN.test(line)) continue

      if (
        line.includes('makeCharacterClass(') ||
        line.includes('makeEquipment(') ||
        line.includes('makeSpecies(') ||
        line.includes('makeSpell(') ||
        line.includes('makeFeat(') ||
        line.includes('makeSkillProficiency(') ||
        line.includes('makeOrganization(') ||
        line.includes('makeLocation(')
      ) {
        continue
      }

      if (!regex.test(line)) continue
      regex.lastIndex = 0

      const matchedType =
        [...protectedTypes].find((typeName) => line.includes(typeName)) ?? 'unknown'

      violations.push({
        file: relativePath,
        kind,
        type: matchedType,
        line: index + 1,
        fingerprint: fingerprintViolation(relativePath, kind, matchedType, index + 1, line),
      })
    }
  }

  return violations
}

export function collectContentFactoryBoundaryViolations(): ContentFactoryBoundaryViolation[] {
  const program = createDashboardProgram()
  const protectedTypes = resolveProtectedTypeNames(program)
  const files = collectSourceFiles(SCAN_ROOT)

  return files
    .flatMap((file) => scanFile(file, protectedTypes))
    .sort((left, right) =>
      left.file === right.file ? left.line - right.line : left.file.localeCompare(right.file),
    )
}

export function resolveProtectedTypeNamesForTest(program: ts.Program): string[] {
  return [...resolveProtectedTypeNames(program)]
}

export function violationKey(violation: ContentFactoryBoundaryViolation): string {
  return `${violation.file}:${violation.line}:${violation.kind}:${violation.fingerprint}`
}

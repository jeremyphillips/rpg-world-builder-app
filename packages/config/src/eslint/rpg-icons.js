import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const baselinePath = join(dirname(fileURLToPath(import.meta.url)), 'icon-provider-baseline.json')
const defaultBaseline = JSON.parse(readFileSync(baselinePath, 'utf8'))

/** Files that may import an icon provider. Paths are repo-relative. */
export const ICON_PROVIDER_ALLOWLIST = new Set([
  'packages/ui/src/components/ui/icon/icon-glyphs.lucide.ts',
  'packages/ui/src/components/ui/icon/icon-glyphs.lucide.test.ts',
])

const PROMISE_METHODS = new Set(['then', 'catch', 'finally'])

const ICON_PROVIDER_EXACT = new Set([
  'lucide-react',
  'lucide',
  'react-icons',
  '@tabler/icons-react',
  '@radix-ui/react-icons',
])

const ICON_PROVIDER_PREFIXES = [
  'lucide-react/',
  'lucide/',
  '@lucide/',
  'react-icons/',
  '@heroicons/',
  '@phosphor-icons/',
  '@tabler/icons-react/',
  '@radix-ui/react-icons/',
]

export function repoRelativePath(filename) {
  const normalized = String(filename).replaceAll('\\', '/')
  const match = normalized.match(/(?:^|\/)((?:apps|packages)\/.+)$/)
  return match ? match[1] : normalized
}

function isIconProvider(source) {
  if (typeof source !== 'string') return false
  if (ICON_PROVIDER_EXACT.has(source)) return true
  return ICON_PROVIDER_PREFIXES.some((prefix) => source.startsWith(prefix))
}

function literalString(node) {
  if (!node) return null
  if (
    (node.type === 'Literal' || node.type === 'StringLiteral') &&
    typeof node.value === 'string'
  ) {
    return node.value
  }
  if (node.type === 'TSLiteralType') return literalString(node.literal)
  return null
}

function idName(node) {
  if (!node) return null
  if (node.type === 'Identifier') return node.name
  if (node.type === 'Literal' && node.value != null) return String(node.value)
  return null
}

function patternNames(pattern) {
  if (!pattern || pattern.type !== 'ObjectPattern') return null
  const names = []
  for (const prop of pattern.properties) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return null
    if (prop.computed) return null
    const name = idName(prop.key)
    if (!name) return null
    names.push(name)
  }
  return names
}

function variableDeclaratorPatternNames(node) {
  let current = node.parent
  if (current?.type === 'AwaitExpression' || current?.type === 'ChainExpression') {
    current = current.parent
  }
  if (current?.type !== 'VariableDeclarator') return null
  return patternNames(current.id) ?? ['*']
}

function memberExpressionBindingNames(node) {
  const current = node.parent
  if (current?.type !== 'MemberExpression' || current.computed || current.object !== node) {
    return null
  }
  const name = idName(current.property)
  if (!name || PROMISE_METHODS.has(name)) return null
  return [name]
}

function namesFromCallResult(node) {
  return variableDeclaratorPatternNames(node) ?? memberExpressionBindingNames(node) ?? ['*']
}

function qualifierName(qualifier) {
  if (!qualifier) return '*'
  if (qualifier.type === 'Identifier') return qualifier.name
  if (qualifier.type === 'TSQualifiedName') return qualifierName(qualifier.right)
  return '*'
}

// fallow-ignore-next-line complexity — generic ESTree walk; complexity is structural, not branchy logic.
function walk(node, parent, visit) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return
  node.parent = parent
  visit(node)
  for (const key of Object.keys(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range' || key === 'start' || key === 'end') {
      continue
    }
    const value = node[key]
    if (Array.isArray(value)) {
      for (const child of value) walk(child, node, visit)
    } else if (value && typeof value.type === 'string') {
      walk(value, node, visit)
    }
  }
}

function noteImportDeclaration(node, note) {
  if (node.type !== 'ImportDeclaration' || !isIconProvider(literalString(node.source))) return false
  for (const specifier of node.specifiers) {
    if (specifier.type === 'ImportDefaultSpecifier') note('default', specifier)
    else if (specifier.type === 'ImportNamespaceSpecifier') note('*', specifier)
    else note(idName(specifier.imported) ?? '*', specifier)
  }
  return true
}

function noteExportNamedDeclaration(node, note) {
  if (
    node.type !== 'ExportNamedDeclaration' ||
    !node.source ||
    !isIconProvider(literalString(node.source))
  ) {
    return false
  }
  for (const specifier of node.specifiers) {
    note(idName(specifier.local) ?? '*', specifier)
  }
  return true
}

function noteDynamicProviderImport(node, note) {
  for (const name of namesFromCallResult(node)) note(name, node)
}

function noteExportAllDeclaration(node, note) {
  if (node.type !== 'ExportAllDeclaration' || !isIconProvider(literalString(node.source))) {
    return false
  }
  note('*', node)
  return true
}

function noteImportExpression(node, note) {
  if (node.type !== 'ImportExpression' || !isIconProvider(literalString(node.source))) {
    return false
  }
  noteDynamicProviderImport(node, note)
  return true
}

function noteRequireCall(node, note) {
  if (node.type !== 'CallExpression') return false
  if (node.callee?.type !== 'Identifier' || node.callee.name !== 'require') return false
  if (!isIconProvider(literalString(node.arguments?.[0]))) return false
  noteDynamicProviderImport(node, note)
  return true
}

function noteTsImportType(node, note) {
  if (node.type !== 'TSImportType') return false
  const sourceNode = node.source ?? node.argument
  const source = typeof sourceNode === 'string' ? sourceNode : literalString(sourceNode)
  if (!isIconProvider(source)) return false
  note(qualifierName(node.qualifier), node)
  return true
}

function noteTsImportEquals(node, note) {
  if (node.type !== 'TSImportEqualsDeclaration') return false
  const reference = node.moduleReference
  if (
    reference?.type !== 'TSExternalModuleReference' ||
    !isIconProvider(literalString(reference.expression))
  ) {
    return false
  }
  note('*', node)
  return true
}

function visitIconProviderBinding(node, note) {
  if (noteImportDeclaration(node, note)) return
  if (noteExportNamedDeclaration(node, note)) return
  if (noteExportAllDeclaration(node, note)) return
  if (noteImportExpression(node, note)) return
  if (noteRequireCall(node, note)) return
  if (noteTsImportType(node, note)) return
  noteTsImportEquals(node, note)
}

/** @returns {Map<string, object>} provider export name → AST node */
export function collectIconProviderBindings(program) {
  const found = new Map()
  function note(name, node) {
    if (!found.has(name)) found.set(name, node)
  }

  walk(program, null, (node) => visitIconProviderBinding(node, note))

  return found
}

export const noIconProviderImport = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Block icon-provider imports outside the binding baseline and the Lucide adapter.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          baseline: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    ],
    messages: {
      unlisted:
        "Importing '{{name}}' from an icon provider is outside the baseline. Use Icon from @rpg/ui, or add the binding to icon-provider-baseline.json.",
      stale:
        "Baseline lists '{{name}}' for this file, but it is no longer imported. Remove it from icon-provider-baseline.json.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    const relativePath = repoRelativePath(filename)
    if (ICON_PROVIDER_ALLOWLIST.has(relativePath)) return {}

    const configured = context.options[0]?.baseline ?? defaultBaseline
    const allowed = new Set(configured[relativePath] ?? [])

    return {
      'Program:exit'(program) {
        const found = collectIconProviderBindings(program)
        for (const [name, node] of found) {
          if (!allowed.has(name)) {
            context.report({ node, messageId: 'unlisted', data: { name } })
          }
        }
        for (const name of allowed) {
          if (!found.has(name)) {
            context.report({ node: program, messageId: 'stale', data: { name } })
          }
        }
      },
    }
  },
}

export const rpgIconsPlugin = {
  meta: { name: 'rpg-icons' },
  rules: {
    'no-icon-provider-import': noIconProviderImport,
  },
}

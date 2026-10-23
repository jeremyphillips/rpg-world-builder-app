/** Files that may import an icon provider. Paths are repo-relative. */
export const ICON_PROVIDER_ALLOWLIST = new Set([
  'packages/ui/src/components/ui/icon/icon-glyphs.lucide.ts',
  'packages/ui/src/components/ui/icon/icon-glyphs.lucide.test.ts',
])

/** Production modules that may render a raw `<svg>`. Paths are repo-relative. */
export const INLINE_SVG_ALLOWLIST = new Set([
  'packages/ui/src/components/ui/icon/icon-glyphs.custom.tsx',
  'packages/ui/src/components/ui/overlay-arrow.client.tsx',
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

function isInlineSvgScope(relativePath) {
  if (!relativePath.endsWith('.tsx')) return false
  if (relativePath.endsWith('.test.tsx') || relativePath.endsWith('.stories.tsx')) return false
  if (
    !relativePath.startsWith('packages/ui/') &&
    !relativePath.startsWith('apps/dashboard/') &&
    !relativePath.startsWith('apps/bench/') &&
    !relativePath.startsWith('apps/public/')
  ) {
    return false
  }
  return true
}

function jsxElementName(node) {
  if (!node?.name) return null
  if (node.name.type === 'JSXIdentifier') return node.name.name
  if (node.name.type === 'JSXMemberExpression' && node.name.property?.type === 'JSXIdentifier') {
    return node.name.property.name
  }
  return null
}

export const noIconProviderImport = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Block icon-provider imports outside the Lucide adapter allowlist.',
    },
    schema: [],
    messages: {
      forbidden:
        "Importing '{{name}}' from an icon provider is not allowed. Use Icon from @rpg/ui.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    const relativePath = repoRelativePath(filename)
    if (ICON_PROVIDER_ALLOWLIST.has(relativePath)) return {}

    return {
      'Program:exit'(program) {
        const found = collectIconProviderBindings(program)
        for (const [name, node] of found) {
          context.report({ node, messageId: 'forbidden', data: { name } })
        }
      },
    }
  },
}

export const noInlineSvg = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Block raw inline <svg> outside the custom glyph and overlay arrow adapters.',
    },
    schema: [],
    messages: {
      forbidden: 'Use <Icon> instead of a raw <svg> element.',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    const relativePath = repoRelativePath(filename)
    if (!isInlineSvgScope(relativePath) || INLINE_SVG_ALLOWLIST.has(relativePath)) {
      return {}
    }

    return {
      JSXOpeningElement(node) {
        if (jsxElementName(node) !== 'svg') return
        context.report({ node, messageId: 'forbidden' })
      },
    }
  },
}

export const rpgIconsPlugin = {
  meta: { name: 'rpg-icons' },
  rules: {
    'no-icon-provider-import': noIconProviderImport,
    'no-inline-svg': noInlineSvg,
  },
}

export type SlotIdentityCounts = Record<string, number>

const SLOT_KIND = /kind:\s*'slot'(?:\s+as\s+const)?/g

function enclosingFunction(source: string, index: number): string {
  const head = source.slice(0, index)
  const matches = [
    ...head.matchAll(
      /\b(?:async\s+)?function\s+([A-Za-z0-9_]+)|(?:const|let)\s+([A-Za-z0-9_]+)\s*=/g,
    ),
  ]
  const last = matches.at(-1)
  return last?.[1] ?? last?.[2] ?? 'slot'
}

function readQuoted(source: string, start: number): { value: string; end: number } | null {
  const quote = source[start]
  if (quote !== "'" && quote !== '"') return null
  let value = ''
  let i = start + 1
  while (i < source.length) {
    const ch = source[i]
    if (ch === '\\') {
      value += source[i + 1] ?? ''
      i += 2
      continue
    }
    if (ch === quote) return { value, end: i + 1 }
    value += ch
    i += 1
  }
  return null
}

function readTemplate(source: string, start: number): { raw: string; end: number } | null {
  if (source[start] !== '`') return null
  let raw = ''
  let i = start + 1
  while (i < source.length) {
    if (source[i] === '\\') {
      raw += source[i + 1] ?? ''
      i += 2
      continue
    }
    if (source[i] === '`') return { raw, end: i + 1 }
    raw += source[i]
    i += 1
  }
  return null
}

function constString(source: string, ident: string): string | null {
  const match = new RegExp(`(?:export\\s+)?const\\s+${ident}\\s*=\\s*(['"])([^'"]*)\\1`).exec(
    source,
  )
  return match?.[2] ?? null
}

function stringsIn(source: string, start: number, end: number): string[] {
  const values: string[] = []
  let i = start
  while (i < end) {
    if (source[i] === "'" || source[i] === '"') {
      const quoted = readQuoted(source, i)
      if (!quoted) break
      values.push(quoted.value)
      i = quoted.end
      continue
    }
    i += 1
  }
  return values
}

/** String literals in the branches of `cond ? 'a' : 'b'`, ignoring the condition. */
function ternaryBranchNames(source: string, start: number): string[] | null {
  let depth = 0
  let question = -1
  let colon = -1
  let i = start
  const limit = Math.min(source.length, start + 600)
  while (i < limit) {
    const ch = source[i]
    if (ch === "'" || ch === '"') {
      const quoted = readQuoted(source, i)
      if (!quoted) return null
      i = quoted.end
      continue
    }
    if (ch === '`') {
      const template = readTemplate(source, i)
      if (!template) return null
      i = template.end
      continue
    }
    if (ch === '(' || ch === '{' || ch === '[') depth += 1
    else if (ch === ')' || ch === '}' || ch === ']') {
      if (depth === 0) break
      depth -= 1
    } else if (depth === 0 && ch === '?') question = i
    else if (depth === 0 && ch === ':' && question !== -1) {
      colon = i
      break
    } else if (depth === 0 && ch === ',') break
    i += 1
  }
  if (question === -1 || colon === -1) return null

  let end = colon + 1
  depth = 0
  while (end < limit) {
    const ch = source[end]
    if (ch === "'" || ch === '"') {
      const quoted = readQuoted(source, end)
      if (!quoted) break
      end = quoted.end
      continue
    }
    if (ch === '(' || ch === '{' || ch === '[') depth += 1
    else if (ch === ')' || ch === '}' || ch === ']') {
      if (depth === 0) break
      depth -= 1
    } else if (depth === 0 && (ch === ',' || ch === '\n')) break
    end += 1
  }

  const names = [...stringsIn(source, question + 1, colon), ...stringsIn(source, colon + 1, end)]
  return names.length > 0 ? names : null
}

function callStringNames(source: string, openParen: number): string[] | null {
  let depth = 0
  let i = openParen
  const names: string[] = []
  while (i < source.length) {
    const ch = source[i]
    if (ch === "'" || ch === '"') {
      const quoted = readQuoted(source, i)
      if (!quoted) return null
      names.push(quoted.value)
      i = quoted.end
      continue
    }
    if (ch === '(') depth += 1
    else if (ch === ')') {
      depth -= 1
      if (depth === 0) return names.length > 0 ? names : null
    }
    i += 1
  }
  return null
}

function nameKeys(source: string, exprStart: number): string[] | null {
  let i = exprStart
  while (source[i] === ' ' || source[i] === '\n' || source[i] === '\r' || source[i] === '\t') i += 1

  const quoted = readQuoted(source, i)
  if (quoted) return [quoted.value]

  const template = readTemplate(source, i)
  if (template) {
    if (!template.raw.includes('${')) return [template.raw]
    const tail = template.raw.slice(template.raw.lastIndexOf('}') + 1).replace(/^\./, '')
    return /^[A-Za-z0-9_.]+$/.test(tail) && tail.length > 0 ? [tail] : null
  }

  const ident = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(i))
  if (ident) {
    const after = i + ident[0].length
    const paren = /^\s*\(/.exec(source.slice(after))
    if (paren) {
      const open = after + paren[0].length - 1
      return callStringNames(source, open)
    }
  }

  const branches = ternaryBranchNames(source, i)
  if (branches) return branches

  if (ident) {
    const resolved = constString(source, ident[0])
    if (resolved) return [resolved]
  }

  return null
}

/** Stable slot identities in one production source file. */
export function collectSlotIdentities(source: string, file: string): SlotIdentityCounts {
  const counts: SlotIdentityCounts = {}
  const add = (name: string) => {
    const key = `${file}::${name}`
    counts[key] = (counts[key] ?? 0) + 1
  }

  for (const match of source.matchAll(SLOT_KIND)) {
    const index = match.index ?? 0
    const from = index + match[0].length
    const ahead = source.slice(from, from + 160)
    const labeled = /\bname\s*:/.exec(ahead)
    const shorthand = /\bname\s*[,}\n]/.exec(ahead)
    const shorthandWins = shorthand != null && (labeled == null || shorthand.index < labeled.index)
    if (shorthandWins || !labeled) {
      add(`${enclosingFunction(source, index)}()`)
      continue
    }
    const keys = nameKeys(source, from + labeled.index + labeled[0].length)
    if (!keys) {
      add(`${enclosingFunction(source, index)}()`)
      continue
    }
    for (const key of keys) add(key)
  }

  return counts
}

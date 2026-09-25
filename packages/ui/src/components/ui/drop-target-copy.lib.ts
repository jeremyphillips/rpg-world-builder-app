/** Shared title while an external file drag is over an active drop target. */
export const DROP_TARGET_ACTIVE_TITLE = 'Drop to upload'

/** Shared message when dragged files fail accept/size validation. */
export const DROP_TARGET_INVALID_MESSAGE = "These files can't be added"

/** Maps a MIME type or extension entry to a short display label. */
function resolveAcceptLabel(entry: string): string {
  if (entry === 'image/jpeg') return 'JPG'
  if (entry === 'image/png') return 'PNG'
  if (entry === 'image/webp') return 'WEBP'
  if (entry === 'image/gif') return 'GIF'
  if (entry === 'image/*') return 'image'
  if (entry.startsWith('.')) return entry.slice(1).toUpperCase()
  if (entry.includes('/')) return entry.split('/')[1]?.toUpperCase() ?? entry
  return entry.toUpperCase()
}

function isImageAcceptEntry(entry: string): boolean {
  return (
    entry.startsWith('image/') || (entry.startsWith('.') && /\.(jpe?g|png|webp|gif)$/i.test(entry))
  )
}

export function isImageAcceptList(accept: string[]): boolean {
  return accept.length > 0 && accept.every(isImageAcceptEntry)
}

function resolveMediaKind(accept: string[]): 'image' | 'file' {
  return isImageAcceptList(accept) ? 'image' : 'file'
}

function withIndefiniteArticle(noun: string): string {
  return /^[aeiou]/i.test(noun) ? `an ${noun}` : `a ${noun}`
}

function joinAcceptLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`
}

export function resolveDropTargetCopy(input: { accept: string[]; multiple: boolean }): {
  title: string
  description: string
  useImageIcon: boolean
} {
  const kind = resolveMediaKind(input.accept)
  const noun = kind === 'image' ? 'image' : 'file'
  const pluralNoun = kind === 'image' ? 'images' : 'files'

  if (input.multiple) {
    return {
      title: `Add ${pluralNoun}`,
      description: `Drag and drop ${pluralNoun} here, or choose files.`,
      useImageIcon: kind === 'image',
    }
  }

  return {
    title: `Add ${withIndefiniteArticle(noun)}`,
    description: `Drag and drop ${withIndefiniteArticle(noun)} here, or choose a file.`,
    useImageIcon: kind === 'image',
  }
}

export function resolveDropTargetRequirements(input: {
  accept: string[]
  maxSize?: number
}): string | undefined {
  const labels = input.accept.map(resolveAcceptLabel)
  if (labels.length === 0)
    return input.maxSize !== undefined ? formatMaxSize(input.maxSize) : undefined

  const typeClause = joinAcceptLabels(labels)

  if (input.maxSize === undefined) return typeClause
  return `${typeClause} · ${formatMaxSize(input.maxSize)}`
}

function formatMaxSize(maxSize: number): string {
  return `Max ${Math.round(maxSize / 1024 / 1024)} MB`
}

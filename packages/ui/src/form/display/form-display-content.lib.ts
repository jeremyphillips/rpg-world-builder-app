import type {
  DisplayConfig,
  FormDisplayBlock,
  FormDisplayRulesContent,
} from '../field-config/display-config.types'

export function collectDisplayDependsOn(config: DisplayConfig): readonly string[] {
  const deps = new Set<string>()
  config.visibility?.dependsOn.forEach((name) => deps.add(name))
  config.resolve?.dependsOn.forEach((name) => deps.add(name))
  return [...deps]
}

export function normalizeDisplayBlocks(
  content: FormDisplayBlock | readonly FormDisplayBlock[] | undefined,
): FormDisplayBlock[] {
  if (content === undefined) return []
  if (Array.isArray(content)) return [...content]
  return [content as FormDisplayBlock]
}

function rulesPreviewBlockHasContent(content: FormDisplayRulesContent): boolean {
  switch (content.kind) {
    case 'prose':
      return Boolean(content.text.trim())
    case 'metadata':
      return content.rows.length > 0
    case 'guidance':
      return Boolean(content.message.trim())
    case 'rules':
      return content.document.length > 0
  }
}

function displayBlockIsEmpty(block: FormDisplayBlock): boolean {
  switch (block.variant) {
    case 'text':
      return !block.text.trim()
    case 'notice':
      return !block.notice.message.trim()
    case 'rulesPreview':
      return !rulesPreviewBlockHasContent(block.preview.content)
    case 'featureTableRow':
      return !block.title.trim()
    default:
      return false
  }
}

export function resolveDisplayBlocks(
  config: DisplayConfig,
  values: Record<string, unknown>,
): FormDisplayBlock[] {
  const resolved = config.resolve ? config.resolve.contentWhen(values) : config.content
  const blocks = normalizeDisplayBlocks(resolved)
  return blocks.filter((block) => !displayBlockIsEmpty(block))
}

export function displayContentIsEmpty(blocks: readonly FormDisplayBlock[]): boolean {
  return blocks.length === 0
}

import type { ContentSource, ContentStatus } from '@rpg/contracts'

import { isDraftSubclassId } from './subclass-editor-constants'

const SOURCE_BADGE_LABEL = {
  system: 'System',
  homebrew: 'Homebrew',
  unsaved: 'Unsaved',
} as const

export function resolveSubclassEditorSourceLabel(
  subclassId: string,
  source: ContentSource,
  status: ContentStatus,
): string {
  const listSource =
    isDraftSubclassId(subclassId) || (source === 'homebrew' && status === 'draft')
      ? 'unsaved'
      : source

  return SOURCE_BADGE_LABEL[listSource]
}

import { DropTargetPrompt, resolveImageDropTargetDefaults } from '@rpg/ui'

export function MediaManagerBodyDropOverlay({ invalid = false }: { invalid?: boolean }) {
  const defaults = resolveImageDropTargetDefaults()
  return (
    <DropTargetPrompt
      aria-hidden="true"
      layout="cover"
      state={invalid ? 'invalid' : 'active'}
      accept={defaults.accept}
      multiple
      maxSize={defaults.maxSize}
      density={defaults.density}
    />
  )
}

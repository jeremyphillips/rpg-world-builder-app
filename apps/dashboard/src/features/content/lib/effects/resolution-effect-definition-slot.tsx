import { FormItems, type FormItem } from '@rpg/ui/form'
import { useWatch } from 'react-hook-form'

import { resolveEffectDefinitionPath } from './resolve-effect-definition-path'

/** Mounts definition fields at the library path for this row's effect id. */
export function ResolutionEffectDefinitionSlot({
  path,
  libraryPath,
  fields,
}: {
  path: string
  libraryPath: string
  fields: FormItem[]
}) {
  const effectId = useWatch({ name: `${path}.effectId` })
  const library = useWatch({ name: libraryPath })
  const definitionPath = resolveEffectDefinitionPath(
    libraryPath,
    library,
    typeof effectId === 'string' ? effectId : undefined,
  )
  if (!definitionPath) return null
  return (
    <FormItems
      idPrefix={definitionPath.replace(/[^a-zA-Z0-9_-]/g, '-')}
      namePrefix={definitionPath}
      items={fields}
    />
  )
}

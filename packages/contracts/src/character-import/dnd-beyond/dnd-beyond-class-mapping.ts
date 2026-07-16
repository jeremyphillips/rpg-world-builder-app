import { DND_BEYOND_SRD_TOOL_RULESET_ID } from './dnd-beyond-tool-mapping'
import type { DndBeyondClass } from './dnd-beyond-character.schema'

// ---------------------------------------------------------------------------
// D&D Beyond stores classes on data.classes — map to local catalog slug/id.
// ---------------------------------------------------------------------------

const DDB_CLASS_SLUG_PREFIX = /^\d+-(.+)$/

type ShallowDefinition = {
  name?: string
  slug?: string
  id?: number
}

function inferLocalSlugFromDefinition(
  definition: ShallowDefinition | null | undefined,
): string | undefined {
  const slug = definition?.slug?.trim()
  if (slug) {
    const prefixed = slug.match(DDB_CLASS_SLUG_PREFIX)
    if (prefixed?.[1]) return prefixed[1].toLowerCase()
    return slug.toLowerCase()
  }

  const name = definition?.name?.trim()
  if (!name) return undefined

  return name.toLowerCase().replace(/\s+/g, '-')
}

export function readDndBeyondClassLabel(dndClass: DndBeyondClass): string | undefined {
  return dndClass.definition?.name?.trim() || undefined
}

export function inferLocalClassSlug(dndClass: DndBeyondClass): string | undefined {
  return inferLocalSlugFromDefinition(dndClass.definition)
}

export function inferLocalClassId(dndClass: DndBeyondClass): string | undefined {
  const localSlug = inferLocalClassSlug(dndClass)
  if (!localSlug) return undefined
  return `${DND_BEYOND_SRD_TOOL_RULESET_ID}:${localSlug}`
}

export function readDndBeyondSubclassLabel(dndClass: DndBeyondClass): string | undefined {
  return dndClass.subclassDefinition?.name?.trim() || undefined
}

export function inferLocalSubclassSlug(dndClass: DndBeyondClass): string | undefined {
  return inferLocalSlugFromDefinition(dndClass.subclassDefinition)
}

export function inferLocalSubclassId(dndClass: DndBeyondClass): string | undefined {
  const localSlug = inferLocalSubclassSlug(dndClass)
  if (!localSlug) return undefined
  return `${DND_BEYOND_SRD_TOOL_RULESET_ID}:${localSlug}`
}

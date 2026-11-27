import { formatGeneralTableMetadata, type GeneralTable } from '@rpg/contracts'
import { extractTableEmbedIds } from '@rpg/ui'

import type { ProvenanceAccumulator } from '../../lib/forms/submit/accumulate-prepared-write-provenance.lib'
import { recordArrayCompaction } from '../../lib/forms/submit/accumulate-prepared-write-provenance.lib'

export function formatSpellTableMetadata(table: GeneralTable): string {
  return formatGeneralTableMetadata(table)
}

/** Prune spell tables[] to ids still referenced in description HTML embeds. */
export function pruneSpellTablesToDescriptionEmbeds(
  description: string | undefined,
  tables: GeneralTable[],
  provenance?: ProvenanceAccumulator,
): GeneralTable[] {
  const referenced = new Set(extractTableEmbedIds(description ?? ''))
  if (provenance) {
    recordArrayCompaction(provenance, 'tables', tables.length, (index) =>
      referenced.has(tables[index]!.id),
    )
  }
  return tables.filter((table) => referenced.has(table.id))
}

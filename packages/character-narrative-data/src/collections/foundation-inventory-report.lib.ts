import type { NarrativeCollection } from '@rpg/contracts/character-narrative'

import {
  buildFoundationInventory,
  findHighTextOverlap,
  findRepeatedOpenings,
} from './foundation-audit.test-support'

export function renderFoundationInventoryReport(collection: NarrativeCollection): string {
  const inventory = buildFoundationInventory(collection)
  const reviewOverlaps = findHighTextOverlap(collection.fragments, 0.35)
  const repeatedOpenings = findRepeatedOpenings(collection.fragments, 4)

  const json = (value: unknown) => JSON.stringify(value, null, 2)

  return `# Foundation collection inventory

Generated from collection revision \`${collection.revision}\`. Do not edit
this file directly. Regenerate it with:

\`\`\`bash
pnpm --filter @rpg/character-narrative-data review:inventory
\`\`\`

Counts are editorial signals, not symmetry requirements. Hook shapes are inferred
from slot and prose markers, so reviewers must confirm the classification.

## Total and slot coverage

\`\`\`json
${json({ total: inventory.total, bySlot: inventory.bySlot })}
\`\`\`

## Slot × theme

\`\`\`json
${json(inventory.slotTheme)}
\`\`\`

## Alignment eligibility

Generic fragments plus fragments explicitly tagged for the alignment.

\`\`\`json
${json(inventory.eligibleByAlignment)}
\`\`\`

## Alignment-specific coverage

Only fragments whose \`alignmentIds\` include the alignment.

\`\`\`json
${json(inventory.explicitAlignmentCoverage)}
\`\`\`

## Relationship and context conditions

\`\`\`json
${json(inventory.conditions)}
\`\`\`

## Inferred hook shapes

\`\`\`json
${json(inventory.hookShapes)}
\`\`\`

## Repeated four-word openings for review

\`\`\`json
${json(repeatedOpenings)}
\`\`\`

## Text-overlap clusters for review

The automated test fails only at a high-confidence threshold. This broader list
surfaces possible shared skeletons for editorial review.

\`\`\`json
${json(reviewOverlaps)}
\`\`\`
`
}

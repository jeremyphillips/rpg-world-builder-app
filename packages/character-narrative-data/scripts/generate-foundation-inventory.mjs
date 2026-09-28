import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import {
  buildFoundationInventory,
  findHighTextOverlap,
  findRepeatedOpenings,
} from '../src/collections/foundation-audit.test-support.ts'
import { foundationCollection } from '../src/collections/foundation.ts'

const outputUrl = new URL('../docs/foundation-inventory.generated.md', import.meta.url)
const inventory = buildFoundationInventory(foundationCollection)
const reviewOverlaps = findHighTextOverlap(foundationCollection.fragments, 0.35)
const repeatedOpenings = findRepeatedOpenings(foundationCollection.fragments, 4)

function json(value) {
  return JSON.stringify(value, null, 2)
}

const report = `# Foundation collection inventory

Generated from collection revision \`${foundationCollection.revision}\`. Do not edit
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

## Slot × alignment eligibility

Unrestricted fragments count as eligible for every alignment.

\`\`\`json
${json(inventory.slotAlignment)}
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

await writeFile(fileURLToPath(outputUrl), report)

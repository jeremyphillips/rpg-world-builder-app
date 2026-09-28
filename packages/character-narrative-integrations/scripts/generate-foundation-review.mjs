import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { loadNarrativeCollection } from '@rpg/character-narrative-data'

import { FOUNDATION_COMPOSITION_REVIEW_CASES } from '../src/foundation-composition-review.fixture.ts'
import { renderFoundationCompositionReviewReport } from '../src/foundation-composition-review-report.lib.ts'

const outputUrl = new URL(
  '../../character-narrative-data/docs/foundation-composition-review.generated.md',
  import.meta.url,
)

const collection = await loadNarrativeCollection()

await writeFile(
  fileURLToPath(outputUrl),
  renderFoundationCompositionReviewReport(collection, FOUNDATION_COMPOSITION_REVIEW_CASES),
)

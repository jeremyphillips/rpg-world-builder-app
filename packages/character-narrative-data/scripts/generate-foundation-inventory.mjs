import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { renderFoundationInventoryReport } from '../src/collections/foundation-inventory-report.lib.ts'
import { foundationCollection } from '../src/collections/foundation.ts'

const outputUrl = new URL('../docs/foundation-inventory.generated.md', import.meta.url)

await writeFile(fileURLToPath(outputUrl), renderFoundationInventoryReport(foundationCollection))

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  assertResolvedOwnerIconSizes,
  collectIconGeometryCensus,
  snapshotIconGeometryCensus,
} from '@rpg/config/storybook/icon-geometry-census'
import type { Page } from '@playwright/test'
import type { TestRunnerConfig } from '@storybook/test-runner'

const PARITY_OUTPUT_DIR = join(process.cwd(), '.tmp/control-parity/current')

function sanitizeFileName(id: string) {
  return id.replace(/[^a-zA-Z0-9._-]+/g, '_')
}

async function snapshotControlParity(page: Page, storyId: string) {
  const sample = page.locator('[data-semantic-class-target]').first()
  const target =
    (await sample.count()) > 0 ? sample : page.locator('button, input, select, textarea').first()

  if ((await target.count()) === 0) return

  const styles = await target.evaluate((el) => {
    const computed = getComputedStyle(el)
    const svg = el.querySelector('svg')
    const svgStyle = svg ? getComputedStyle(svg) : null
    return {
      height: computed.height,
      width: computed.width,
      paddingInline: computed.paddingInline,
      paddingBlock: computed.paddingBlock,
      gap: computed.gap,
      fontSize: computed.fontSize,
      lineHeight: computed.lineHeight,
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      borderColor: computed.borderTopColor,
      boxShadow: computed.boxShadow,
      svgWidth: svgStyle?.width ?? null,
      svgHeight: svgStyle?.height ?? null,
    }
  })

  mkdirSync(PARITY_OUTPUT_DIR, { recursive: true })
  writeFileSync(
    join(PARITY_OUTPUT_DIR, `${sanitizeFileName(storyId)}.json`),
    `${JSON.stringify(styles, null, 2)}\n`,
  )
}

const config: TestRunnerConfig = {
  tags: {
    exclude: ['storybook-test-runner-skip', 'phase-7-building-flows'],
  },
  async postVisit(page, context) {
    if (context.hasFailure) return
    const tags: string[] = context.tags ?? []
    if (tags.includes('control-parity')) {
      await snapshotControlParity(page, context.id)
    }
    const census = await collectIconGeometryCensus(page)
    assertResolvedOwnerIconSizes(census)
    snapshotIconGeometryCensus(census)
  },
}

export default config

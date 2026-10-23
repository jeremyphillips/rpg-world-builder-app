import {
  assertResolvedOwnerIconSizes,
  collectIconGeometryCensus,
  snapshotIconGeometryCensus,
} from '@rpg/config/storybook/icon-geometry-census'
import type { TestRunnerConfig } from '@storybook/test-runner'

const config: TestRunnerConfig = {
  tags: {
    exclude: ['storybook-test-runner-skip', 'phase-7-building-flows'],
  },
  async postVisit(page, context) {
    if (context.hasFailure) return
    const census = await collectIconGeometryCensus(page)
    assertResolvedOwnerIconSizes(census)
    snapshotIconGeometryCensus(census)
  },
}

export default config

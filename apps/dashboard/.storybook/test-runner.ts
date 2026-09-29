import type { TestRunnerConfig } from '@storybook/test-runner'

const config: TestRunnerConfig = {
  tags: {
    exclude: ['storybook-test-runner-skip', 'phase-7-building-flows'],
  },
}

export default config

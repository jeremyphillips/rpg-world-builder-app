import { describe, expect, it } from 'vitest'

import {
  SEMANTIC_CONTROL_CSS_REGISTRY,
  validateSemanticControlCssCompleteness,
} from './semantic-control-css-completeness.lib'

describe('semantic control CSS completeness', () => {
  it('validates every registered component sheet', () => {
    const failures = SEMANTIC_CONTROL_CSS_REGISTRY.flatMap((entry) =>
      validateSemanticControlCssCompleteness(entry),
    )
    expect(failures).toEqual([])
  })
})

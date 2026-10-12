import type { Decorator } from '@storybook/react-vite'
import * as React from 'react'

import { SemanticClassCaption } from './semantic-class-caption.client'

/**
 * When `parameters.semanticClasses` is true, wraps the story and shows live
 * `className` readout for the first `[data-semantic-class-target]` descendant.
 */
export const withSemanticClassCaption: Decorator = (Story, context) => {
  if (!context.parameters.semanticClasses) {
    return <Story />
  }

  const targetRef = React.useRef<HTMLElement | null>(null)

  return (
    <div className="space-y-2">
      <div
        ref={(node) => {
          if (!node) {
            targetRef.current = null
            return
          }
          const marked =
            node.querySelector<HTMLElement>('[data-semantic-class-target]') ??
            node.querySelector<HTMLElement>('button, input, select, textarea, a[role="button"]')
          targetRef.current = (marked ?? node.firstElementChild) as HTMLElement | null
        }}
      >
        <Story />
      </div>
      <SemanticClassCaption targetRef={targetRef} />
    </div>
  )
}

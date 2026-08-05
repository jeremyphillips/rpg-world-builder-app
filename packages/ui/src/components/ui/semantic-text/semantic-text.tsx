import * as React from 'react'

import { cn } from '../../../lib/utils'
import {
  semanticTextVariants,
  type SemanticTextEmphasis,
  type SemanticTextTone,
} from './semantic-text.variants'
import { iconGlyphDirectChildClasses } from '../icon-glyph.variants'

export type { SemanticTextEmphasis, SemanticTextTone } from './semantic-text.variants'
export { semanticTextVariants } from './semantic-text.variants'

export type SemanticTextProps = {
  tone?: SemanticTextTone
  emphasis?: SemanticTextEmphasis
  /** Caller supplies the icon node; layout and sizing are standardized via descendant SVG classes. */
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/** Inline semantic copy — always renders a `span`. */
export function SemanticText({ tone, emphasis, icon, children, className }: SemanticTextProps) {
  return (
    <span className={cn(semanticTextVariants({ tone, emphasis }), className)}>
      {icon ? (
        <span
          aria-hidden="true"
          className={cn('shrink-0 leading-none', iconGlyphDirectChildClasses.sm)}
        >
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}

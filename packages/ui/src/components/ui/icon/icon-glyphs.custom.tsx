import type { ReactNode } from 'react'

type CustomGlyphProps = {
  className?: string
  'aria-hidden'?: 'true' | 'false' | boolean
  'data-icon'?: string
}

/** Same root attributes as Lucide's defaultAttributes, with no provider import. */
function defineCustomGlyph(nodes: ReactNode) {
  function CustomGlyph({
    className,
    'aria-hidden': ariaHidden,
    'data-icon': dataIcon,
  }: CustomGlyphProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden={ariaHidden}
        data-icon={dataIcon}
      >
        {nodes}
      </svg>
    )
  }

  return CustomGlyph
}

/** circle-alert's two visible nodes, without the unpainted disc. */
const exclamation = defineCustomGlyph(
  <>
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </>,
)

export const CUSTOM_ICON_GLYPHS = {
  exclamation,
} as const

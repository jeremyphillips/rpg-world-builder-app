import type { HeadingVariantProps } from './heading.variants'

export type HeadingStyleSpec = {
  variant: NonNullable<HeadingVariantProps['variant']>
  utility: string
  level: string
  px: number
  weight: number
  useCase: string
}

/** Static catalog rows for Storybook — update when @theme heading tokens change. */
export const HEADING_STYLE_SPECS: HeadingStyleSpec[] = [
  {
    variant: 'display',
    utility: 'heading-style-display',
    level: 'h1',
    px: 42,
    weight: 700,
    useCase: 'Hero (future) and content detail entity titles',
  },
  {
    variant: 'page',
    utility: 'heading-style-page',
    level: 'h1',
    px: 34,
    weight: 600,
    useCase: 'Route and shell titles (PageHeader)',
  },
  {
    variant: 'section',
    utility: 'heading-style-section',
    level: 'h2',
    px: 28,
    weight: 300,
    useCase: 'Top-level in-page sections',
  },
  {
    variant: 'subsection',
    utility: 'heading-style-subsection',
    level: 'h3',
    px: 19,
    weight: 600,
    useCase: 'Nested blocks within a section',
  },
  {
    variant: 'group',
    utility: 'heading-style-group',
    level: 'h4',
    px: 16,
    weight: 500,
    useCase: 'Headings inside subsections',
  },
  {
    variant: 'card',
    utility: 'heading-style-card',
    level: '—',
    px: 19,
    weight: 600,
    useCase: 'Card and modal titles (chrome)',
  },
  {
    variant: 'alert',
    utility: 'heading-style-alert',
    level: '—',
    px: 16,
    weight: 600,
    useCase: 'Confirm dialog titles',
  },
  {
    variant: 'nav',
    utility: 'heading-style-nav',
    level: '—',
    px: 16,
    weight: 600,
    useCase: 'Topbar navigation title',
  },
  {
    variant: 'brand',
    utility: 'heading-style-brand',
    level: '—',
    px: 16,
    weight: 600,
    useCase: 'Sidebar product name',
  },
  {
    variant: 'label',
    utility: 'heading-style-label',
    level: 'p',
    px: 16,
    weight: 500,
    useCase: 'Inline non-outline titles (trait names)',
  },
]

export const HEADING_DOC_LADDER_SPECS = HEADING_STYLE_SPECS.filter((spec) =>
  ['display', 'page', 'section', 'subsection', 'group'].includes(spec.variant),
)

export const HEADING_CHROME_SPECS = HEADING_STYLE_SPECS.filter(
  (spec) => !HEADING_DOC_LADDER_SPECS.includes(spec),
)

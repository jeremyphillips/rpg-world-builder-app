import type { EyebrowVariantProps } from './eyebrow.variants'

export type EyebrowStyleSpec = {
  size: NonNullable<EyebrowVariantProps['size']>
  utility: string
  px: number
  weight: number
  useCase: string
}

/** Static catalog rows for Storybook — update when @theme eyebrow tokens change. */
export const EYEBROW_STYLE_SPECS: EyebrowStyleSpec[] = [
  {
    size: 'xs',
    utility: 'eyebrow-style-xs',
    px: 9,
    weight: 300,
    useCase: 'Dense preview cards and compact metadata',
  },
  {
    size: 'sm',
    utility: 'eyebrow-style-sm',
    px: 11,
    weight: 300,
    useCase: 'Default nav section labels',
  },
  {
    size: 'md',
    utility: 'eyebrow-style-md',
    px: 13,
    weight: 300,
    useCase: 'Larger eyebrow emphasis',
  },
]

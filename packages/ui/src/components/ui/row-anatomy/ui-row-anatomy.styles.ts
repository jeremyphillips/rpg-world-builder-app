import { rowAnatomyCellClasses, rowAnatomyTracksVariants } from './row-anatomy.variants'

export type RowAnatomyClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

export const ROW_ANATOMY_CLASS_SPECS: readonly RowAnatomyClassSpec[] = [
  {
    key: 'band-control',
    className: rowAnatomyTracksVariants({ band: 'control' }),
    keyValues: '--row-band-height: var(--control-action-compact-height)',
    useCase: 'Default identity band (compact control height)',
  },
  {
    key: 'band-media-xs',
    className: rowAnatomyTracksVariants({ band: 'media-xs' }),
    keyValues: '--row-band-height: calc(var(--spacing) * 8)',
    useCase: 'Band aligned to IdentityFrame xs media',
  },
  {
    key: 'band-media-sm',
    className: rowAnatomyTracksVariants({ band: 'media-sm' }),
    keyValues: '--row-band-height: calc(var(--spacing) * 10)',
    useCase: 'Band aligned to IdentityFrame sm media',
  },
  {
    key: 'cell-band-content',
    className: rowAnatomyCellClasses({ slot: 'band', column: 'content' }),
    keyValues: 'grid-row: band; grid-column: content; align-self: center',
    useCase: 'Heading line in content column',
  },
  {
    key: 'cell-meta-content',
    className: rowAnatomyCellClasses({ slot: 'meta', column: 'content' }),
    keyValues: 'grid-row: meta; margin-block-start: var(--ui-anatomy-row-gap)',
    useCase: 'Description / supporting line',
  },
  {
    key: 'cell-full-trailing',
    className: rowAnatomyCellClasses({ slot: 'full', column: 'trailing' }),
    keyValues: 'grid-row: slack-start / row-end; align-self: center',
    useCase: 'Ghost utility spanning row height',
  },
]

import {
  identityRowClassificationVariants,
  identityRowEntityCompactMetaVariants,
  identityRowHeadingVariants,
  identityRowSupportingVariants,
} from './identity-row.variants'

export type IdentityRowClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

export const IDENTITY_ROW_CLASS_SPECS: readonly IdentityRowClassSpec[] = [
  {
    key: 'title-sm',
    className: identityRowHeadingVariants({ size: 'sm' }),
    keyValues: 'font-size: var(--text-xs)',
    useCase: 'Compact list / search hit title',
  },
  {
    key: 'title-md',
    className: identityRowHeadingVariants({ size: 'md' }),
    keyValues: 'font-size: var(--text-sm)',
    useCase: 'Default row title',
  },
  {
    key: 'title-lg',
    className: identityRowHeadingVariants({ size: 'lg' }),
    keyValues: 'font-size: var(--text-base)',
    useCase: 'Large identity row title',
  },
  {
    key: 'classification-sm',
    className: identityRowClassificationVariants({ size: 'sm' }),
    keyValues: 'font-size: var(--text-xs)',
    useCase: 'Classification beside title (sm)',
  },
  {
    key: 'classification-md',
    className: identityRowClassificationVariants({ size: 'md' }),
    keyValues: 'font-size: var(--text-sm)',
    useCase: 'Classification beside title (md)',
  },
  {
    key: 'supporting-md-truncate',
    className: identityRowSupportingVariants({ size: 'md', wrap: false }),
    keyValues: 'font-size: var(--text-xs); truncate',
    useCase: 'Single-line supporting copy',
  },
  {
    key: 'supporting-md-wrap',
    className: identityRowSupportingVariants({ size: 'md', wrap: true }),
    keyValues: 'font-size: var(--text-xs); line-height: var(--leading-snug)',
    useCase: 'Wrapped supporting copy',
  },
  {
    key: 'meta-entity-compact',
    className: identityRowEntityCompactMetaVariants(),
    keyValues: 'font-size: var(--text-xs)',
    useCase: 'Entity-card title-line metadata wrapper',
  },
]

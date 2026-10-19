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
    key: 'title',
    className: identityRowHeadingVariants(),
    keyValues: 'font-size: var(--ui-copy-title-size, var(--text-base))',
    useCase: 'Primary identity heading. Scale comes from density or the parent surface.',
  },
  {
    key: 'classification',
    className: identityRowClassificationVariants(),
    keyValues: 'font-size: var(--ui-copy-title-size, var(--text-base))',
    useCase: 'Classification beside the title',
  },
  {
    key: 'supporting-truncate',
    className: identityRowSupportingVariants({ wrap: false }),
    keyValues: 'font-size: var(--ui-copy-supporting-size, var(--text-sm)); truncate',
    useCase: 'Single-line supporting copy',
  },
  {
    key: 'supporting-wrap',
    className: identityRowSupportingVariants({ wrap: true }),
    keyValues: 'line-height: var(--leading-snug)',
    useCase: 'Wrapped supporting copy',
  },
  {
    key: 'meta-entity-compact',
    className: identityRowEntityCompactMetaVariants(),
    keyValues: 'classification uses --ui-copy-supporting-size',
    useCase: 'Compact entity title-line classification',
  },
]

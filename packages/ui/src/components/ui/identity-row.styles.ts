import {
  identityRowClassificationVariants,
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
    keyValues: 'ui-copy-title: size, line-height, and --font-weight-heading from copy-scale.css',
    useCase: 'Primary identity heading. Scale comes from density or the parent surface.',
  },
  {
    key: 'classification',
    className: identityRowClassificationVariants(),
    keyValues:
      'font-size: var(--ui-copy-classification-size); line-height: var(--ui-copy-classification-line-height)',
    useCase: 'Classification beside the title on the heading line',
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
]

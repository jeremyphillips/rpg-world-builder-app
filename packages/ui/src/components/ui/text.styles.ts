import type { TextVariant } from './text.variants'

export type TextVariantCategory = 'primary' | 'contextual' | 'treatment' | 'state'

export type TextVariantCatalogRow = {
  variant: TextVariant
  category: TextVariantCategory
  useCase: string
}

/** Documentation metadata for Storybook — not a duplicate of `@utility` CSS tokens. */
export const TEXT_VARIANT_CATALOG: Record<TextVariant, TextVariantCatalogRow> = {
  body: {
    variant: 'body',
    category: 'primary',
    useCase: 'Default paragraph content at inherited size',
  },
  supporting: {
    variant: 'supporting',
    category: 'primary',
    useCase: 'Secondary explanatory copy',
  },
  caption: {
    variant: 'caption',
    category: 'primary',
    useCase: 'Small supplemental metadata',
  },
  label: {
    variant: 'label',
    category: 'primary',
    useCase: 'Compact UI descriptor — not a form field label',
  },
  lead: {
    variant: 'lead',
    category: 'primary',
    useCase: 'Prominent introductory marketing copy',
  },
  option: {
    variant: 'option',
    category: 'contextual',
    useCase: 'Choice row primary line',
  },
  small: {
    variant: 'small',
    category: 'treatment',
    useCase: 'Legacy muted scale — prefer supporting or caption for new copy',
  },
  muted: {
    variant: 'muted',
    category: 'treatment',
    useCase: 'Color-only muted foreground — prefer supporting or caption for new copy',
  },
  emphasis: {
    variant: 'emphasis',
    category: 'treatment',
    useCase: 'Medium-weight emphasis treatment',
  },
  info: {
    variant: 'info',
    category: 'state',
    useCase: 'Informational status copy',
  },
  success: {
    variant: 'success',
    category: 'state',
    useCase: 'Positive status copy',
  },
  warning: {
    variant: 'warning',
    category: 'state',
    useCase: 'Cautionary status copy',
  },
  destructive: {
    variant: 'destructive',
    category: 'state',
    useCase: 'Inline error copy — pair with role="alert" when appropriate',
  },
}

export const TEXT_VARIANT_CATEGORY_ORDER: TextVariantCategory[] = [
  'primary',
  'contextual',
  'treatment',
  'state',
]

export const TEXT_VARIANT_CATEGORY_LABEL: Record<TextVariantCategory, string> = {
  primary: 'Primary content roles',
  contextual: 'Contextual roles',
  treatment: 'Existing treatments (legacy)',
  state: 'Semantic state treatments',
}

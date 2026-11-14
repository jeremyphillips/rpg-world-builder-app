'use client'

import type { RichTextFieldProps } from '../../../components/ui/rich-text-field'
import { lazyFieldComponent } from '../lazy-field.client'

/** Shared lazy binding so the registry and optional disclosure load one rich-text chunk. */
export const LazyRichTextField = lazyFieldComponent<RichTextFieldProps>(
  () => import('../../../components/ui/rich-text-field'),
  'RichTextField',
)

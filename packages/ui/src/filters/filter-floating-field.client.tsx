'use client'

import { useFilterChrome } from './filter-chrome.context'
import { resolveFilterControlSize } from './filter-presentation.lib'
import {
  FloatingLabelField,
  type FloatingLabelFieldProps,
} from '../components/ui/floating-label-field.client'

type FilterFloatingFieldProps = Omit<FloatingLabelFieldProps, 'size'>

/** Maps filter density to floating-label size. It does not own geometry. */
export function FilterFloatingField(props: FilterFloatingFieldProps) {
  const { density } = useFilterChrome()
  return <FloatingLabelField size={resolveFilterControlSize(density)} {...props} />
}

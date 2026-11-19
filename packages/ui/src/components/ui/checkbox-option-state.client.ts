'use client'

import { useState } from 'react'

export function useCheckboxOptionChecked(
  checked: boolean | undefined,
  defaultChecked: boolean,
  onCheckedChange?: (checked: boolean) => void,
) {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked)
  const isChecked = checked ?? uncontrolledChecked

  const handleCheckedChange = (next: boolean | 'indeterminate') => {
    const value = next === true
    if (checked === undefined) setUncontrolledChecked(value)
    onCheckedChange?.(value)
  }

  return { isChecked, handleCheckedChange }
}

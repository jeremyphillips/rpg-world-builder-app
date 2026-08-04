import type * as React from 'react'

interface UseTextSuggestionsFieldParams {
  value: string | undefined
  onValueChange: (value: string | undefined) => void
  onBlur?: () => void
}

export function useTextSuggestionsField({
  value,
  onValueChange,
  onBlur,
}: UseTextSuggestionsFieldParams) {
  const displayValue = value ?? ''
  const trimmedInput = displayValue.trim()

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    onValueChange(nextValue === '' ? undefined : nextValue)
  }

  function handleSuggestionSelect(term: string) {
    onValueChange(term)
  }

  return {
    displayValue,
    trimmedInput,
    handleInputChange,
    handleSuggestionSelect,
    handleInputBlur: onBlur,
  }
}

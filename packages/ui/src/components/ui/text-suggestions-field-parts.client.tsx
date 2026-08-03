'use client'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { optionalFieldDisclosureActionButtonClasses } from './optional-field-disclosure.variants'
import { fieldAnatomyStackClasses } from './field.variants'
import { formatTextSuggestionLabel } from './text-suggestions-field.lib'

const SUGGESTED_LABEL_CLASS = 'text-xs-meta font-medium text-muted-foreground'

interface TextSuggestionsActionsProps {
  suggestions: readonly string[]
  onSelect: (term: string) => void
  disabled?: boolean
}

/** Inline advisory suggestion actions shown beneath an empty text-suggestions field. */
export function TextSuggestionsActions({
  suggestions,
  onSelect,
  disabled = false,
}: TextSuggestionsActionsProps) {
  if (suggestions.length === 0) return null

  return (
    <div className={cn(fieldAnatomyStackClasses, 'gap-1.5')}>
      <span className={SUGGESTED_LABEL_CLASS}>Suggested</span>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {suggestions.map((term) => (
          <Button
            key={term}
            type="button"
            variant="text"
            size="sm"
            disabled={disabled}
            className={cn(optionalFieldDisclosureActionButtonClasses, 'h-auto min-h-0 w-fit')}
            onClick={() => onSelect(term)}
          >
            {formatTextSuggestionLabel(term)}
          </Button>
        ))}
      </div>
    </div>
  )
}

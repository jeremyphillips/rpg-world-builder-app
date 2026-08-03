'use client'

import { cn } from '../../lib/utils'
import { Chip } from './chip.client'
import { ChipGroup } from './chip-group.client'
import { fieldAnatomyStackClasses, fieldChipWrapGapClasses } from './field.variants'
import { formatTextSuggestionLabel } from './text-suggestions-field.lib'

const RECOMMENDED_LABEL_CLASS = 'text-xs-meta font-medium text-muted-foreground'

interface TextSuggestionsActionsProps {
  suggestions: readonly string[]
  onSelect: (term: string) => void
  disabled?: boolean
}

/** Inline advisory suggestion chips shown beneath an empty text-suggestions field. */
export function TextSuggestionsActions({
  suggestions,
  onSelect,
  disabled = false,
}: TextSuggestionsActionsProps) {
  if (suggestions.length === 0) return null

  return (
    <div className={cn(fieldAnatomyStackClasses, 'gap-1.5')}>
      <span className={RECOMMENDED_LABEL_CLASS}>Recommended</span>
      <ChipGroup className={fieldChipWrapGapClasses}>
        {suggestions.map((term) => (
          <Chip
            key={term}
            mode="selectable"
            size="sm"
            selected={false}
            disabled={disabled}
            leadingIcon={null}
            onSelectedChange={(selected) => {
              if (selected) onSelect(term)
            }}
          >
            {formatTextSuggestionLabel(term)}
          </Chip>
        ))}
      </ChipGroup>
    </div>
  )
}

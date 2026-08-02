'use client'

import { Heading, Text, cn } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'

export type GlobalSearchEmptyPromptProps = {
  title?: string
  description?: string
  className?: string
}

export function GlobalSearchEmptyPrompt({
  title = GLOBAL_SEARCH_COPY.emptyQueryTitle,
  description = GLOBAL_SEARCH_COPY.emptyQueryDescription,
  className,
}: GlobalSearchEmptyPromptProps) {
  return (
    <div className={cn('py-10 text-center', className)}>
      <Heading as="h2" variant="subsection">
        {title}
      </Heading>
      <Text as="p" variant="muted" className="mx-auto mt-2 max-w-md text-sm">
        {description}
      </Text>
    </div>
  )
}

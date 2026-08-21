import type { ReactNode } from 'react'
import { Heading } from '@rpg/ui'

import { PageLoadState, type PageLoadStateProps } from '@/components/layout/page/page-load-state'
import { WidePage } from '@/components/layout/page/wide-page'

import { CHARACTER_SHEET_ERROR_LABELS } from '../../lib/detail/character-sheet-error-labels'

export type CharacterSheetDetailShellProps = Pick<
  PageLoadStateProps,
  'isPending' | 'isError' | 'errorLabel'
> & {
  scope: 'standalone' | 'campaign'
  errorBackLink?: {
    href: string
    label: string
  }
  children?: ReactNode
}

/** Presentational loading/error/ready chrome for standalone and campaign PC sheet routes. */
export function CharacterSheetDetailShell({
  scope,
  errorBackLink,
  isPending,
  isError,
  errorLabel,
  children,
}: CharacterSheetDetailShellProps) {
  return (
    <WidePage spacing="relaxed">
      {scope === 'campaign' ? (
        <Heading variant="page" as="h1" className="mb-6">
          Campaign character
        </Heading>
      ) : null}

      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={errorLabel}
        defaultErrorLabel={CHARACTER_SHEET_ERROR_LABELS.loadFailed}
        errorBackLink={errorBackLink}
      >
        {children}
      </PageLoadState>
    </WidePage>
  )
}

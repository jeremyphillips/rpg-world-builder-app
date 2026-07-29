import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heading } from '@rpg/ui'

import { PageLoadState, type PageLoadStateProps } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'

import { CHARACTER_SHEET_ERROR_LABELS } from '../../lib/character-sheet-error-labels'

export type CharacterSheetDetailShellProps = Pick<
  PageLoadStateProps,
  'isPending' | 'isError' | 'errorLabel'
> & {
  scope: 'standalone' | 'campaign'
  campaignBreadcrumb?: {
    href: string
    label: string
  }
  errorBackLink?: {
    href: string
    label: string
  }
  children?: ReactNode
}

/** Presentational loading/error/ready chrome for standalone and campaign PC sheet routes. */
export function CharacterSheetDetailShell({
  scope,
  campaignBreadcrumb,
  errorBackLink,
  isPending,
  isError,
  errorLabel,
  children,
}: CharacterSheetDetailShellProps) {
  return (
    <WidePage spacing="relaxed">
      {scope === 'campaign' && campaignBreadcrumb ? (
        <div className="mb-6 flex flex-col gap-2">
          <Link
            to={campaignBreadcrumb.href}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {campaignBreadcrumb.label}
          </Link>
          <Heading variant="page" as="h1">
            Campaign character
          </Heading>
        </div>
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

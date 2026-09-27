import { Fragment } from 'react'
import { House } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import type { CrumbItem } from '@/app/breadcrumbs'

export type AppBreadcrumbProps = {
  crumbs: CrumbItem[]
}

/** Presentational breadcrumb nav — callers supply pre-resolved crumbs. */
export function AppBreadcrumb({ crumbs }: AppBreadcrumbProps) {
  const { campaignId } = useParams<{ campaignId?: string }>()
  const campaignOverviewHref = campaignId ? ROUTES.campaign.detail(campaignId) : undefined

  if (crumbs.length === 0 && !campaignOverviewHref) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {campaignOverviewHref ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={campaignOverviewHref} aria-label="Campaign overview">
                  <House aria-hidden className="size-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.length > 0 ? <BreadcrumbSeparator /> : null}
          </>
        ) : null}
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem>
                {crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href} aria-current={isLast ? 'page' : undefined}>
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@rpg/ui'

import type { CrumbItem } from '@/app/breadcrumbs'

export type AppBreadcrumbProps = {
  crumbs: CrumbItem[]
}

/** Presentational breadcrumb nav — callers supply pre-resolved crumbs. */
export function AppBreadcrumb({ crumbs }: AppBreadcrumbProps) {
  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
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

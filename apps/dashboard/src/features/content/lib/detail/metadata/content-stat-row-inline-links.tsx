import { Fragment } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

export type ContentStatRowInlineLinkItem = {
  to: LinkProps['to']
  label: string
}

/** Comma-separated in-row links for hero metadata values (neutral, no badge chrome). */
export function ContentStatRowInlineLinks({
  items,
}: {
  items: readonly ContentStatRowInlineLinkItem[]
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <>
      {items.map((item, index) => (
        <Fragment key={String(item.to)}>
          {index > 0 ? ', ' : null}
          <Link
            to={item.to}
            className="text-muted-foreground hover:underline focus-visible:underline"
          >
            {item.label}
          </Link>
        </Fragment>
      ))}
    </>
  )
}

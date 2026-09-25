import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  heroIdentityRowClasses,
  heroMarkShellVariants,
  heroMediaFrameClasses,
  heroMetaStackClasses,
  heroRootClasses,
  heroTitleShellClasses,
} from './hero.variants'

export type HeroMarkPlacement = 'inline' | 'overlap'

export type HeroProps = {
  media?: ReactNode
  mark?: ReactNode
  markPlacement?: HeroMarkPlacement
  title: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  secondary?: ReactNode
  className?: string
}

/** Layout-only page hero — media frame, optional mark, title row, and stacked metadata slots. */
export function Hero({
  media,
  mark,
  markPlacement = 'inline',
  title,
  actions,
  meta,
  secondary,
  className,
}: HeroProps) {
  const resolvedMarkPlacement = media && markPlacement === 'overlap' ? 'overlap' : 'inline'

  return (
    <section className={cn(heroRootClasses, className)}>
      {media ? <div className={heroMediaFrameClasses}>{media}</div> : null}
      {mark ? (
        <div className={heroMarkShellVariants({ placement: resolvedMarkPlacement })}>{mark}</div>
      ) : null}
      <div className={heroIdentityRowClasses}>
        <div className={heroTitleShellClasses}>{title}</div>
        {actions}
      </div>
      {meta || secondary ? (
        <div className={heroMetaStackClasses}>
          {meta}
          {secondary}
        </div>
      ) : null}
    </section>
  )
}

export { heroMarkFrameClasses, heroMarkImageClasses, heroMediaImageClasses } from './hero.variants'

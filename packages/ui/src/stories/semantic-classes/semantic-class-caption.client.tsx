'use client'

import * as React from 'react'

import { splitSemanticClassName } from './split-semantic-class-name.lib'

export type SemanticClassCaptionProps = {
  /** Root element whose `class` attribute is observed (usually the control under test). */
  targetRef: React.RefObject<Element | null>
  className?: string
}

export function SemanticClassCaption({ targetRef, className }: SemanticClassCaptionProps) {
  const [classNameSnapshot, setClassNameSnapshot] = React.useState('')

  React.useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const sync = () => {
      setClassNameSnapshot(target.getAttribute('class') ?? '')
    }

    sync()

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && record.attributeName === 'class') {
          sync()
          return
        }
      }
    })

    observer.observe(target, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [targetRef])

  const { semantic, utilities } = splitSemanticClassName(classNameSnapshot)

  if (semantic.length === 0 && utilities.length === 0) {
    return null
  }

  return (
    <p
      className={className}
      data-testid="semantic-class-caption"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="font-mono text-style-caption">
        {semantic.length > 0 ? semantic.join(' ') : '(no semantic classes)'}
      </span>
      {utilities.length > 0 ? (
        <span className="mt-0.5 block font-mono text-xs text-warning">
          utilities: {utilities.join(' ')}
        </span>
      ) : null}
    </p>
  )
}

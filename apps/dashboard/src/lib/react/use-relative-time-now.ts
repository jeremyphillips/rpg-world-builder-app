import * as React from 'react'

import { useDocumentVisible } from './use-document-visible'

const MS_PER_MINUTE = 60 * 1000

/** Minute-aligned clock for relative message labels; pauses while the document is hidden. */
export function useRelativeTimeNow(): Date {
  const isVisible = useDocumentVisible()
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    if (!isVisible) return

    setNow(new Date())

    let intervalId: number | undefined

    const msUntilNextMinute = () => {
      const current = new Date()
      return MS_PER_MINUTE - (current.getSeconds() * 1000 + current.getMilliseconds())
    }

    const timeoutId = window.setTimeout(() => {
      setNow(new Date())
      intervalId = window.setInterval(() => setNow(new Date()), MS_PER_MINUTE)
    }, msUntilNextMinute())

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [isVisible])

  return now
}

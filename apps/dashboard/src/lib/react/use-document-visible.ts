import * as React from 'react'

export function useDocumentVisible(): boolean {
  const [visible, setVisible] = React.useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'visible',
  )

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return visible
}

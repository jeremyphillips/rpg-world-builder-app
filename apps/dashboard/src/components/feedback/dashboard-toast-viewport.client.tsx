'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { ToastViewport } from '@rpg/ui'

import {
  dashboardToastPortalVariants,
  dashboardToastViewportVariants,
} from './dashboard-toast-viewport.variants'

/** Body-level portal so toast layering is not trapped by app-shell stacking contexts. */
export function DashboardToastViewport() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return createPortal(
    <div className={dashboardToastPortalVariants()}>
      <ToastViewport className={dashboardToastViewportVariants()} />
    </div>,
    document.body,
  )
}

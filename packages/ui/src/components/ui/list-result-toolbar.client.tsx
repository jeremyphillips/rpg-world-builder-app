'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  listResultToolbarFilterRowVariants,
  listResultToolbarSearchRowVariants,
  listResultToolbarVariants,
} from './list-result.variants'

export interface ListResultToolbarProps {
  /** Search control row — hosts own input state and ARIA. */
  search: React.ReactNode
  /** Optional filter row rendered below search — hosts own filter UI and state. */
  filter?: React.ReactNode
  className?: string
}

export function ListResultToolbar({ search, filter, className }: ListResultToolbarProps) {
  return (
    <div className={cn(listResultToolbarVariants(), className)}>
      <div className={listResultToolbarSearchRowVariants()}>{search}</div>
      {filter ? <div className={listResultToolbarFilterRowVariants()}>{filter}</div> : null}
    </div>
  )
}

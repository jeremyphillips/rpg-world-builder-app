'use client'

import * as React from 'react'

import type { FileFieldPropsMap, FileFieldRemotePreview } from './field-config'

const FileFieldPropsContext = React.createContext<FileFieldPropsMap>({})

export function FileFieldPropsProvider({
  value,
  children,
}: {
  value: FileFieldPropsMap
  children: React.ReactNode
}) {
  return <FileFieldPropsContext.Provider value={value}>{children}</FileFieldPropsContext.Provider>
}

export function useFileFieldRemotePreview(fieldName: string): FileFieldRemotePreview | undefined {
  const map = React.useContext(FileFieldPropsContext)
  return map[fieldName]
}

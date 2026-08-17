'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { OrganizationPractice } from '@rpg/contracts'

import { registerOrganizationPracticeRecommendationReader } from './organization-practice-recommendation-reader'

type OrganizationAuthoringContextValue = {
  practiceRecommendations: OrganizationPractice[]
  setPracticeRecommendations: (ids: OrganizationPractice[]) => void
  clearPracticeRecommendations: () => void
}

const OrganizationAuthoringContext = createContext<OrganizationAuthoringContextValue | null>(null)

export function OrganizationAuthoringProvider({ children }: { children: ReactNode }) {
  const [practiceRecommendations, setPracticeRecommendationsState] = useState<
    OrganizationPractice[]
  >([])
  const recommendationsRef = useRef(practiceRecommendations)
  recommendationsRef.current = practiceRecommendations

  useEffect(() => {
    registerOrganizationPracticeRecommendationReader(() => recommendationsRef.current)
    return () => {
      registerOrganizationPracticeRecommendationReader(() => [])
    }
  }, [])

  const value = useMemo(
    () => ({
      practiceRecommendations,
      setPracticeRecommendations: setPracticeRecommendationsState,
      clearPracticeRecommendations: () => setPracticeRecommendationsState([]),
    }),
    [practiceRecommendations],
  )

  return (
    <OrganizationAuthoringContext.Provider value={value}>
      {children}
    </OrganizationAuthoringContext.Provider>
  )
}

export function useOrganizationAuthoringContext(): OrganizationAuthoringContextValue {
  const context = useContext(OrganizationAuthoringContext)
  if (!context) {
    throw new Error(
      'useOrganizationAuthoringContext must be used within OrganizationAuthoringProvider',
    )
  }
  return context
}

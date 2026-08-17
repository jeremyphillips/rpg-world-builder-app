import type { OrganizationPractice } from '@rpg/contracts'

type OrganizationPracticeRecommendationReader = () => readonly OrganizationPractice[]

let readOrganizationPracticeRecommendations: OrganizationPracticeRecommendationReader = () => []

export function registerOrganizationPracticeRecommendationReader(
  reader: OrganizationPracticeRecommendationReader,
): void {
  readOrganizationPracticeRecommendations = reader
}

export function readOrganizationPracticeRecommendationIds(): readonly OrganizationPractice[] {
  return readOrganizationPracticeRecommendations()
}

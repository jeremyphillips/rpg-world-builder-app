import type { NamingRecommendation } from '@rpg/contracts/name-generator'

type FractionalQuotaPart = {
  conventionId: string
  base: number
  remainder: number
}

function allocateTopMatchCounts(
  matches: readonly NamingRecommendation[],
  total: number,
): Record<string, number> {
  const quotas: Record<string, number> = {}

  for (let index = 0; index < total; index += 1) {
    const match = matches[index]
    if (match === undefined) {
      break
    }
    quotas[match.conventionId] = (quotas[match.conventionId] ?? 0) + 1
  }

  return quotas
}

function createMinimumQuotas(matches: readonly NamingRecommendation[]): Record<string, number> {
  const quotas: Record<string, number> = {}
  for (const match of matches) {
    quotas[match.conventionId] = 1
  }
  return quotas
}

function buildFractionalParts(
  matches: readonly NamingRecommendation[],
  remaining: number,
  totalScore: number,
): FractionalQuotaPart[] {
  return matches.map((match) => {
    const exact = (remaining * match.score) / totalScore
    const base = Math.floor(exact)
    return {
      conventionId: match.conventionId,
      base,
      remainder: exact - base,
    }
  })
}

function applyFractionalParts(
  quotas: Record<string, number>,
  fractionalParts: readonly FractionalQuotaPart[],
  remaining: number,
): void {
  for (const part of fractionalParts) {
    quotas[part.conventionId] = (quotas[part.conventionId] ?? 0) + part.base
  }

  const assignedExtra = fractionalParts.reduce((sum, part) => sum + part.base, 0)
  let leftover = remaining - assignedExtra
  const sortedByRemainder = [...fractionalParts].sort(
    (left, right) => right.remainder - left.remainder,
  )

  for (const part of sortedByRemainder) {
    if (leftover <= 0) {
      break
    }
    quotas[part.conventionId] = (quotas[part.conventionId] ?? 0) + 1
    leftover -= 1
  }
}

function allocateWithMinimumOneEach(
  matches: readonly NamingRecommendation[],
  total: number,
): Record<string, number> {
  const quotas = createMinimumQuotas(matches)
  const remaining = total - matches.length

  if (remaining === 0) {
    return quotas
  }

  const totalScore = matches.reduce((sum, match) => sum + match.score, 0)
  applyFractionalParts(quotas, buildFractionalParts(matches, remaining, totalScore), remaining)
  return quotas
}

export function allocateNameCounts(
  matches: readonly NamingRecommendation[],
  total: number,
): Record<string, number> {
  if (matches.length === 0 || total <= 0) {
    return {}
  }

  if (total < matches.length) {
    return allocateTopMatchCounts(matches, total)
  }

  return allocateWithMinimumOneEach(matches, total)
}

export function buildWeightedRoundRobinOrder(
  matches: readonly NamingRecommendation[],
  quotas: Readonly<Record<string, number>>,
): string[] {
  const order = matches.map((match) => match.conventionId)
  const remaining = { ...quotas }
  const sequence: string[] = []
  const total = Object.values(quotas).reduce((sum, count) => sum + count, 0)

  while (sequence.length < total) {
    let progressed = false

    for (const conventionId of order) {
      const count = remaining[conventionId] ?? 0
      if (count <= 0) {
        continue
      }

      sequence.push(conventionId)
      remaining[conventionId] = count - 1
      progressed = true

      if (sequence.length >= total) {
        break
      }
    }

    if (!progressed) {
      break
    }
  }

  return sequence
}

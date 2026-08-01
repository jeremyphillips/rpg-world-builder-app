const NEAR_EXPIRY_DAYS = 7

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayDiff(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / msPerDay)
}

function formatAbsoluteExpiry(date: Date): string {
  const monthDay = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(
    date,
  )
  const includeYear = date.getFullYear() !== new Date().getFullYear()
  if (!includeYear) {
    return `Expires ${monthDay}`
  }

  const year = new Intl.DateTimeFormat(undefined, { year: 'numeric' }).format(date)
  return `Expires ${monthDay}, ${year}`
}

/**
 * Shared invite expiry copy for review surfaces and dashboard cards.
 */
export function resolveCampaignInviteExpiryLabel(
  expiresAt: string,
  now: Date = new Date(),
): string {
  const expiryDate = new Date(expiresAt)
  if (Number.isNaN(expiryDate.getTime())) {
    return 'Expires soon'
  }

  const daysRemaining = dayDiff(now, expiryDate)

  if (daysRemaining <= 0) {
    return 'Expires today'
  }

  if (daysRemaining === 1) {
    return 'Expires tomorrow'
  }

  if (daysRemaining <= NEAR_EXPIRY_DAYS) {
    return `Expires in ${daysRemaining} days`
  }

  return formatAbsoluteExpiry(expiryDate)
}

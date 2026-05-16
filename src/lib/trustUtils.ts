export type TrustTier = 'highly_trusted' | 'normal' | 'low_trust'

export function getTrustTier(trustScore: number | null | undefined): TrustTier {
  if (!trustScore || trustScore === 0) return 'normal'
  if (trustScore >= 4.0) return 'highly_trusted'
  if (trustScore >= 3.0) return 'normal'
  return 'low_trust'
}

export function getTrustLabel(tier: TrustTier): string {
  switch (tier) {
    case 'highly_trusted': return 'Highly Trusted'
    case 'low_trust':      return 'Low Trust'
    default:               return 'Normal'
  }
}

export function getTrustColor(tier: TrustTier) {
  switch (tier) {
    case 'highly_trusted': return { bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.3)', text: 'var(--au-dark)' }
    case 'low_trust':      return { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  text: '#B91C1C' }
    default:               return { bg: 'rgba(4,149,22,0.08)',   border: 'rgba(4,149,22,0.2)',   text: 'var(--g-rich)' }
  }
}

export function canCreateRental(tier: TrustTier, activeRentalCount: number): { allowed: boolean; reason?: string } {
  if (tier === 'low_trust' && activeRentalCount >= 1) {
    return { allowed: false, reason: 'Low trust users can only have 1 active rental at a time. Complete or cancel your current rental first.' }
  }
  return { allowed: true }
}

export function getVisibleAt(tier: TrustTier): string | null {
  if (tier === 'low_trust') {
    return new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
  }
  return null
}
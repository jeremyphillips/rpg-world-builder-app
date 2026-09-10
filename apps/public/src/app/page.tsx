import { LandingCta } from '@/components/landing/landing-cta'
import { LandingFeatures } from '@/components/landing/landing-features'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingHomebrew } from '@/components/landing/landing-homebrew'
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHomebrew />
        <LandingHowItWorks />
        <LandingCta />
      </main>
      <SiteFooter />
    </div>
  )
}

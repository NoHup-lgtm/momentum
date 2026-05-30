import Header from '@/components/Header'
import Hero from '@/components/sections/Hero'
import Problem from '@/components/sections/Problem'
import HowItWorks from '@/components/sections/HowItWorks'
import Features from '@/components/sections/Agents'
import Squads from '@/components/sections/Squads'
import Roadmap from '@/components/sections/Roadmap'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import FinalCTA from '@/components/sections/FinalCTA'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Squads />
        <Roadmap />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  )
}

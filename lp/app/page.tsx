import Header from '@/components/Header'
import Hero from '@/components/sections/Hero'
import Problem from '@/components/sections/Problem'
import HowItWorks from '@/components/sections/HowItWorks'
import Demo from '@/components/sections/Demo'
import Agents from '@/components/sections/Agents'
import Setup from '@/components/sections/Setup'
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
        <Demo />
        <Agents />
        <Setup />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  )
}

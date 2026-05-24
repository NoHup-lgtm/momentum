import Header from '@/components/Header'
import Hero from '@/components/sections/Hero'
import Problem from '@/components/sections/Problem'
import Demo from '@/components/sections/Demo'
import Agents from '@/components/sections/Agents'
import Squads from '@/components/sections/Squads'
import Pricing from '@/components/sections/Pricing'
import FinalCTA from '@/components/sections/FinalCTA'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Demo />
        <Agents />
        <Squads />
        <Pricing />
        <FinalCTA />
      </main>
    </>
  )
}

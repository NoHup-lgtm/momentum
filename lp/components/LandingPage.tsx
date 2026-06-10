import Header from '@/components/Header'
import Hero from '@/components/sections/Hero'
import RankTicker from '@/components/sections/RankTicker'
import FunBlocks from '@/components/sections/FunBlocks'
import HowItWorks from '@/components/sections/HowItWorks'
import Squads from '@/components/sections/Squads'
import Roadmap from '@/components/sections/Roadmap'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import FinalCTA from '@/components/sections/FinalCTA'

// Conteúdo da landing (idioma vem do LangProvider da rota).
// Ordem no playbook Duolingo: hero (1 ação) → faixa de progressão → blocos
// curtos e positivos → como funciona → social → roadmap → preços → faq → CTA.
export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <RankTicker />
        <FunBlocks />
        <HowItWorks />
        <Squads />
        <Roadmap />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  )
}

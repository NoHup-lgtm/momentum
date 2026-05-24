'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/sections/Hero'
import Problem from '@/components/sections/Problem'
import Demo from '@/components/sections/Demo'
import Agents from '@/components/sections/Agents'
import Squads from '@/components/sections/Squads'
import Pricing from '@/components/sections/Pricing'
import FinalCTA from '@/components/sections/FinalCTA'
import ProjectModal from '@/components/Modal'

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const openModal = () => setModalOpen(true)

  return (
    <>
      <Header onCTA={openModal} />
      <main>
        <Hero onCTA={openModal} />
        <Problem />
        <Demo />
        <Agents />
        <Squads />
        <Pricing onCTA={openModal} />
        <FinalCTA onCTA={openModal} />
      </main>
      <ProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

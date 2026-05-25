'use client'

import { useState } from 'react'
import FadeIn from '../FadeIn'

const ITEMS = [
  {
    q: 'Como a ofensiva é verificada?',
    a: 'O app conecta com sua conta GitHub via OAuth e monitora seus eventos de push. Quando você faz um commit em qualquer repositório — público ou privado — o momentum detecta automaticamente. Não tem como fingir: o commit precisa existir no GitHub.',
  },
  {
    q: 'Qualquer commit conta?',
    a: 'Sim, em qualquer repositório em que você seja o autor do commit. Merge de PR alheio não conta. Commits feitos até 1h da manhã ainda valem para o dia anterior — dev noturno é uma realidade.',
  },
  {
    q: 'O que é streak freeze?',
    a: 'Um salva-vidas para dias sem commit — viagem, doença, imprevisto. Ativa antes da meia-noite e sua ofensiva é preservada. Plano grátis tem 1 por mês. Pro tem 3.',
  },
  {
    q: 'Como funciona o sistema de ranks?',
    a: 'A semana começa na segunda e termina no domingo. Seu XP acumulado na semana determina sua posição no ranking da squad. No domingo à noite, os top 3 sobem de rank. Há seis ranks: Init → Build → Deploy → Senior → Architect → Legend.',
  },
  {
    q: 'O que é squad?',
    a: 'Um grupo de amigos ou colegas devs dentro do app. Vocês competem no mesmo leaderboard semanal. Você vê os commits, XP e rank de cada membro em tempo real. Plano grátis suporta squads de até 5 pessoas. Pro é ilimitado.',
  },
  {
    q: 'Como funcionam os cosméticos?',
    a: 'Seu avatar de dev pixel art é personalizável. Itens comuns e raros são comprados com Coins — moeda ganha jogando (streak, top 3, desafios). Itens lendários só desbloqueiam por conquistas reais, não são compráveis. Itens premium usam Gems, compradas com dinheiro real.',
  },
  {
    q: 'Tem anúncios?',
    a: 'No plano grátis, sim — mas só na tela de resultado semanal (domingo à noite). Nunca durante o uso normal do app. O plano Pro remove todos os anúncios.',
  },
  {
    q: 'Quando vai lançar?',
    a: 'Estamos construindo agora. Entre na lista de espera e você será avisado quando a primeira versão estiver disponível para iOS e Android. Sem spam — uma mensagem só.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>perguntas frequentes</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 48px',
            letterSpacing: '-0.01em',
          }}>Tirar dúvidas.</h2>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ITEMS.map((item, i) => (
            <FadeIn key={i} delay={i * 40}>
              <div style={{ borderTop: '1px solid var(--surface-2)' }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none',
                    border: 'none', cursor: 'pointer',
                    padding: '20px 0', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', gap: '20px',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-serif)', fontSize: '16.5px',
                    fontWeight: '400', color: 'var(--text)', lineHeight: '1.4',
                  }}>{item.q}</span>
                  <span style={{
                    color: 'var(--accent)', fontSize: '20px', lineHeight: 1,
                    flexShrink: 0, transition: 'transform 0.2s',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                  }}>+</span>
                </button>

                {open === i && (
                  <p style={{
                    fontSize: '14.5px', color: 'var(--text-2)',
                    lineHeight: '1.7', margin: '0 0 20px',
                    paddingRight: '40px',
                  }}>{item.a}</p>
                )}
              </div>
            </FadeIn>
          ))}
          <div style={{ borderTop: '1px solid var(--surface-2)' }} />
        </div>
      </div>
    </section>
  )
}

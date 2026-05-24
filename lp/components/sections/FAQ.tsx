'use client'

import { useState } from 'react'
import FadeIn from '../FadeIn'

const ITEMS = [
  {
    q: 'Preciso criar uma conta?',
    a: 'Não. O momentum é um app desktop que roda localmente. Sem conta, sem servidor nosso, sem cadastro. Você só precisa de uma chave de API do provedor de IA que você já usa.',
  },
  {
    q: 'Qual modelo de IA é usado?',
    a: 'O que você escolher. O app suporta Anthropic (Claude), OpenAI (GPT-4o) e Google (Gemini). Você traz a sua própria chave — custo zero pra nós, você paga só o que usar no provedor.',
  },
  {
    q: 'Funciona com qualquer linguagem ou framework?',
    a: 'Sim. O momentum trabalha com o projeto como um todo, não com o código linha a linha. Se tem um repositório Git, funciona — Next.js, Django, Flutter, Rust, o que for.',
  },
  {
    q: 'O que é o Agente Re-onboarding?',
    a: 'O agente mais importante. Quando você fica 3 ou mais dias sem abrir o projeto, o Re-onboarding gera um briefing personalizado: onde você parou, o que estava fazendo, qual é o próximo passo concreto. Zera o custo de voltar.',
  },
  {
    q: 'É open source?',
    a: 'Sim. O código está no GitHub. Você pode verificar o que o app faz, contribuir, ou rodar por conta própria sem depender de nós.',
  },
  {
    q: 'Quando vai lançar?',
    a: 'Estamos construindo agora. Entre na lista de espera e avisaremos quando a primeira versão estiver disponível para download. Sem spam — uma mensagem só.',
  },
  {
    q: 'Funciona sem internet?',
    a: 'A maioria das funcionalidades sim. O estado do projeto fica local (arquivo .momentum.json no seu repositório). A IA precisa de conexão quando gera planos ou briefings, mas o dashboard e as tarefas funcionam offline.',
  },
  {
    q: 'O que é o servidor MCP?',
    a: 'MCP (Model Context Protocol) é um padrão aberto para conectar ferramentas à IA do editor. O momentum inclui um servidor MCP que expõe o estado do seu projeto para o Claude Code, Cursor e Windsurf — assim a IA sabe em qual milestone você está sem você precisar explicar.',
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

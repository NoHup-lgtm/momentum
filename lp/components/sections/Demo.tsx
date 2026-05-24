'use client'

import { useState } from 'react'
import FadeIn from '../FadeIn'

const TABS = ['Arquiteto', 'Accountability', 'Re-onboarding'] as const
type Tab = typeof TABS[number]

const DEMOS: Record<Tab, React.ReactNode> = {
  Arquiteto: <ArquitetoDemo />,
  Accountability: <AccountabilityDemo />,
  'Re-onboarding': <ReOnboardingDemo />,
}

export default function DemoSection() {
  const [active, setActive] = useState<Tab>('Arquiteto')

  return (
    <section style={{
      background: 'var(--surface)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: '500',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>na prática</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 10px',
            letterSpacing: '-0.01em',
          }}>Veja os agentes em ação.</h2>
          <p style={{
            fontSize: '16px', color: 'var(--text-2)',
            lineHeight: '1.65', margin: 0, maxWidth: '520px',
          }}>Interações reais, não promessas abstratas.</p>
        </FadeIn>

        {/* Tab bar */}
        <FadeIn delay={80}>
          <div style={{
            display: 'flex', gap: '4px', marginTop: '42px',
            borderBottom: '1px solid var(--surface-2)', paddingBottom: '0',
          }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActive(t)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '10px 18px', background: 'none', border: 'none',
                  cursor: 'pointer',
                  color: active === t ? 'var(--accent)' : 'var(--text-3)',
                  borderBottom: `2px solid ${active === t ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: '-1px',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Demo panel */}
        <FadeIn delay={140}>
          <div style={{
            marginTop: '0',
            background: 'var(--bg)',
            border: '1px solid var(--surface-2)',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
            minHeight: '360px',
          }}>
            {DEMOS[active]}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ── Window chrome ─────────────────────────────────────────────────────────── */
function WindowChrome({ title }: { title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '12px 18px', borderBottom: '1px solid var(--surface-2)',
      background: 'var(--surface)',
    }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {['#3a2820', '#3a2820', '#3a2820'].map((c, i) => (
          <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
        ))}
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        color: 'var(--text-3)', marginLeft: '8px', letterSpacing: '0.05em',
      }}>{title}</span>
    </div>
  )
}

/* ── Arquiteto demo ─────────────────────────────────────────────────────────── */
function ArquitetoDemo() {
  const MILESTONES = [
    { num: '01', title: 'Setup & infraestrutura', days: 7, tasks: ['Criar repo Next.js + Supabase', 'Modelar schema de transações', 'Deploy inicial na Vercel'] },
    { num: '02', title: 'MVP de transações', days: 10, tasks: ['CRUD de receitas e despesas', 'Categorias e filtro por período', 'Tela de listagem'] },
    { num: '03', title: 'Dashboard', days: 8, tasks: ['Resumo mensal com gráfico', 'Comparativo mês anterior', 'Export CSV'] },
    { num: '04', title: 'Auth & lançamento', days: 6, tasks: ['Login com email/senha', 'Testes em dispositivos reais', 'Deploy com domínio próprio'] },
  ]
  return (
    <div>
      <WindowChrome title="momentum — agente arquiteto" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} data-demo-grid="">
        {/* Input */}
        <div style={{
          padding: '22px 24px',
          borderRight: '1px solid var(--surface-2)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'var(--text-3)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: '10px',
          }}>descrição do projeto</div>
          <p style={{
            fontSize: '13.5px', color: 'var(--text-2)',
            lineHeight: '1.7', margin: 0,
            fontStyle: 'italic',
          }}>
            "Quero criar um SaaS de controle financeiro para MEIs. Tenho base em React mas nunca subi nada em produção. Consigo 2h por dia nos fins de semana."
          </p>
          <div style={{
            marginTop: '22px',
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-3)',
          }}>
            <span style={{ color: 'var(--accent)', opacity: 0.7 }}>→</span> 4 milestones · estimativa: 5 semanas
          </div>
        </div>

        {/* Plan output */}
        <div style={{ padding: '22px 24px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'var(--text-3)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: '14px',
          }}>plano gerado</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MILESTONES.map(m => (
              <div key={m.num} style={{
                display: 'grid', gridTemplateColumns: '28px 1fr auto',
                gap: '10px', alignItems: 'start',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--accent)', opacity: 0.6,
                }}>{m.num}</span>
                <div>
                  <div style={{
                    fontSize: '13px', color: 'var(--text)',
                    fontFamily: 'var(--font-serif)', fontWeight: '400',
                    marginBottom: '3px',
                  }}>{m.title}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9.5px',
                    color: 'var(--text-3)',
                  }}>{m.tasks[0]}{m.tasks.length > 1 ? ` +${m.tasks.length - 1}` : ''}</div>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9.5px',
                  color: 'var(--text-3)', whiteSpace: 'nowrap',
                }}>~{m.days}d</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Accountability demo ────────────────────────────────────────────────────── */
function AccountabilityDemo() {
  const [picked, setPicked] = useState<string | null>(null)

  const OPTIONS = [
    { key: 'done', label: '✓ Fiz tudo', reply: 'Ótimo. Qual é o próximo milestone? Quer ajustar a estimativa do restante?' },
    { key: 'partial', label: '~ Fiz parcial', reply: 'Tudo bem. O que ficou pendente? Quando você voltar amanhã, onde começa?' },
    { key: 'none', label: '✗ Não consegui', reply: 'Acontece. Tem algum bloqueio técnico ou foi só falta de tempo? Posso ajudar a desobstruir.' },
    { key: 'help', label: '→ Preciso de ajuda', reply: 'Me conta. O que está travando? Vamos resolver agora ou quebrar em partes menores.' },
  ]

  return (
    <div>
      <WindowChrome title="momentum — check-in diário · 09:14" />
      <div style={{ padding: '24px 28px', maxWidth: '540px' }}>
        {/* Agent message */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'var(--accent)', opacity: 0.7,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px',
          }}>agente accountability</div>
          <p style={{
            fontSize: '14px', color: 'var(--text)',
            lineHeight: '1.65', margin: 0,
          }}>
            Bom dia. <span style={{ color: 'var(--text-2)' }}>MEI Finance — dia 12.</span>
            <br />Como foi ontem com o schema do Supabase?
          </p>
        </div>

        {/* Options */}
        {!picked && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {OPTIONS.map(o => (
              <button
                key={o.key}
                onClick={() => setPicked(o.key)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: 'var(--text-2)', background: 'var(--surface)',
                  border: '1px solid var(--surface-2)', borderRadius: '5px',
                  padding: '8px 14px', cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >{o.label}</button>
            ))}
          </div>
        )}

        {/* Reply */}
        {picked && (
          <div style={{ marginTop: '4px' }}>
            <div style={{
              padding: '10px 14px', background: 'var(--surface)',
              borderRadius: '5px', border: '1px solid var(--surface-2)',
              marginBottom: '16px',
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--text-2)',
            }}>
              {OPTIONS.find(o => o.key === picked)?.label}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              color: 'var(--accent)', opacity: 0.7,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px',
            }}>agente accountability</div>
            <p style={{
              fontSize: '14px', color: 'var(--text)',
              lineHeight: '1.65', margin: '0 0 16px',
            }}>{OPTIONS.find(o => o.key === picked)?.reply}</p>
            <button
              onClick={() => setPicked(null)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '9.5px',
                color: 'var(--text-3)', background: 'none', border: 'none',
                cursor: 'pointer', letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >← tentar outra resposta</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Re-onboarding demo ─────────────────────────────────────────────────────── */
function ReOnboardingDemo() {
  return (
    <div>
      <WindowChrome title="momentum — re-onboarding · 8 dias depois" />
      <div style={{ padding: '24px 28px', maxWidth: '580px' }}>
        {/* Gap indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '22px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-3)', background: 'var(--surface)',
            border: '1px solid var(--surface-2)',
            padding: '4px 10px', borderRadius: '4px',
          }}>última atividade: 8 dias atrás</div>
        </div>

        {/* Briefing */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          color: 'var(--accent)', opacity: 0.7,
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px',
        }}>agente re-onboarding</div>

        <p style={{
          fontSize: '14px', color: 'var(--text)',
          lineHeight: '1.65', margin: '0 0 20px',
        }}>
          Bem-vindo de volta. Veja onde você parou:
        </p>

        <div style={{
          background: 'var(--surface)', borderRadius: '6px',
          border: '1px solid var(--surface-2)',
          padding: '16px 18px', marginBottom: '18px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-3)', marginBottom: '12px',
          }}>último progresso</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[
              { done: true, text: 'Schema de usuários criado no Supabase' },
              { done: true, text: 'Auth com GitHub funcionando em dev' },
              { done: false, text: 'CRUD de transações — estava na metade' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: item.done ? 'var(--success)' : 'var(--accent)',
                  opacity: item.done ? 0.8 : 1, flexShrink: 0, marginTop: '1px',
                }}>{item.done ? '✓' : '→'}</span>
                <span style={{
                  fontSize: '13px',
                  color: item.done ? 'var(--text-3)' : 'var(--text)',
                  textDecoration: item.done ? 'none' : 'none',
                }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{
          fontSize: '13.5px', color: 'var(--text-2)',
          lineHeight: '1.65', margin: '0 0 18px',
        }}>
          <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>próximo passo · </span>
          Terminar a rota <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '12px' }}>POST /api/transactions</code>. Você tinha dito "amanhã faço o endpoint."
        </p>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['Sim, vamos lá', 'Atualizar contexto'].map((label, i) => (
            <button key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: i === 0 ? '#f2e4cf' : 'var(--text-2)',
              background: i === 0 ? 'var(--accent)' : 'var(--surface)',
              border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--surface-2)'}`,
              borderRadius: '5px', padding: '8px 16px', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

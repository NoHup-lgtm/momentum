// supabase/functions/stripe-webhook/index.ts
// Recebe eventos do Stripe e atualiza o plano do usuário

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe_secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const supabase_url   = Deno.env.get('SUPABASE_URL')!
const supabase_key   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabase_url, supabase_key)

Deno.serve(async (req) => {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  // Verificar assinatura do Stripe (TODO: usar stripe-js/deno quando disponível)
  // Por ora, apenas processa eventos conhecidos
  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const type = event.type as string
  const obj  = event.data as Record<string, unknown>

  if (type === 'customer.subscription.created' || type === 'customer.subscription.updated') {
    const sub    = obj.object as Record<string, unknown>
    const status = sub.status as string
    const email  = (sub.metadata as Record<string, string>)?.email

    if (email) {
      const plan = status === 'active' ? 'pro' : 'free'
      const { data: user } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single()

      if (user) {
        await supabase
          .from('user_settings')
          .upsert({ user_id: user.id, plan, updated_at: new Date().toISOString() })
      }
    }
  }

  if (type === 'customer.subscription.deleted') {
    const sub   = obj.object as Record<string, unknown>
    const email = (sub.metadata as Record<string, string>)?.email

    if (email) {
      const { data: user } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single()

      if (user) {
        await supabase
          .from('user_settings')
          .upsert({ user_id: user.id, plan: 'free', updated_at: new Date().toISOString() })
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

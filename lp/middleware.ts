import { NextRequest, NextResponse } from 'next/server'

// Detecta idioma do browser só na raiz: pt-* fica em /, o resto vai pro /en.
export function middleware(req: NextRequest) {
  const acceptLang = req.headers.get('accept-language')?.toLowerCase() ?? ''
  if (!acceptLang.startsWith('pt')) {
    return NextResponse.redirect(new URL('/en', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/',
}

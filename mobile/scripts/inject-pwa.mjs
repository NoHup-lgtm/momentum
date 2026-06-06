// Pós-build do export web: injeta as metatags de PWA no dist/index.html.
// No modo SPA (web.output="single") o expo-router gera um shell padrão e ignora
// app/+html.tsx, então fazemos a injeção aqui (idempotente). Roda depois de
// `expo export --platform web`.
import fs from 'node:fs';

const file = 'dist/index.html';
if (!fs.existsSync(file)) {
  console.error(`[inject-pwa] ${file} não encontrado — rode o export web antes.`);
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');

// 1) viewport "app-like": sem zoom + cobre o notch (safe-area)
html = html.replace(
  /<meta name="viewport"[^>]*\/?>/i,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />',
);

// 2) lang pt-BR
html = html.replace(/<html lang="[^"]*">/i, '<html lang="pt-BR">');

// 3) tags de PWA + iOS standalone (idempotente)
if (!html.includes('rel="manifest"')) {
  const tags = [
    '<link rel="manifest" href="/manifest.json" />',
    '<meta name="theme-color" content="#140e08" />',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
    '<meta name="apple-mobile-web-app-capable" content="yes" />',
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
    '<meta name="apple-mobile-web-app-title" content="momentum" />',
    '<meta name="mobile-web-app-capable" content="yes" />',
    '<style>html,body{background-color:#140e08;}</style>',
  ].join('\n    ');
  html = html.replace('</head>', `  ${tags}\n  </head>`);
}

fs.writeFileSync(file, html);
console.log('[inject-pwa] metatags de PWA injetadas em dist/index.html ✓');

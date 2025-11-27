## Resposta direta
- Sim, é suficiente se o app em `https://budmed.vercel.app/` servir a página do paciente na rota raiz `/` e aceitar o `token` via query (ex.: `https://budmed.vercel.app/?token=...`).
- Se a página estiver em um subcaminho (ex.: `/patient/`), ajuste a env para `https://budmed.vercel.app/patient/`.

## O que verificar
1. Abertura do link: o Edge Function monta `${base}?token=...` (ver `supabase/functions/intake-link/index.ts:71`).
2. Página do paciente: o frontend lê `token` da query do URL (ver `web/patient/app.js:24`).

## Passos de validação
- Executar `POST /appointments/{id}/intake-link` e confirmar que o `patient_link` agora começa com `https://budmed.vercel.app/`.
- Abrir o link e verificar que a tela carrega e valida o `token`.

## Ajustes opcionais
- Alterar o fallback do `base` em `supabase/functions/intake-link/index.ts:23` para `https://budmed.vercel.app/` ou `.../patient/`, evitando divergência quando a env faltar.
- Corrigir retorno quando variáveis de ambiente faltam em `supabase/functions/intake-link/index.ts:39-42` (remover referências a variáveis não definidas).

## Resultado esperado
- `patient_link` apontando para `budmed.vercel.app` abrindo corretamente a página e aceitando o `token`.
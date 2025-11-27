## Objetivo
Atender ao pedido de usar `@supabase/supabase-js` (sem `npm:`) nas Edge Functions usando Deno.

## Alterações Propostas

1. Atualizar `deno.json` adicionando import map inline de Deno:
```json
{
  "compilerOptions": {
    "lib": ["deno.ns", "dom"],
    "types": ["deno.ns"]
  },
  "imports": {
    "@supabase/supabase-js": "npm:@supabase/supabase-js@2.86.0"
  }
}
```
* Mapeia o bare specifier para a origem npm e fixa a versão `2.86.0`.

2. Alterar os imports nas três funções para o bare specifier:
* `supabase/functions/intake-link/index.ts:1`
* `supabase/functions/intake-get/index.ts:1`
* `supabase/functions/intake-response/index.ts:1`

Novo import:
```ts
import { createClient } from '@supabase/supabase-js'
```

3. (Opcional, para silenciar o TypeScript de Node caso o editor não aplique Deno):
* Adicionar `tsconfig.json` com `exclude: ["supabase/functions/**"]` para evitar que o TS padrão marque erro nesses arquivos enquanto o Deno LS cuida deles.

## Validação

* Recarregar a janela do IDE para que o Deno LS e o import map sejam aplicados.
* Confirmar que TS2307 não aparece nos arquivos das funções.
* (Opcional) Executar local com Supabase CLI:
  * `npx supabase functions serve intake-link`
  * `npx supabase functions serve intake-get`
  * `npx supabase functions serve intake-response`

## Observações

* O import map do Deno é a forma correta de usar bare specifiers em Edge Functions.
* Fixar a versão `2.86.0` mantém estabilidade e tipagens consistentes.
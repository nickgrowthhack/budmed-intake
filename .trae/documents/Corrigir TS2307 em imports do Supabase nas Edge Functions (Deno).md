## Causa

* O erro TS2307 aparece porque o TS/VS Code está analisando arquivos de Edge Functions (Deno) com regras de Node, e não reconhece imports via URL (`https://esm.sh/...`).

* Em projetos Supabase Edge (Deno), o padrão é usar `npm:` em vez de `esm.sh`, o que também fornece tipagens automaticamente quando o suporte a Deno está habilitado no editor.

## Solução

* Trocar os imports de `https://esm.sh/@supabase/supabase-js@2` para `npm:@supabase/supabase-js@2` nas funções.

* Adicionar configuração de Deno para tipagens (arquivo `deno.json` com libs/tipos) e habilitar Deno no VS Code para este workspace.

## Alterações Propostas

* Atualizar a linha de import em:

  * `supabase/functions/intake-link/index.ts:1`

  * `supabase/functions/intake-get/index.ts:1`

  * `supabase/functions/intake-response/index.ts:1`

Novo import:

```ts
import { createClient } from 'npm:@supabase/supabase-js@2'
```

* Criar `deno.json` na raiz com:

```json
{
  "compilerOptions": {
    "lib": ["deno.ns", "dom"],
    "types": ["deno.ns"]
  }
}
```

* Habilitar Deno no VS Code para o workspace (via `.vscode/settings.json`):

```json
{
  "deno.enable": true,
  "deno.unstable": true
}
```

## Validação

* Abrir os arquivos e confirmar que o TS/VS Code não apresenta mais TS2307.

* Rodar localmente as funções com o Supabase CLI para garantir que executam:

  * `supabase functions serve intake-link`

  * `supabase functions serve intake-get`

  * `supabase functions serve intake-response`

* Exercitar um fluxo simples (gerar link, buscar respostas, salvar resposta) para confirmar integração com a tabela (`intake_links`, `intake_responses`).

## Observações

* Esta abordagem é a recomendada para Edge Functions em Deno e evita depender de `esm.sh` para resolver tipos.

* Se preferir manter `esm.sh`, seria necessário configurar aquisição de tipos manualmente, o que é mais frágil; por isso a migração para `npm:` é preferível.


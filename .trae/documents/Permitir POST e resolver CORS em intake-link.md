## Observação
- Você já fez o deploy do código atualizado e, mesmo assim, o POST via Postman continua pendente. Vamos focar em diagnóstico no ambiente e ajustes para estabilidade.

## Ações Propostas
1. Instrumentação de logs na função:
   - Adicionar `console.log` antes/depois do upsert para confirmar em qual etapa a execução está.
   - Publicar a função e observar os logs no Dashboard (Edge Functions → Logs) durante a chamada do Postman.
2. Tornar a operação determinística em duas etapas:
   - Trocar `upsert(...).select('token').single()` por:
     - `upsert(..., { onConflict: 'appointment_id' })` sem `.select()`; em seguida
     - `select('token').eq('appointment_id', appointmentId).single()`.
   - Isso evita peculiaridades do retorno do upsert e facilita o diagnóstico.
3. Ajuste fino (compatibilidade):
   - Incluir `POST` em `Access-Control-Allow-Methods` (padronização; não afeta Postman, mas deixa explícito).
4. Verificação dirigida pelo Postman:
   - `POST https://<project-ref>.supabase.co/functions/v1/intake-link/appointments/123` com `authorization` e `apikey`.
   - Esperado: resposta em tempo finito; caso o banco demore, retornar `504 timeout`.

## Resultado
- Com logs e a operação em duas etapas, identificamos rapidamente onde está o gargalo e garantimos resposta curta ao Postman, eliminando o “carregamento infinito”.
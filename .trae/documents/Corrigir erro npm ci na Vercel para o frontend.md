## Validações imediatas
1. Abrir a URL deployada e verificar que carrega sem erros.
2. Ver no DevTools → Network se o arquivo `config.js` é carregado e contém `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PUBLIC_FUNCTION_BASE_URL`, `PUBLIC_INTAKE_BASE_URL` corretos.
3. Testar acesso com token: `.../patient/?token=<TOKEN>`.
4. Confirmar que a tela só exibe o formulário após a validação do token (sem flash antes).

## Teste de fluxo completo
1. Preencher o formulário e enviar.
2. Conferir no Network que a chamada de envio retorna 200/201.
3. Ver a tela de sucesso pós‑envio.
4. Tentar reenviar com o mesmo token e confirmar bloqueio de duplicidade.

## Domínio e ambiente
- Se conectou um domínio próprio (ex.: `intake.budmed.com.br`), alinhar a env `PUBLIC_INTAKE_BASE_URL` com esse domínio e rebuild.
- Confirmar que as chamadas às Edge Functions (base em `PUBLIC_FUNCTION_BASE_URL`) estão sem erros de CORS.

## Observação
- Caso encontre qualquer erro (ex.: 401/403, CORS, token inválido), me envie o console/Network para eu orientar o ajuste específico no frontend.
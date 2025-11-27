## Objetivo
- Evitar qualquer flash do formulário com token inválido e melhorar UX com mensagem de motivo e animação de carregamento durante a validação.

## Alterações
- HTML:
  - Adicionar um contêiner de “gate” acima do formulário com spinner e área de mensagem.
  - Manter o `<form>` oculto por padrão.
- CSS:
  - Criar classes `.spinner` e animação `@keyframes spin`.
  - Adicionar `.gate` para layout do contêiner de mensagem/loader.
  - Incluir uma classe genérica `.hidden` para ocultação.
- JS (`app.js`):
  - No `ensureToken()`, mostrar o contêiner de gate com mensagem “Validando link…” e spinner.
  - Após validação:
    - Token válido e não usado: esconder o gate e exibir o formulário, iniciar em Etapa 1.
    - Token ausente, inválido ou já enviado: manter formulário oculto e exibir mensagem específica no gate:
      - Ausente: “Link inválido ou ausente”
      - Inválido: “Link inválido”
      - Já enviado: “Você já enviou suas respostas”

## Testes
- Sem token → só gate com mensagem; formulário não aparece.
- Token inválido → gate com mensagem; formulário não aparece.
- Token já usado → gate com mensagem de enviado; formulário não aparece.
- Token válido → gate some e formulário aparece sem flash; navegação normal.

## Resultado
- Mensagem clara do motivo do bloqueio e uma animação de loading enquanto valida, com exibição do formulário apenas após confirmação do token.
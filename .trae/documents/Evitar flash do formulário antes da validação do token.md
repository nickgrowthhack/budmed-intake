## Objetivo
- Garantir que o formulário só apareça após a validação do token, evitando a visualização breve antes da checagem.

## Alterações
- HTML: ocultar o `<form id="form">` por padrão com `style="display:none"`.
- JS: após `ensureToken()` retornar verdadeiro, exibir o formulário (`form.style.display = 'block'`) e então executar `showStep(1)`.
- JS: manter oculto quando inválido ou já enviado (não alterar mais nada além de não exibir).

## Testes
- Sem token: formulário não aparece; mensagem de erro exibida.
- Token inválido: formulário não aparece; mensagem de erro exibida.
- Token já usado: formulário não aparece; mensagem de sucesso “Você já enviou suas respostas”.
- Token válido: formulário aparece e navegação de etapas funciona normalmente.

## Resultado
- Sem flash; UX consistente com validação de token antes de qualquer renderização do formulário.
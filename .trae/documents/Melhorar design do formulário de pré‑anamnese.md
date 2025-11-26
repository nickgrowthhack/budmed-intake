## Diagnóstico atual
- O formulário está em `web/patient/index.html` e usa CSS inline (linhas 10–18) com tipografia Inter e um cartão simples.
- Estrutura atual: título (linha 24), `<form id="form">` (linha 25) com múltiplos checkboxes (linhas 27–68), botão submit (linha 69) e área de status (linha 70).
- O JavaScript (`web/patient/app.js:1–5`) espera campos de texto com ids `queixa`, `historico`, `alergias`, que não existem hoje no HTML.
- `config.js` é referenciado (`index.html:19`), mas o arquivo não existe.

## Objetivos de UX/UI
- Tornar o formulário mais legível, escaneável e confortável no mobile e desktop.
- Agrupar claramente as categorias (dor, sono, saúde mental, etc.) com títulos e ajuda contextual.
- Melhorar espaçamentos, hierarquia tipográfica e estados de foco/erro/sucesso.
- Garantir acessibilidade (labels, `fieldset/legend`, `aria-*`, teclabilidade) e responsividade.

## Alterações de marcação (HTML)
- Introduzir `section` para blocos do formulário e usar `fieldset`/`legend` para cada grupo de checkboxes.
- Adicionar os campos de texto compatíveis com o JS: `textarea#queixa`, `textarea#historico`, `textarea#alergias` com labels claros e textos de apoio.
- Reorganizar os checkboxes em listas com classes semânticas (`.options`) mantendo os `name` atuais para não quebrar o envio.
- Manter o `<div id="status">` com `aria-live="polite"` para feedback acessível.

## Estilos (CSS)
- Mover estilos do `<style>` inline para `web/patient/styles.css` e referenciar via `<link>`.
- Definir tokens simples: `--space-2/3/4`, `--radius-2/3`, `--color-*` para cores de borda, fundo e feedback.
- Tipografia: escala baseada em Inter (14/16/20px), peso 600 para títulos, linha confortável.
- Inputs e checkboxes: aumentar área clicável, `min-height: 44px` para labels clicáveis; foco com `outline` bem visível.

## Layout responsivo
- Cartão centralizado com largura máxima `640px` e `padding` adequado.
- Grid para listas longas de checkboxes: 1 coluna no mobile; 2 colunas (`grid-template-columns: 1fr 1fr`) em ≥768px.
- Espaçamentos consistentes entre seções e dentro dos grupos.

## Acessibilidade
- `fieldset`/`legend` para contexto de grupo; garantir associação `label`→`input`.
- `:focus-visible` para todos os controles; contraste suficiente em cores.
- `aria-describedby` em textareas com ajuda contextual quando existir.
- `role="status"` e `aria-live="polite"` para a área de feedback.

## Estados e feedback
- Estados: normal, hover e focus para inputs; erros com borda e texto em `--color-error`.
- Mensagens de envio: "Enviando…", "Respostas enviadas", "Erro de rede" já suportadas em `app.js` — estilizar essas mensagens.

## Compatibilidade com `app.js`
- Incluir `textarea` com ids esperados (`queixa`, `historico`, `alergias`).
- Manter `name` dos checkboxes conforme já usado por `getChecked(...)` em `app.js`.
- Avaliar remoção do `<script src="./config.js">` ou substituição por stub, já que o arquivo inexiste.

## Verificação
- Abrir a página localmente e testar: foco via teclado, leitura de `legend`, seleção em mobile e desktop.
- Testar envio sem `token` (deve mostrar "Token inválido"), e com `token` válido quando disponível.
- Validar contraste e responsividade em tamanhos comuns (320px, 768px, ≥1024px).

## Entregáveis
- `index.html` atualizado com estrutura semântica e campos adicionais.
- `styles.css` com tokens, grid responsivo e estados de foco/erro/sucesso.
- Ajuste opcional de referência a `config.js` (remoção ou stub).

Confirma que seguimos com essa implementação? Se aprovado, preparo os arquivos e aplico as mudanças mantendo compatibilidade com o envio atual.
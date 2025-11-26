## Objetivo
- Introduzir uma segunda etapa no formulário, acessível ao clicar em “Avançar”, com perguntas de Saúde Mental e Emocional, mantendo compatibilidade com o envio atual.

## Estrutura (HTML)
- Envolver o conteúdo em contêiner de etapas: `section.step[data-step="1"]` (etapa atual) e `section.step[data-step="2"]` (nova etapa).
- Etapa 1: mantém intro, pergunta principal e grupos existentes.
- Etapa 2: bloco “Sua Saúde Mental e Emocional” com três grupos usando `fieldset/legend`:
  1) Frequência de ansiedade/tensão nas últimas duas semanas — `name="ansiedade_freq"` com opções: Nenhuma vez, Alguns dias, Mais da metade dos dias, Quase todos os dias.
  2) Frequência de pouco interesse/prazer — `name="anedonia_freq"` com mesmas opções.
  3) Diagnóstico/tratamento para condição psiquiátrica séria — `name="diagnostico_psiquiatrico"` (Não, Não tenho certeza, Outro) + `input/textarea` `name="diagnostico_psiquiatrico_outro"` exibido somente quando “Outro” for selecionado.
- Navegação:
  - Botão `Avançar` ao final da Etapa 1.
  - Botão `Voltar` e `Enviar` na Etapa 2 (Enviar apenas visível na última etapa).
- Acessibilidade: `aria-hidden="true"` em etapas ocultas; `hidden` nativo para esconder; `aria-current="step"` na etapa ativa; rótulos e `legend` descritivos.

## Estilos (CSS)
- Classes: `.step` com espaçamento; `.step.hidden{display:none}`; `.step-nav` para alinhar `Voltar/Avançar/Enviar`.
- Sem alterar o tema atual; foco visível se mantém; responsivo igual aos grupos já implementados.

## Comportamento (JS)
- Estado de etapa atual (`currentStep=1/2`), funções `showStep(n)` para alternar visibilidade e atributos de acessibilidade.
- Lógica para mostrar/ocultar `diagnostico_psiquiatrico_outro` conforme seleção.
- Payload: adicionar campos em `answers` sem remover os atuais:
  - `saude_mental_emocional_freq_ansiedade: value de ansiedade_freq`
  - `saude_mental_emocional_freq_anedonia: value de anedonia_freq`
  - `diagnostico_psiquiatrico: value de diagnostico_psiquiatrico`
  - `diagnostico_psiquiatrico_outro: texto quando “Outro” selecionado, senão vazio`
- Submissão continua igual (endpoint e cabeçalhos), com o `Enviar` apenas na Etapa 2.

## Verificação
- Navegar entre etapas via clique e teclado; confirmar que a Etapa 2 só aparece após “Avançar”.
- Verificar exibição condicional do campo “Outro”.
- Testar envio sem `token` (mensagem de erro) e com `token` válido quando disponível.

## Entregáveis
- Atualizações em `web/patient/index.html` (contêiner de etapas, marcação da Etapa 2, botões de navegação).
- Ajustes em `web/patient/styles.css` (classes `.step`, `.step.hidden`, `.step-nav`).
- Alterações em `web/patient/app.js` (gestão de etapas, coleta dos novos campos e exibição condicional de “Outro”).

Se aprovado, implemento a Etapa 2 e a navegação entre etapas mantendo o restante do fluxo intacto.
## Ajuste de Objetivo
- Estruturar `answers` com todas as perguntas/respostas em ordem, excluindo os três campos iniciais ocultos (Queixa, Histórico, Alergias).

## Estrutura
- `answers.sections`: array ordenado
  - `section`: `{ title, items }`
  - `items`: `{ question, type, answer }` (em ordem de exibição)

## Implementação (Frontend)
1. Criar `buildAnswerBook(form)`:
   - Percorre `.step` na ordem e define `title` por `.question` (quando existir).
   - Para cada `fieldset`:
     - `legend` → `question`
     - Coleta `checkbox` (array) e `radio` (string)
     - Para inputs/textarea com `label[for]` dentro do fieldset (ex.: “Outro”), adiciona item separado somente se houver valor.
   - Ignorar os campos iniciais ocultos.
   - Normalizar textos.
2. No submit, enviar `{"answers": buildAnswerBook(form)}` mantendo validação e tratamento de `409`.

## Testes
- Submeter formulário completo e verificar ordenação das perguntas por seção e itens, com respostas corretas.

## Resultado
- `answers` completo e ordenado, sem incluir os campos ocultos iniciais.
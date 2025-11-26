## Diagnóstico
- O vermelho vem da classe `invalid` aplicada pela validação em `web/patient/app.js:5` e não é removido ao digitar porque só limpamos `invalid` quando `validateStep(n)` roda ao avançar/submit.
- CSS que pinta de vermelho: `web/patient/styles.css:29-31` (borda do `fieldset` e `input/textarea`).

## Objetivo
- Assim que o usuário preencher um campo marcado em vermelho, remover a classe `invalid` do próprio campo e do `fieldset` pai, voltando ao estado normal.

## Implementação
- Editar `web/patient/app.js` mantendo o padrão de delegação já usado nas `addEventListener` em `web/patient/app.js:7-12`.
- Adicionar os seguintes listeners:

```js
document.addEventListener('input', e => {
  const t = e.target;
  if (t && (t.matches('input[type=text]') || t.matches('textarea'))) {
    if (t.value.trim()) {
      t.classList.remove('invalid');
      const fs = t.closest('fieldset');
      if (fs) fs.classList.remove('invalid');
    }
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (!t) return;
  if (t.matches('input[type=radio]')) {
    const fs = t.closest('fieldset');
    if (fs) fs.classList.remove('invalid');
  }
  if (t.matches('input[type=checkbox]')) {
    const fs = t.closest('fieldset');
    if (fs && fs.querySelectorAll('input[type=checkbox]:checked').length > 0) {
      fs.classList.remove('invalid');
    }
  }
});
```

- Opcional: ao começar a corrigir, limpar a mensagem de erro do status para reduzir atrito:

```js
function clearStatus(){
  statusEl.textContent = '';
  statusEl.classList.remove('error');
  statusEl.classList.remove('success');
}
document.addEventListener('input', clearStatus);
document.addEventListener('change', clearStatus);
```

## Verificação
- Reproduzir erro: avançar com campos obrigatórios vazios para ver vermelho.
- Corrigir: digitar/selecionar e verificar que o vermelho sai imediatamente do `input/textarea` e do `fieldset`.
- Navegar: clicar “Avançar” e confirmar que a etapa segue sem bloquear quando tudo está preenchido.

## Escopo
- Cobre textos (`input[type=text]`, `textarea`), rádios e checkboxes dos grupos citados em `web/patient/app.js:5` e `web/patient/styles.css:29-31`.
- Não altera a lógica de `validateStep(n)`; apenas melhora feedback imediato ao usuário.
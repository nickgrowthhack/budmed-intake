## Por que usar Vite
- Dev server rápido com HMR e melhor DX.
- Bundling otimizado, code splitting e cache efetivo para produção.
- Suporte nativo a TypeScript, CSS/SCSS e imports de módulos (ex.: `@supabase/supabase-js`).
- Gestão de variáveis via `import.meta.env` com prefixo `VITE_`.

## Quando faz sentido
- Formulário crescer (componentização, validações complexas, i18n).
- Uso de libs/modularização e TS para tipos das respostas.
- Necessidade de build e otimização de assets.

## Quando manter estático
- Página única simples, sem dependências e com pouca evolução.
- Hosting ultra-simples sem pipeline de build.

## Plano de Implementação
1. Inicializar Vite
- Adicionar `package.json` com scripts: `dev`, `build`, `preview`.
- Adicionar `vite.config.ts` configurando base e assets.

2. Estruturar código
- Mover `web/patient/index.html` para `index.html` na raiz do projeto Vite.
- Criar `src/main.ts` (migrar `app.js`) e `src/styles.css`.
- Atualizar referência de scripts no `index.html` para `src/main.ts`.

3. Variáveis de ambiente
- Criar `.env.example` na raiz com: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PUBLIC_FUNCTION_BASE_URL`, `VITE_PUBLIC_INTAKE_BASE_URL`.
- Documentar que somente chaves públicas vão no Vite; `SERVICE_ROLE_KEY` fica nas Edge Functions.

4. Integração com Supabase
- Instalar `@supabase/supabase-js` e inicializar cliente no `main.ts` com `VITE_*`.
- Submissão de respostas: usar fetch para função HTTP ou RPC futura.

5. Build e Deploy
- `npm run build` gera `dist/` pronto para deploy.
- Publicar `dist/` atrás de CDN; configurar CORS conforme necessário.

6. Documentação
- Atualizar `README.md` com comandos Vite e variáveis `VITE_*`.

## Observações de Segurança
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no Vite.
- Validar tamanho e schema de `answers` no backend; aplicar rate limiting nas funções.
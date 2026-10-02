# Tempo — Controle de Tempo (React + TypeScript)

App de gerenciamento de tempo com telas de **Registros** e **Análise**,
persistência em `localStorage` versionada e camada pronta para PostgreSQL.

## Stack

- React 19 + TypeScript
- Vite
- localStorage (`tempo:*:v2`) com cache em memória

## Desenvolvimento

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Funcionalidades

- Categorias pré-definidas + criação (duplo clique remove customizadas)
- Timer: iniciar / finalizar / reiniciar contagem
- Análise com filtros: dia, período, categoria, status, busca
- Timer ao vivo via `ref` (sem re-render a cada segundo)

## PostgreSQL no futuro

Em `src/lib/config.ts`:

```ts
export const STORAGE_DRIVER = "api";
export const API_BASE_URL = "/api/v1";
```

Implemente REST espelhando `src/lib/storage/api.ts` (`/categories`, `/entries`, `/settings`).

## Práticas Vercel React aplicadas

- `async-parallel` — carga inicial com `Promise.all`
- `client-localstorage-schema` — chaves versionadas `v2`
- `js-cache-storage` — cache Map de localStorage
- `rerender-use-ref-transient-values` — tick do timer via DOM/ref
- `rerender-transitions` / `useDeferredValue` — filtros de análise
- `bundle-dynamic-imports` + preload no hover — chunk da Análise
- `rendering-content-visibility` — listas longas
- imports diretos (sem barrel files de storage)

# Tempo Foco — Cronógrafo pessoal de foco

App de gerenciamento de tempo com telas de **Registros** e **Análise**,
persistência em `localStorage` versionada e camada pronta para PostgreSQL.

## Stack

- React 19 + TypeScript
- Vite
- localStorage (`tempo:*:v2`) com cache em memória
- shadcn/ui + tema One Dark Pro

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
- Timer: iniciar / pausar / continuar contagem
- Análise com filtros: dia, período, categoria, status, busca
- Timer ao vivo via `ref` (sem re-render a cada segundo)

## PostgreSQL no futuro

Em `src/lib/config.ts`:

```ts
export const STORAGE_DRIVER = "api";
export const API_BASE_URL = "/api/v1";
```

Implemente REST espelhando `src/lib/storage/api.ts` (`/categories`, `/entries`, `/settings`).

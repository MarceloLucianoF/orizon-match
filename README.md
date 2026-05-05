# Orizon Match V2

Plataforma inteligente de matchmaking de inovacao.

## Visao do Produto

Orizon Match conecta ideias, capital e execucao com precisao baseada em dados.

Fluxo alvo da V2:
1. Usuario entra e escolhe perfil.
2. Preenche formulario inteligente (wizard).
3. Sistema estrutura dados e calcula score de match.
4. Dashboard mostra recomendacoes ranqueadas com explicacao.

## Stack Tecnica

- React 19
- Vite 8
- TypeScript
- Tailwind CSS v4
- Firebase
- React Hook Form + Zod

## Estado Atual da Migracao

### Fase A - Fundacao (Concluida)

- [x] Projeto Vite + React + TypeScript criado.
- [x] Tailwind CSS v4 configurado no padrao correto.
- [x] Tema v4 com `@theme` em [src/index.css](src/index.css).
- [x] Dark mode com classe no `html` e persistencia em localStorage.
- [x] Tipos globais em [src/types/index.ts](src/types/index.ts).
- [x] Algoritmo de matchmaking em [src/lib/matching.ts](src/lib/matching.ts).
- [x] Validacoes Zod em [src/lib/validation.ts](src/lib/validation.ts).

### Fase B - Componentes Base (Em andamento)

- [x] Navbar migrada para TypeScript + Tailwind em [src/components/Navbar.tsx](src/components/Navbar.tsx).
- [x] Footer migrado para TypeScript + Tailwind em [src/components/Footer.tsx](src/components/Footer.tsx).
- [x] ErrorBoundary migrado para TypeScript em [src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx).
- [x] Design System inicial criado em [src/components/ui/Button.tsx](src/components/ui/Button.tsx), [src/components/ui/Input.tsx](src/components/ui/Input.tsx), [src/components/ui/Card.tsx](src/components/ui/Card.tsx), [src/components/ui/Badge.tsx](src/components/ui/Badge.tsx), [src/components/ui/Stepper.tsx](src/components/ui/Stepper.tsx).
- [x] TaskDetail migrado para TypeScript em [src/components/TaskDetail.tsx](src/components/TaskDetail.tsx).
- [ ] Conectar Navbar com React Router real.
- [ ] Finalizar componentes base (Modal e variantes finais).

### Fase C - Fluxo Inteligente (Nao iniciado)

- [ ] Tela de selecao de perfil (inventor, ict, industria, investidor, juridico).
- [ ] Formulario multi-step com React Hook Form + Zod.
- [ ] Salvamento progressivo de rascunho.

### Fase D - Match Engine no Produto (Nao iniciado)

- [ ] MatchCard com score + explicacao.
- [ ] Dashboard de recomendacoes ranqueadas.
- [ ] Acao "Tenho interesse" e trilha de interacao.

## Estrutura Principal

```
src/
  components/
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
      Badge.tsx
      Stepper.tsx
    Navbar.tsx
    Footer.tsx
    ErrorBoundary.tsx
    TaskDetail.tsx
  lib/
    matching.ts
    validation.ts
  types/
    index.ts
  App.tsx
  index.css
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Convencoes da V2

- Todo componente novo deve nascer em TypeScript.
- Evitar CSS module novo; preferir Tailwind + tokens do tema.
- Toda tela nova deve prever dark mode desde o inicio.
- Reutilizar componentes de [src/components/ui](src/components/ui) para evitar divergencia visual.

## Proximos Passos Imediatos

1. Plugar React Router no layout base e usar `Navbar` com rotas reais.
2. Criar `ProfileSelector` e iniciar wizard de onboarding.
3. Evoluir `MatchCard` para consumir o algoritmo real no dashboard.

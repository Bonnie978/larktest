# Ralph Agent Prompt — Dashboard v2

You are an AI coding agent working on 智造云生产运营管理平台. Your task is to implement the self-service dashboard builder.

## Project Context

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Express + TypeScript (port 3001)
- **Frontend dev server**: port 5173
- **Theme**: 火山引擎风格，主色 #1664FF
- **Implementation plan**: `docs/plans/2026-04-15-dashboard-builder.md` — READ THIS FIRST for detailed code

## Workflow

1. **Read the log** at `ralph/log.md`
2. **Read the plan** at `docs/plans/2026-04-15-dashboard-builder.md` for exact code to write
3. **Find incomplete stories** in `docs/user-stories/dashboard-v2-*.json` for entries with `"passes": false`
4. **Select ONE story** — pick the next logical one based on dependencies:
   - `foundation` stories first (can be done in any order)
   - Then `components` stories (depend on foundation)
   - Then `builder` stories (depend on components)
5. **Implement** following the exact code in the plan
6. **Verify**:
   - `npx tsc --noEmit` (typecheck)
   - `npx vite build` (build)
   - `npx vitest run` (tests, if test files were created)
7. **Update story**: Set `"passes": true`
8. **Log**: Append to `ralph/log.md`

## Key Files Reference

- Types: `src/types/dashboard.ts`
- Data sources: `src/config/dataSources.ts`
- Aggregation: `src/lib/aggregationEngine.ts`
- API: `src/api/index.ts`, `server/src/routes/datasource.ts`
- Grid: `src/components/DashboardGridStack.tsx` (gridstack.js)
- Store: `src/hooks/useDashboardStore.ts`
- Card: `src/components/DashboardCardRenderer.tsx`
- Builder: `src/components/ChartBuilder.tsx`
- Page: `src/pages/Overview.tsx`

## Rules

- ONE story per iteration
- Follow the plan's code exactly — it was designed for this codebase
- Always verify typecheck + build before marking done
- If a story has tests, they must all pass
- Do NOT modify already-passing stories

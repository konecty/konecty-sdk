# Changelog: Comments, Subscriptions, Notifications, Change User, Query, Graph e Pivot

## Resumo

Implementação no KonectyClient dos domínios: comentários (CRUD + searchCommentUsers, searchComments), assinaturas (getSubscriptionStatus, subscribe, unsubscribe), notificações (list, unread-count, mark read, mark all read), change user (add, remove, define, replace, countInactive, removeInactive, setQueue), query (executeQueryJson, executeQuerySql com stream NDJSON; saved queries CRUD + share), graph (getGraph → SVG) e pivot (getPivot → JSON).

## Motivação

Cobrir no SDK as funcionalidades descritas em docs/features-candidatas.md e no plano de implementação, expondo uma única superfície de API via KonectyClient.

## O que mudou

- Novos domínios: comments.ts, subscriptions.ts, notifications.ts, changeUser.ts, query.ts, graph.ts, pivot.ts.
- Novos tipos: types/graph.ts (GraphConfig), types/pivot.ts (PivotConfig). types/query.ts já existia (KpiConfig, KpiResult).
- KonectyClient: dezenas de novos métodos delegando aos domínios.
- package.json: exports para types/graph e types/pivot.
- docs/api.md: tabela de mapeamento e lista de não cobertos atualizadas.
- .cursor/commands/konecty-sdk.md: assinaturas e referências aos novos métodos.

## Impacto técnico e externo

Sem quebra de API. Consumidores passam a dispor de comentários, assinaturas, notificações, change user, query (JSON/SQL e saved), graph e pivot via client.

## Como validar

Executar `yarn build` e `yarn test`. Verificar docs e command.

## Arquivos afetados

- src/sdk/domains/comments.ts, subscriptions.ts, notifications.ts, changeUser.ts, query.ts, graph.ts, pivot.ts (novos)
- src/sdk/types/graph.ts, types/pivot.ts (novos)
- src/sdk/Client.ts, package.json, docs/api.md, .cursor/commands/konecty-sdk.md, docs/changelog (entrada datada)

## Existe migração?

Não.

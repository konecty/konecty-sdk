# CrossModuleQuery builder tipado para executeQueryJson

## Data

2025-03-13

## Resumo

Criado um criador de query (**CrossModuleQueryBuilder** e **CrossModuleRelationBuilder**) totalmente tipado para o body do POST /rest/query/json (executeQueryJson), alinhado ao schema esperado pelo Konecty (CrossModuleQuerySchema). Tipos e classes permitem IntelliSense completo ao montar consultas cross-module.

## Motivação

O método `executeQueryJson(body)` aceitava `Record<string, unknown>`, sem tipagem do body. O CRM espera um objeto CrossModuleQuery (document, filter, fields, sort, limit, start, relations, groupBy, aggregators, includeTotal, includeMeta), com relações recursivas e agregadores bem definidos. Um builder fluente e tipado melhora a DX e reduz erros.

## O que mudou

- **Tipos** em `src/sdk/types/crossModuleQuery.ts`: `CrossModuleQuery`, `CrossModuleRelation`, `CrossModuleAggregator`, `CrossModuleSortItem`, `CrossModuleJoinOn`, `AggregatorName`; constantes `AGGREGATOR_NAMES`, `MAX_RELATIONS`, `MAX_NESTING_DEPTH`, `MAX_RELATION_LIMIT`, `DEFAULT_RELATION_LIMIT`, `DEFAULT_PRIMARY_LIMIT`. Reutilizam `KonFilter` de `types/filter`.
- **CrossModuleQueryBuilder**: classe fluente com `document()`, `filter()`, `fields()`, `sort()`, `limit()`, `start()`, `groupBy()`, `aggregator()`, `includeTotal()`, `includeMeta()`, `relation(rel)` ou `relation(document, lookup, configure?)`, `build()`.
- **CrossModuleRelationBuilder**: classe fluente com `on()`, `filter()`, `fields()`, `sort()`, `limit()`, `start()`, `aggregator()` (obrigatório ao menos um), `relation(rel)`, `addNested(document, lookup, configure?)`, `build()`.
- **Funções de fábrica**: `createCrossModuleQuery(document?)`, `createCrossModuleRelation(document, lookup)`.
- **executeQueryJson**: parâmetro `body` tipado como `CrossModuleQuery` (em Client e domínio query).
- **Exportações**: `CrossModuleQueryBuilder`, tipos e constantes exportados pelo pacote; novo subpath `types/crossModuleQuery` e `CrossModuleQueryBuilder` no package.json.
- **Testes**: `src/__test__/sdk/CrossModuleQueryBuilder.test.ts` com cenários de query mínima, filter/fields/sort, relação via callback, relação pré-construída, relação com on/filter/aggregators, relação aninhada (addNested), validações (document vazio, relação sem agregador).

## Impacto técnico

- Quem já chamava `executeQueryJson(body)` com objeto manual continua funcionando desde que o objeto satisfaça `CrossModuleQuery`; o tipo agora é exigido.
- Novos usos podem usar `createCrossModuleQuery('Document').relation(...).build()` para montar o body com IntelliSense.

## Impacto externo

- Nenhuma breaking change: o formato do body já era o CrossModuleQuery; apenas a tipagem e o builder foram adicionados.

## Como validar

- `npm run build`
- `npm test -- --testPathPattern=CrossModuleQueryBuilder`
- Em um projeto que use o SDK, importar `createCrossModuleQuery` e `CrossModuleQuery` e montar uma query; verificar autocomplete e tipo do argumento de `executeQueryJson`.

## Arquivos afetados

- `src/sdk/types/crossModuleQuery.ts` (novo)
- `src/sdk/CrossModuleQueryBuilder.ts` (novo)
- `src/sdk/Client.ts` (import CrossModuleQuery; executeQueryJson(body: CrossModuleQuery))
- `src/sdk/domains/query.ts` (import CrossModuleQuery; executeQueryJson body tipado)
- `src/index.ts` (export CrossModuleQueryBuilder e types/crossModuleQuery)
- `package.json` (exports e typesVersions para types/crossModuleQuery e CrossModuleQueryBuilder)
- `docs/api.md` (seção "Query JSON (CrossModuleQuery) e builder tipado")
- `.cursor/commands/konecty-sdk.md` (exportações e exemplo do builder)
- `src/__test__/sdk/CrossModuleQueryBuilder.test.ts` (novo)

## Existe migração?

Não. Código existente que passa um objeto literal para `executeQueryJson` deve apenas garantir que o objeto satisfaça a interface `CrossModuleQuery` (o que já era o esperado pelo CRM).

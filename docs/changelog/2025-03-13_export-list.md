# Changelog: Export list

## Resumo

Implementação de exportList no KonectyClient: exportação de listas em CSV, XLSX ou JSON via GET /rest/data/:document/list/:listName/:type.

## Motivação

Expor no SDK o endpoint de exportação do CRM para permitir download de listas em formato arquivo sem chamar a API REST manualmente.

## O que mudou

- Novo domínio `src/sdk/domains/export.ts`: exportList(opts, module, listName, format, params?) com query filter, sort, limit, start, fields, displayName, displayType, withDetailFields.
- KonectyClient: método exportList(module, listName, format, options?) retornando Promise\<ArrayBuffer\>.
- Testes em `src/__test__/api/exportList.test.ts`.
- docs/api.md, docs/usage-advanced.md, .cursor/commands/konecty-sdk.md atualizados.

## Impacto técnico e externo

Sem quebra. Consumidores podem usar client.exportList() para obter bytes do arquivo.

## Como validar

Executar `yarn test src/__test__/api/exportList.test.ts`.

## Arquivos afetados

- src/sdk/domains/export.ts (novo), src/sdk/Client.ts, src/__test__/api/exportList.test.ts (novo), docs e changelog.

## Existe migração?

Não.

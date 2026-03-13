# Changelog: Find Stream e Stream Count

## Resumo

Implementação de findStream e streamCount no KonectyClient: consumo de buscas em streaming (NDJSON) e contagem de registros via endpoints /rest/stream/:document/findStream e /rest/stream/:document/count.

## Motivação

Expor no SDK as operações de stream do CRM para permitir buscas com muitos registros sem carregar tudo em memória, e contagem isolada para paginação e indicadores.

## O que mudou

- Novo utilitário `src/utils/ndjson.ts`: leitura de NDJSON a partir de ReadableStream ou string, com suporte a transform opcional (deserializeDates).
- Utilitário `src/utils/dateSerialization.ts`: serializeDates e deserializeDates extraídos do Client para reuso.
- Novo domínio `src/sdk/domains/stream.ts`: findStream (GET findStream + async generator) e streamCount (GET count).
- KonectyClient: métodos findStream(module, options, includeTotal?) e streamCount(module, params); import de dateSerialization e stream domain.
- Testes em `src/__test__/api/findStream.test.ts`: cenários de sucesso (stream com/sem total), erro 4xx para ambos.
- docs/api.md: tabela atualizada com findStream e streamCount; subseção "Stream (findStream e streamCount)" com parâmetros e caveats; remoção de findStream/count da lista de não cobertos.
- docs/usage-advanced.md: novo documento com uso, limites e boas práticas para stream.
- .cursor/commands/konecty-sdk.md: assinaturas e exemplos para findStream e streamCount.

## Impacto técnico

- Client passa a depender de utils/dateSerialization e sdk/domains/stream. Respostas de findStream são consumidas via async iterator; em ambientes onde response.body não é ReadableStream (ex.: alguns mocks), o domínio usa response.text() como fallback.

## Impacto externo

Consumidores podem usar client.findStream() para iterar grandes conjuntos e client.streamCount() para obter apenas a contagem. Quebra de API: nenhuma.

## Como validar

Executar `yarn test src/__test__/api/findStream.test.ts`. Verificar docs/api.md e .cursor/commands/konecty-sdk.md.

## Arquivos afetados

- src/utils/ndjson.ts (novo)
- src/utils/dateSerialization.ts (novo)
- src/sdk/domains/stream.ts (novo)
- src/sdk/Client.ts (alterado)
- src/__test__/api/findStream.test.ts (novo)
- docs/api.md, docs/usage-advanced.md (novo), .cursor/commands/konecty-sdk.md, docs/changelog/2025-03-13_find-stream-stream-count.md (novo)

## Existe migração?

Não.

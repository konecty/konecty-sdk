# Changelog: Download file e Download image

## Resumo

Implementação de downloadFile e downloadImage no KonectyClient: obtenção do binário de arquivos e imagens via GET /rest/file/... e GET /rest/image/... (com estilo opcional thumb/wm).

## Motivação

Completar o ciclo de arquivos no SDK (já existiam upload e delete via FilesManager); permitir que o consumidor baixe arquivos e imagens (completo, thumbnail ou watermark) sem chamar a API REST manualmente.

## O que mudou

- Novo domínio `src/sdk/domains/fileDownload.ts`: downloadFile (path document/code/fieldName/fileName) e downloadImage (path document/recordId/fieldName/fileName, com style opcional full|thumb|wm).
- KonectyClient: métodos downloadFile(document, recordCode, fieldName, fileName) e downloadImage(document, recordId, fieldName, fileName, style?) retornando Promise\<ArrayBuffer\>.
- Testes em `src/__test__/api/fileDownload.test.ts`: sucesso para file e image (full e thumb), erro 4xx para ambos.
- docs/api.md: tabela e subseção "Download de arquivo e imagem"; lista de não cobertos atualizada.
- docs/usage-advanced.md: seção "Download de arquivo e imagem".
- .cursor/commands/konecty-sdk.md: assinaturas e exemplos.

## Impacto técnico

- Client passa a depender de sdk/domains/fileDownload. Nenhuma alteração em tipos exportados.

## Impacto externo

Consumidores podem usar client.downloadFile() e client.downloadImage() para obter ArrayBuffer. Sem quebra de API.

## Como validar

Executar `yarn test src/__test__/api/fileDownload.test.ts`. Verificar docs e command.

## Arquivos afetados

- src/sdk/domains/fileDownload.ts (novo)
- src/sdk/Client.ts (alterado)
- src/__test__/api/fileDownload.test.ts (novo)
- docs/api.md, docs/usage-advanced.md, .cursor/commands/konecty-sdk.md, docs/changelog/2025-03-13_download-file-image.md (novo)

## Existe migração?

Não.

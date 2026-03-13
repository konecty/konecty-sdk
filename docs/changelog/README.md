# Changelog

O histórico de versões do Konecty SDK está no arquivo [CHANGELOG.md](../../CHANGELOG.md) na raiz do repositório.

## Formato

O changelog é mantido automaticamente pelo **semantic-release** com o plugin de changelog. Cada release agrupa as alterações por tipo:

- **Features**: novas funcionalidades.
- **Fixes**: correções de bugs.
- **Docs**: alterações em documentação.
- **Tests**: adição ou alteração de testes.

As mensagens de commit seguem o **Conventional Commits** (commitlint), o que permite ao semantic-release determinar o tipo de release (major, minor, patch) e gerar as entradas no CHANGELOG.

## Registro de alterações por tarefa

Conforme as regras de documentação do projeto, alterações relevantes podem ser registradas também em arquivos datados nesta pasta, no formato `YYYY-MM-DD_slug.md`, contendo resumo, motivação, o que mudou, impacto técnico e externo, como validar e se há migração. O [CHANGELOG.md](../../CHANGELOG.md) na raiz permanece como fonte principal do histórico de versões publicadas.

### Entradas datadas

- [2025-03-13_documentacao-completa-sdk.md](2025-03-13_documentacao-completa-sdk.md) — Criação da documentação em docs/ e mapeamento SDK ↔ CRM.
- [2025-03-13_find-stream-stream-count.md](2025-03-13_find-stream-stream-count.md) — findStream e streamCount no KonectyClient; utils ndjson e dateSerialization; domínio stream.
- [2025-03-13_download-file-image.md](2025-03-13_download-file-image.md) — downloadFile e downloadImage no KonectyClient; domínio fileDownload.
- [2025-03-13_kpi.md](2025-03-13_kpi.md) — getKpi, KpiConfig e KpiResult; domínio kpi e types/query.
- [2025-03-13_export-list.md](2025-03-13_export-list.md) — exportList no KonectyClient; domínio export.
- [2025-03-13_comments-subscriptions-notifications-changeuser-query-graph-pivot.md](2025-03-13_comments-subscriptions-notifications-changeuser-query-graph-pivot.md) — Comments, Subscriptions, Notifications, Change User, Query (JSON/SQL + Saved), Graph e Pivot no KonectyClient.
- [2025-03-13_cross-module-query-builder-tipado.md](2025-03-13_cross-module-query-builder-tipado.md) — CrossModuleQueryBuilder e CrossModuleRelationBuilder tipados para executeQueryJson; tipos em types/crossModuleQuery.

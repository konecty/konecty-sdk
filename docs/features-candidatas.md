# Features do Konecty candidatas à implementação no SDK

Este documento lista funcionalidades existentes na API do Konecty (repositório em `/Users/leonardog/dev/Konecty/`) que podem ser expostas no SDK Python. Serve como base para triagem e planejamento.

---

## 1. Find Stream

**Endpoint Konecty:** `GET /rest/stream/:document/findStream`

**Query params:** filter, sort, limit, start, fields, displayName, displayType, withDetailFields, **includeTotal** (opcional: `1` ou `true` para retornar total no header).

**Comportamento:** Resposta em **streaming** (body é NDJSON: um objeto JSON por linha, `\n` como separador). Cada linha é um registro. Reduz uso de memória em buscas grandes. Se `includeTotal` for true, o header `X-Total-Count` traz o total de registros.

**Implementação sugerida no SDK:**

-   Novo método no `KonectyClient`: por exemplo `find_stream(module, options: KonectyFindParams, *, include_total: bool = False)`.
-   Fazer GET para `{base_url}/rest/stream/{module}/findStream` com os mesmos query params que o find (filter, sort, limit, start, fields), mais `includeTotal=1` quando solicitado.
-   Tratar resposta como stream: usar `aiohttp` com `response.content.iter_chunked()` ou leitura linha a linha; expor um **async generator** que faz yield de cada registro (parse de cada linha como JSON).
-   Opcionalmente expor o total quando `include_total=True` (ler header `X-Total-Count` após consumir o stream ou no início da resposta, conforme disponibilidade).

**Arquivos de referência no Konecty:** `src/server/routes/rest/stream/streamApi.ts`, `src/imports/data/api/findStream.ts`, `src/imports/data/api/streamTransforms.ts` (ObjectToJsonTransform concatena `\n` após cada objeto).

---

## 2. Stream count

**Endpoint Konecty:** `GET /rest/stream/:document/count`

**Query params:** filter, displayName, displayType, sort, withDetailFields.

**Comportamento:** Retorna `{ success: true, total: number }` com a contagem de registros que atendem ao filtro, sem trazer dados. Útil para paginação ou indicadores.

**Implementação sugerida no SDK:**

-   Método `count_stream(module, filter_params: KonectyFilter, **kwargs)` ou reutilizar/reaproveitar a lógica de count: hoje `count_documents` já usa GET `/rest/data/{module}/find` com limit=1 e lê `total` da resposta; o endpoint `/rest/stream/:document/count` é uma alternativa dedicada. Pode ser um alias ou wrapper que chama esse endpoint e devolve apenas o número.

---

## 3. Export (list CSV/Excel/JSON)

**Endpoint Konecty:** `GET /rest/data/:document/list/:listName/:type`

**Params de path:** document, listName, type (`csv` | `xls` | `xlsx` | `json` — xls é normalizado para xlsx).

**Query params:** filter, sort, fields, displayName, displayType, limit, start.

**Comportamento:** Exportação em lote. Resposta é o **conteúdo do arquivo** (CSV, Excel ou JSON) com headers HTTP apropriados (Content-Disposition etc.). Há limite de registros (threshold do namespace; export “large” pode exigir permissão específica). Resposta 403 em caso de permissão negada; 400 para tipo inválido.

**Implementação sugerida no SDK:**

-   Método `export_list(module, list_name, format: Literal["csv","xlsx","json"], *, filter=None, sort=None, fields=None, start=None, limit=None)`.
-   GET para `{base_url}/rest/data/{module}/list/{list_name}/{type}` com query params. `format` deve ser um dos suportados (csv, xlsx, json).
-   Retornar o corpo da resposta como **bytes** (ou, para JSON, opção de retornar já parseado). O cliente pode salvar em arquivo ou processar em memória. Tratar status 403/400 e repassar erros da API.

---

## 4. Download de arquivo

**Endpoint Konecty:** `GET /rest/file/*` — padrão de path: `:document/:code/:fieldName/:fileName` (ou padrão legado com preview/download/namespace).

**Comportamento:** Download do arquivo armazenado no Konecty. O path efetivo é `document/code/fieldName/fileName`. Autenticação via header Authorization (e possivelmente cookie). O servidor usa FileStorage (fs ou S3) para enviar o arquivo.

**Implementação sugerida no SDK:**

-   Método `download_file(module, record_code, field_name, file_name)` ou `get_file_url(...)`.
-   **Download:** GET `{base_url}/rest/file/{module}/{record_code}/{field_name}/{file_name}` com headers do client; retornar bytes ou um stream de leitura (aiohttp: `response.read()` ou `response.content`). Opcional: salvar direto em path local.
-   **URL:** Alternativa: método que apenas monta a URL de download (e opcionalmente com token em query se o Konecty suportar) para o consumidor abrir em browser ou usar em outro cliente.

**Arquivos de referência:** `src/server/routes/rest/file/download.ts`, `sendFile.ts`.

---

## 5. Download de imagem (full / thumbnail / watermark)

**Endpoint Konecty:** `GET /rest/image/*`

**Padrões de path:**

-   **Arquivo completo:** `:document/:recordId/:fieldName/:fileName`
-   **Com estilo:** `:style/:document/:recordId/:fieldName/:fileName` — style pode ser `full`, `thumb`, `wm` (watermark). thumb e wm mapeiam para subpastas thumbnail/ e watermark/ no storage.

**Comportamento:** Retorna o binário da imagem (ou thumbnail/watermark). Content-Type conforme o arquivo.

**Implementação sugerida no SDK:**

-   Método `download_image(module, record_id, field_name, file_name, *, style: Literal["full","thumb","wm"] | None = None)`.
-   Se style for None ou "full", GET `{base_url}/rest/image/{module}/{record_id}/{field_name}/{file_name}`.
-   Se style for "thumb" ou "wm", GET `{base_url}/rest/image/{style}/{module}/{record_id}/{field_name}/{file_name}`.
-   Retornar bytes (ou stream) e, se útil, content-type quando disponível no response header.

**Arquivos de referência:** `src/server/routes/rest/file/image.ts`.

---

## 6. Graph (gráficos agregados → SVG)

**Endpoint Konecty:** `GET /rest/data/:document/graph`

**Query params:** filter, sort, limit, start, fields, displayName, displayType, withDetailFields, **graphConfig** (obrigatório, JSON), cacheTTL (opcional).

**graphConfig (resumo):** Objeto com tipo do gráfico e eixos/séries. Tipos: `bar`, `line`, `pie`, `scatter`, `histogram`, `timeSeries`. Estrutura inclui:

-   **type:** GraphType.
-   **xAxis / yAxis:** field, label?, format?, bucket? (D/W/M/Q/Y para datas).
-   **series:** array de { field, label?, aggregation?, color?, bucket? }.
-   **categoryField** (ex.: para pie), **aggregation** (count/sum/avg/min/max), **title**, **width**, **height**, **histogram** (binWidth/binCount), **xAxisLimit**, **yAxisLimit**, **limitOrder**, etc.

**Comportamento:** Resposta é **SVG** (`Content-Type: image/svg+xml`). O backend agrega os dados conforme graphConfig e gera o SVG. Há cache (ETag, 304). Erros retornam JSON com success false e errors.

**Implementação sugerida no SDK:**

-   Tipos Pydantic (ou dataclasses) para GraphConfig, GraphAxis, GraphSeries, etc., espelhando `src/imports/types/graph.ts`.
-   Método `get_graph(module, graph_config: GraphConfig, *, filter=None, sort=None, limit=None, start=None)`.
-   GET com graphConfig em query string (JSON). Resposta 200 → body é string SVG. Retornar string (SVG) ou bytes; em caso de erro (4xx/5xx com JSON), levantar KonectyAPIError.
-   Opcional: suportar cache (envio de If-None-Match/ETag e tratamento de 304) em chamadas subsequentes.

**Arquivos de referência:** `src/server/routes/rest/data/dataApi.ts` (rota graph), `src/imports/types/graph.ts`, `src/imports/data/api/graphStream.ts`.

---

## 7. Pivot (tabela dinâmica agregada)

**Endpoint Konecty:** `GET /rest/data/:document/pivot`

**Query params:** filter, sort, limit, start, fields, displayName, displayType, withDetailFields, **pivotConfig** (obrigatório, JSON), cacheTTL (opcional).

**pivotConfig (resumo):** Objeto com:

-   **rows:** array de { field, order?, showSubtotal? } (obrigatório, não vazio).
-   **values:** array de { field, aggregator } (obrigatório, não vazio). aggregator: count, sum, avg, min, max.
-   **columns:** array opcional de { field, order?, format?, aggregator? } (DateBucket para datas).
-   **options:** showRowGrandTotals?, showColGrandTotals?, showSubtotals?.

**Comportamento:** Resposta JSON com estrutura de tabela dinâmica (metadados de linhas/colunas/valores, data como árvore de nós, grandTotals, columnHeaders). Timeout longo (ex.: 10 min). Cache com ETag/304.

**Implementação sugerida no SDK:**

-   Tipos Pydantic para PivotConfig, PivotRow, PivotColumn, PivotValue, etc., conforme `src/imports/types/pivot.ts`.
-   Método `get_pivot(module, pivot_config: PivotConfig, *, filter=None, sort=None, limit=None, start=None)`.
-   GET com pivotConfig em query string. Resposta 200 → JSON (dict/list). Parse e retornar como estrutura tipada ou dict. Tratar 4xx/5xx como erro.

**Arquivos de referência:** `src/server/routes/rest/data/dataApi.ts` (rota pivot), `src/imports/types/pivot.ts`, `src/imports/data/api/pivotStream.ts`.

---

## 8. KPI (agregação única: count, sum, avg, min, max, countDistinct)

**Endpoint Konecty:** `GET /rest/data/:document/kpi`

**Query params:** filter, sort, limit, start, fields, displayName, displayType, withDetailFields, **kpiConfig** (obrigatório, JSON), cacheTTL (opcional).

**kpiConfig:** `{ operation: "count" | "sum" | "avg" | "min" | "max" | "countDistinct", field?: string }`. O campo `field` é obrigatório quando operation é `countDistinct`.

**Comportamento:** Resposta JSON `{ success: true, value: number | null, count?: number }`. value é o resultado da agregação; count pode vir junto. Cache com ETag/304.

**Implementação sugerida no SDK:**

-   Tipo para KpiConfig (operation + field opcional).
-   Método `get_kpi(module, kpi_config: KpiConfig, *, filter=None, sort=None, limit=None, start=None)`.
-   GET com kpiConfig em query. Retornar valor numérico (ou tuple value/count se a API expuser count). Erros → KonectyAPIError.

**Arquivos de referência:** `src/server/routes/rest/data/dataApi.ts` (rota kpi), `src/imports/data/api/kpiStream.ts`.

---

## 9. Saved Queries (consultas salvas)

**Contexto:** O módulo `src/imports/query/` expõe o repositório de consultas salvas (`savedQueriesRepo.ts`); a API REST está em `src/server/routes/rest/query/savedQueryApi.ts`.

**Endpoints Konecty:**

-   **GET** `/rest/query/saved` — Lista consultas salvas do usuário (e compartilhadas com ele). Resposta: `{ success: true, data: SavedQuery[] }`.
-   **GET** `/rest/query/saved/:id` — Obtém uma consulta salva por ID. 404 se não encontrada ou sem permissão.
-   **POST** `/rest/query/saved` — Cria consulta salva. Body: `{ name, description?, query }` (query segue CrossModuleQuerySchema). 201 com `{ success: true, data: SavedQuery }`.
-   **PUT** `/rest/query/saved/:id` — Atualiza (apenas dono). Body: `{ name?, description?, query? }`. 404 se não encontrada ou não autorizado.
-   **DELETE** `/rest/query/saved/:id` — Remove consulta (apenas dono). Resposta `{ success: true }` ou 404.
-   **PATCH** `/rest/query/saved/:id/share` — Atualiza compartilhamento. Body: `{ sharedWith: Array<{ type: "user"|"group", _id, name }>, isPublic?: boolean }`. 404 se não encontrada ou não autorizado.

**Comportamento:** Permissões por dono, isPublic e sharedWith (user/group). O objeto `query` segue o schema de consulta cross-module do Konecty.

**Implementação sugerida no SDK:**

-   Métodos: `list_saved_queries()`, `get_saved_query(id)`, `create_saved_query(name, query, description=None)`, `update_saved_query(id, **kwargs)`, `delete_saved_query(id)`, `share_saved_query(id, shared_with, is_public=None)`.
-   Tipos Pydantic opcionais para SavedQuery e payloads de create/update/share, alinhados a `src/imports/model/SavedQuery.ts` e CrossModuleQuerySchema.
-   Todas as requisições com Authorization. Tratar 401/404/400 e repassar erros.

**Arquivos de referência:** `src/server/routes/rest/query/savedQueryApi.ts`, `src/imports/query/savedQueriesRepo.ts`, `src/imports/model/SavedQuery.ts`.

---

## 10. Subscriptions (inscrição em notificações de registro)

**Endpoint Konecty:** `src/server/routes/rest/subscription/subscriptionApi.ts`

-   **GET** `/rest/subscriptions/:module/:dataId` — Retorna status de inscrição do usuário no registro (subscrito ou não). Resposta típica com success e data indicando se está inscrito.
-   **POST** `/rest/subscriptions/:module/:dataId` — Inscreve o usuário autenticado para receber notificações daquele registro.
-   **DELETE** `/rest/subscriptions/:module/:dataId` — Remove a inscrição do usuário no registro.

**Comportamento:** Usa a coleção NotificationSubscription (userId, module, dataId). Útil para “watch” em registros (ex.: oportunidades, atividades).

**Implementação sugerida no SDK:**

-   Métodos: `get_subscription_status(module, data_id)`, `subscribe(module, data_id)`, `unsubscribe(module, data_id)`.
-   GET/POST/DELETE com path `{base_url}/rest/subscriptions/{module}/{data_id}`. Respostas JSON padrão (success, data/errors).

**Arquivos de referência:** `src/server/routes/rest/subscription/subscriptionApi.ts`, `src/imports/data/subscriptions.ts`.

---

## 11. Notifications (notificações do usuário)

**Endpoint Konecty:** `src/server/routes/rest/notification/notificationApi.ts`

-   **GET** `/rest/notifications` — Lista notificações do usuário. Query: `read` (boolean, opcional), `page`, `limit`. Resposta com lista de notificações (type: mention, reply, watch, status_change; relatedModule, relatedDataId, message, read, \_createdAt, etc.).
-   **GET** `/rest/notifications/unread-count` — Retorna contagem de não lidas. Resposta `{ success: true, data: number }` ou similar.
-   **PUT** `/rest/notifications/:id/read` — Marca uma notificação como lida. 404 se não encontrada.
-   **PUT** `/rest/notifications/read-all` — Marca todas como lidas.
-   **GET** `/rest/notifications/stream` — **SSE (Server-Sent Events):** stream em tempo real de notificações. Content-Type `text/event-stream`; eventos `data: <JSON>`, comentários `: connected` e `: heartbeat`. Requer manter conexão aberta; em ambiente multi-servidor o Konecty pode usar RabbitMQ.
-   **POST** `/rest/notifications/simulate` — Apenas desenvolvimento; em produção retorna 404. Cria notificação e comentário de teste.

**Comportamento:** Notificações têm TTL (ex.: 90 dias), paginação (até 50 por página, default 20). O stream SSE exige tratamento de conexão longa e heartbeat.

**Implementação sugerida no SDK:**

-   Métodos síncronos/async: `list_notifications(read=None, page=None, limit=None)`, `get_unread_count()`, `mark_notification_read(notification_id)`, `mark_all_notifications_read()`.
-   **Stream:** Método opcional `notification_stream()` que abre GET `/rest/notifications/stream` e expõe um async generator de eventos (parse de linhas `data: ...`). Em Python pode usar `aiohttp` com leitura contínua e parsing de SSE; tratar heartbeat e desconexão.
-   Não expor `simulate` no SDK ou marcar como dev-only.

**Arquivos de referência:** `src/server/routes/rest/notification/notificationApi.ts`, `src/imports/data/notifications.ts`.

---

## 12. Change User (alteração de usuários/fila em registros)

**Endpoint Konecty:** `src/server/routes/rest/changeUser/changeUserApi.ts`

Todas as rotas são **POST** em `/rest/changeUser/:document/<action>` com body contendo `ids` (array de identificadores de registros) e, quando aplicável, `data`:

-   **POST** `/rest/changeUser/:document/add` — Adiciona usuários aos registros. Body: `{ ids, data }` (data = usuários a adicionar).
-   **POST** `/rest/changeUser/:document/remove` — Remove usuários dos registros. Body: `{ ids, data }` (data = usuários a remover).
-   **POST** `/rest/changeUser/:document/define` — Define usuários nos registros. Body: `{ ids, data }` (data = usuários).
-   **POST** `/rest/changeUser/:document/replace` — Substitui usuário por outro. Body: `{ ids, data: { from?, to? } }`.
-   **POST** `/rest/changeUser/:document/countInactive` — Conta inativos nos registros. Body: `{ ids }`. Resposta com contagem.
-   **POST** `/rest/changeUser/:document/removeInactive` — Remove usuários inativos dos registros. Body: `{ ids }`.
-   **POST** `/rest/changeUser/:document/setQueue` — Define fila nos registros. Body: `{ ids, data }` (data = configuração de fila).

**Comportamento:** Usado para gestão de _user_ e fila em documentos (ex.: Opportunity, Activity). Respostas JSON padrão (success, data/errors).

**Implementação sugerida no SDK:**

-   Métodos: `change_user_add(module, ids, users)`, `change_user_remove(module, ids, users)`, `change_user_define(module, ids, users)`, `change_user_replace(module, ids, from_user=None, to_user=None)`, `change_user_count_inactive(module, ids)`, `change_user_remove_inactive(module, ids)`, `change_user_set_queue(module, ids, queue)`.
-   Tipos para payloads (ids sempre lista; data conforme ação). Tratar 4xx/5xx como KonectyAPIError.

**Arquivos de referência:** `src/server/routes/rest/changeUser/changeUserApi.ts`, `src/imports/data/changeUser.js`.

---

## 13. Comments (comentários em registros)

**Endpoint Konecty:** `src/server/routes/rest/comment/commentApi.ts`

-   **GET** `/rest/comment/:document/:dataId` — Lista comentários do registro. Resposta com array de comentários (texto, autor, datas, parentId para respostas, etc.).
-   **POST** `/rest/comment/:document/:dataId` — Cria comentário. Body: `{ text, parentId? }`. parentId para resposta a outro comentário. Suporta @mentions no texto; backend gera notificações.
-   **PUT** `/rest/comment/:document/:dataId/:commentId` — Atualiza comentário. Body: `{ text }`. Apenas autor ou permissão equivalente.
-   **DELETE** `/rest/comment/:document/:dataId/:commentId` — Remove comentário (soft delete).
-   **GET** `/rest/comment/:document/:dataId/users/search?q=` — Busca usuários para autocomplete de @mention. Query `q` (string). Retorna lista de usuários (\_id, name, username).
-   **GET** `/rest/comment/:document/:dataId/search` — Busca comentários com filtros. Query: `q`, `authorId`, `startDate`, `endDate`, `page`, `limit`. Resposta paginada.

**Comportamento:** Comentários vinculados a um documento e dataId. Limite de tamanho (ex.: 5000 caracteres); texto sanitizado (XSS). Menções disparam notificações.

**Implementação sugerida no SDK:**

-   Métodos: `get_comments(module, data_id)`, `create_comment(module, data_id, text, parent_id=None)`, `update_comment(module, data_id, comment_id, text)`, `delete_comment(module, data_id, comment_id)`, `search_comment_users(module, data_id, query)`, `search_comments(module, data_id, query=None, author_id=None, start_date=None, end_date=None, page=None, limit=None)`.
-   Tratar 400/404 e erros de validação (ex.: texto vazio ou longo demais).

**Arquivos de referência:** `src/server/routes/rest/comment/commentApi.ts`, `src/imports/data/comments.ts`.

---

## 14. Query customizada (JSON e SQL)

**Contexto:** Além de consultas salvas (CRUD em `/rest/query/saved`), o Konecty expõe **execução direta** de consultas cross-module via **query/json** (body = CrossModuleQuery) e **query/sql** (body = SQL em texto). Ambos retornam NDJSON. Referência: `src/server/routes/rest/query/queryApi.ts`, `src/imports/data/api/crossModuleQuery.ts`, `src/imports/types/crossModuleQuery.ts`, `src/imports/data/api/sqlToRelationsParser.ts`.

**Endpoints Konecty:**

-   **POST** `/rest/query/json` — Executa uma consulta cross-module. Body: objeto **CrossModuleQuery** (document, filter, fields, sort, limit, start, relations, groupBy, aggregators, includeTotal, includeMeta). Resposta: `application/x-ndjson`. Primeira linha pode ser `_meta` (quando includeMeta) com document, relations, warnings, executionTimeMs, total; em seguida uma linha JSON por registro. Header `X-Total-Count` quando includeTotal. Erros: 400/500 com corpo NDJSON contendo linha `_meta: { success: false, errors }`.
-   **POST** `/rest/query/sql` — Executa SQL convertido em consulta cross-module. Body: `{ "sql": string, "includeTotal"?: boolean, "includeMeta"?: boolean }`. O servidor converte SQL em CrossModuleQuery (parser MySQL-like, **apenas SELECT**, comprimento máximo 10_000 caracteres) e executa pelo mesmo motor. Mesmo formato de resposta NDJSON e header X-Total-Count. Em caso de SQL inválido: 400 com `_meta.success: false` e errors (ex.: SqlParseError).

**Schema CrossModuleQuery (resumo):** document (string), filter (KonFilter opcional), fields, sort (string ou array de { property, direction }), limit (1..MAX_RELATION_LIMIT, default 1000), start (default 0), relations (array, max 10), groupBy (array), aggregators (record), includeTotal (default true), includeMeta (default false). Cada **relation**: document, lookup, on (left/right opcional), filter, fields, sort, limit, start, **aggregators** (obrigatório, pelo menos um), relations (aninhadas, max 10, profundidade max 2). Constantes: MAX_RELATIONS=10, MAX_NESTING_DEPTH=2, MAX_RELATION_LIMIT=100_000.

**Implementação sugerida no SDK:**

-   Métodos no mesmo módulo de query (junto com Saved Queries): `execute_query_json(body: CrossModuleQuery)` e `execute_query_sql(sql: str, *, include_total: bool = True, include_meta: bool = False)`.
-   Retorno: objeto com `.stream` (async generator de dicts por registro), `.total` (int | None quando includeTotal), `.meta` (dict | None quando includeMeta). Consumir NDJSON linha a linha; primeira linha \_meta não deve ser yieldada como registro.
-   Tipos em `lib/types/cross_module_query.py`: CrossModuleQuery, CrossModuleRelation, Aggregator (espelhar `crossModuleQuery.ts`). Para SQL, payload mínimo: sql + includeTotal + includeMeta.

**Documentação obrigatória (robusta):**

-   **docs/api.md:** Subseção dedicada com endpoints, schema completo do body JSON (CrossModuleQuery e relations), schema do body SQL, formato da resposta NDJSON (\_meta opcional + linhas de registro), header X-Total-Count, formato de erro. Sem trechos de código nos .md.
-   **docs/usage (ou api):** Quando usar JSON vs SQL; limites (MAX_RELATIONS, MAX_NESTING_DEPTH, MAX_RELATION_LIMIT, comprimento SQL); dialeto SQL (SELECT only, MySQL-like); permissões por documento; consumo do stream e leitura de total/meta; caveats (timeout, não reutilizar generator).
-   **Skill:** Exemplos de código para execute_query_json (com CrossModuleQuery mínimo e com relations) e execute_query_sql; como obter total/meta e iterar; erros de parse SQL e limites.

**Arquivos de referência:** `src/server/routes/rest/query/queryApi.ts`, `src/imports/data/api/crossModuleQuery.ts`, `src/imports/types/crossModuleQuery.ts`, `src/imports/data/api/sqlToRelationsParser.ts`.

---

## Resumo para triagem

| Feature                      | Endpoint / rota                                        | Resposta      | Complexidade no SDK                                            |
| ---------------------------- | ------------------------------------------------------ | ------------- | -------------------------------------------------------------- |
| Find Stream                  | GET /rest/stream/:document/findStream                  | NDJSON stream | Média (async generator + parse por linha)                      |
| Stream count                 | GET /rest/stream/:document/count                       | JSON          | Baixa                                                          |
| Export                       | GET /rest/data/:document/list/:listName/:type          | CSV/XLSX/JSON | Baixa (bytes + query)                                          |
| Download file                | GET /rest/file/:document/:code/:field/:fileName        | Binary        | Baixa                                                          |
| Download image               | GET /rest/image/[...]                                  | Binary        | Baixa                                                          |
| Graph                        | GET /rest/data/:document/graph                         | SVG           | Média (tipos GraphConfig + GET)                                |
| Pivot                        | GET /rest/data/:document/pivot                         | JSON          | Média (tipos PivotConfig + GET)                                |
| KPI                          | GET /rest/data/:document/kpi                           | JSON          | Baixa (KpiConfig + GET)                                        |
| Query customizada (JSON/SQL) | POST /rest/query/json, POST /rest/query/sql            | NDJSON stream | Média–Alta (CrossModuleQuery, NDJSON, total/meta; doc robusta) |
| Saved Queries                | GET/POST/PUT/DELETE/PATCH /rest/query/saved[/:id]      | JSON          | Média (tipos SavedQuery + CrossModuleQuery)                    |
| Subscriptions                | GET/POST/DELETE /rest/subscriptions/:module/:dataId    | JSON          | Baixa                                                          |
| Notifications                | GET/PUT /rest/notifications[*], GET stream             | JSON / SSE    | Média (list/count/read; stream SSE opcional)                   |
| Change User                  | POST /rest/changeUser/:document/{add,remove,...}       | JSON          | Média (várias ações e payloads)                                |
| Comments                     | GET/POST/PUT/DELETE /rest/comment/:document/:dataId[*] | JSON          | Média (CRUD + search + users/search)                           |

Ordem sugerida para implementação (por valor e dependências): **Find Stream** (alto valor, já solicitado) → **Download file / Download image** (complementam upload) → **KPI** (simples, agregação útil) → **Export** → **Stream count** → **Comments** (colaboração em registros) → **Subscriptions** (watch em registros) → **Notifications** (listagem e leitura; stream SSE opcional) → **Change User** (gestão de usuários/fila) → **Query customizada (query/json + query/sql)** e **Saved Queries** (mesmo módulo query; documentação robusta para custom) → **Graph** (tipos mais ricos) → **Pivot** (tipos e contrato mais complexos).

Após implementar qualquer item, atualizar `docs/api.md` e a skill do agente em `.cursor/skills/konecty-sdk-python/` conforme a política de documentação do projeto.

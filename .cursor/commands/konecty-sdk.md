# Konecty SDK — Documentação e uso

Ao acionar este comando, use o conteúdo abaixo como referência completa para ajudar com **@konecty/sdk** (cliente da API REST do CRM Konecty). Inclua esta documentação no contexto ao responder: funcionalidades, módulos exportados, assinaturas, exemplos de uso e mapeamento para os endpoints do CRM. Projetos que usam o SDK podem copiar este arquivo para o próprio `.cursor/commands/` para ter o comando `/konecty-sdk` disponível. Documentação detalhada em `docs/` (api.md, integrations.md, development.md, FilesManager.md).

## 1. Exportações e imports

- **Cliente e tipos de retorno**: `KonectyClient`, `KonectyClientOptions`, `KonectyFindParams`, `KonectyFindResult`, `KonectyGetMetaResult`, `KonectyLoginResult`, `KonectyUserInfo`, `KonectyNextOnQueueResult`, `History` de `@konecty/sdk/Client`.
- **Módulo genérico**: `Module`, `KonectyModule`, `ModuleConfig`, `KonectyDocument`, `Operator`, `Condition`, `ModuleFilter`, `ModuleFindAllOptions`, `ModuleActionResult`, `FindResult`, `ValidateResult` de `@konecty/sdk/Module`.
- **Módulos prontos**: `User`, `UserModule`, `Role`, `RoleModule`, `Group`, `GroupModule` de `@konecty/sdk/User`, `@konecty/sdk/Role`, `@konecty/sdk/Group`.
- **Arquivos**: `FilesManager` de `@konecty/sdk/FilesManager`; tipos em `@konecty/sdk/types/files`, `@konecty/sdk/types/konectyReturn`.
- **Operadores de filtro**: `FieldOperators` de `@konecty/sdk/FieldOperators`.
- **Tipos**: `@konecty/sdk/types`, `@konecty/sdk/types/metadata`, `@konecty/sdk/types/access`, `@konecty/sdk/types/filter`, `@konecty/sdk/types/crossModuleQuery` (CrossModuleQuery, CrossModuleRelation, CrossModuleAggregator, AggregatorName, etc.).
- **Query JSON (tipado)**: `createCrossModuleQuery`, `createCrossModuleRelation`, `CrossModuleQueryBuilder`, `CrossModuleRelationBuilder` de `@konecty/sdk/CrossModuleQueryBuilder` ou `@konecty/sdk`.

## 2. Configuração do cliente

Sempre definir `endpoint` (base URL do CRM). Para chamadas autenticadas, definir `accessKey` (token) ou obter via `login`. Opcional: `fileManager.providerUrl` e `fileManager.origin` para FilesManager.

Exemplo (baseado em testes do SDK em `src/__test__/api/KonectyClient.test.ts`):

```ts
const options: KonectyClientOptions = {
  endpoint: 'http://localhost:3000',
  accessKey: 'your-token',
};
const client = new KonectyClient(options);
```

Defaults globais: `KonectyClient.defaults.endpoint` e `KonectyClient.defaults.accessKey` (usado por módulos quando não se passa opções no construtor).

## 3. KonectyClient — métodos e endpoints CRM

- **find(module, options)** → GET /rest/data/:document/find. options: filter, start, limit, sort, fields. Retorno: KonectyFindResult com data e total. Datas são deserializadas para Date.
- **create(module, data)** → POST /rest/data/:document. Body: documento (objeto). Retorno: KonectyFindResult.
- **update(module, data, ids)** → PUT /rest/data/:document. Body: { ids, data }. ids: array de { _id, _updatedAt }.
- **delete(module, ids)** → DELETE /rest/data/:document. Body: { ids }.
- **getHistory(module, _id)** → GET /rest/data/:document/:dataId/history.
- **login(user, password, extraData?)** → POST /rest/auth/login. Em sucesso preenche accessKey e no browser pode setar cookie _authTokenId.
- **logout()** → GET /rest/auth/logout.
- **info(token?, disableSetCookie?)** → GET /rest/auth/info. Valida sessão; token opcional (senão usa cookie no browser).
- **getMenu(menu?)** → GET /api/menu/:menu (default 'main'; pode 'user', 'admin').
- **getListView(module, id?)** → GET /api/list-view/:document/:id (default 'Default').
- **getDocumentNew(name)** → GET /api/document/:name.
- **getForm(module, id?)** → GET /api/form/:document/:id (default 'Default').
- **getMetasByDocument(document)** → GET /api/metas/:document.
- **lookup(module, field, search, options?)** → GET /rest/data/:document/lookup/:field. options: filter, start, limit.
- **getDocuments()** → GET /rest/menu/documents.
- **getDocument(name)** → GET /rest/menu/documents/:name.
- **getNextOnQueue(queueId)** → GET /rest/data/Queue/queue/next/:queueId.
- **getAddressByZipCode(zipCode)** → GET /rest/dne/cep/:cep.
- **getAccesses(document)**, **getAccess(document, accessName)**, **updateAccess(document, accessName, payload)** → GET/PUT /rest/access/:document.
- **findStream(module, options, includeTotal?)** → GET /rest/stream/:document/findStream. Retorna `Promise<{ stream: AsyncGenerator<T>, total?: number }>`. Resposta NDJSON; iterar com `for await (const record of result.stream)`.
- **streamCount(module, params)** → GET /rest/stream/:document/count. Retorna `Promise<{ success: boolean, total: number }>`.

Exemplo findStream:

```ts
const { stream, total } = await client.findStream('Product', { filter: { match: 'and', conditions: [] } }, true);
for await (const record of stream) { console.log(record); }
// total disponível quando includeTotal === true
```

Exemplo streamCount:

```ts
const { total } = await client.streamCount('Product', { filter: { match: 'and', conditions: [] } });
```

- **downloadFile(document, recordCode, fieldName, fileName)** → GET /rest/file/... Retorna `Promise<ArrayBuffer>`.
- **downloadImage(document, recordId, fieldName, fileName, style?)** → GET /rest/image/... ou /rest/image/:style/... (style: 'full' | 'thumb' | 'wm'). Retorna `Promise<ArrayBuffer>`.

Exemplo download:

```ts
const bytes = await client.downloadFile('Product', 'CODE1', 'attachments', 'doc.pdf');
const imageBytes = await client.downloadImage('User', 'userId', 'avatar', 'photo.jpg', 'thumb');
```

- **getKpi(module, kpiConfig, params?)** → GET /rest/data/:document/kpi. kpiConfig: `KpiConfig` (operation: count|sum|avg|min|max|countDistinct, field?). Retorna `Promise<KpiResult>` com value e count.

Exemplo KPI:

```ts
const { value, count } = await client.getKpi('Product', { operation: 'count' });
const sumResult = await client.getKpi('Sale', { operation: 'sum', field: 'total' }, { filter: myFilter });
```

- **exportList(module, listName, format, options?)** → GET /rest/data/:document/list/:listName/:type. format: 'csv' | 'xlsx' | 'json'. Retorna `Promise<ArrayBuffer>`.

Exemplo export:

```ts
const csvBytes = await client.exportList('Product', 'Default', 'csv', { filter: myFilter, limit: 1000 });
```

- **Comentários**: getComments(document, dataId), createComment(document, dataId, text, parentId?), updateComment(document, dataId, commentId, text), deleteComment(document, dataId, commentId), searchCommentUsers(document, dataId, q), searchComments(document, dataId, params?).
- **Assinaturas**: getSubscriptionStatus(module, dataId), subscribe(module, dataId), unsubscribe(module, dataId).
- **Notificações**: listNotifications(params?), getUnreadNotificationCount(), markNotificationRead(id), markAllNotificationsRead().
- **Change User**: changeUserAdd(module, ids, data?), changeUserRemove, changeUserDefine, changeUserReplace(module, ids, data: { from?, to? }), changeUserCountInactive(module, ids), changeUserRemoveInactive(module, ids), changeUserSetQueue(module, ids, data?).
- **Query**: executeQueryJson(body) — body é **CrossModuleQuery** (tipado). Use o builder tipado para montar a query: **createCrossModuleQuery(document?)**, depois .filter(), .fields(), .sort(), .limit(), .relation(document, lookup, fn?), .build(). Tipos em @konecty/sdk/types/crossModuleQuery (CrossModuleQuery, CrossModuleRelation, CrossModuleAggregator, AggregatorName). Relações: createCrossModuleRelation(doc, lookup).aggregator(alias, { aggregator, field? }).addNested(doc, lookup, fn?).build(). executeQuerySql(sql, options?) retorna { stream, total? }; listSavedQueries(), getSavedQuery(id), createSavedQuery(payload), updateSavedQuery(id, payload), deleteSavedQuery(id), shareSavedQuery(id, payload).
- **Graph/Pivot**: getGraph(module, graphConfig, params?) → Promise\<string\> (SVG); getPivot(module, pivotConfig, params?) → Promise\<T\>. Tipos em @konecty/sdk/types/graph e @konecty/sdk/types/pivot.

Exemplo executeQueryJson com builder tipado:

```ts
import { createCrossModuleQuery, KonectyClient } from '@konecty/sdk';

const query = createCrossModuleQuery('Contact')
  .filter({ match: 'and', conditions: [{ term: 'status', operator: 'equals', value: 'active' }] })
  .fields('name.full,code')
  .relation('Opportunity', 'contact', b => b.aggregator('count', { aggregator: 'count' }))
  .includeTotal(true)
  .build();
const { stream, total } = await client.executeQueryJson(query);
for await (const record of stream) { console.log(record); }
```

## 4. KonectyModule — uso típico

Criar módulo com ModuleConfig (name, collection, label, plurals) ou usar UserModule, RoleModule, GroupModule. O módulo delega ao KonectyClient; pode receber KonectyClientOptions no construtor ou usar KonectyClient.defaults.

- **findOne(filter, options?)** — um registro ou null. options: sort, fields, withDetailFields.
- **find(filter, options?)** — { data, count }. options: start, limit, sort, fields, withDetailFields.
- **create(document)** — ModuleActionResult com success e data ou errors.
- **update(document, ids)** — document: campos a atualizar; ids: array de { _id, _updatedAt }.
- **delete(ids)** — ids: array de { _id, _updatedAt }.
- **getHistory(_id)** — FindResult de History.
- **validate(document)** — local; retorna { success, errors?: { required } }.
- **lookup(field, search, filter?)** — KonectyFindResult para campos lookup.
- **filesManager(recordData)** — recordData: metaObject (nome do módulo), recordId, fieldName, recordCode?, files?; retorna FilesManager.

Filtro: `ModuleFilter` com match ('and' | 'or'), conditions (array de { term, operator, value }) e opcional textSearch. Operadores: equals, not_equals, in, not_in, greater_than, less_than, greater_or_equals, less_or_equals, contains, not_contains, starts_with, end_with, exists, between. Sort: array de { property, direction: 'ASC' | 'DESC' }.

Exemplo find/findOne (testes em `src/__test__/api/retrieve.test.ts`):

```ts
const userModule = new UserModule();
const user = await userModule.findOne({
  match: 'and',
  conditions: [{ term: 'username', operator: 'equals', value: 'admin' }],
});
const { data, count } = await userModule.find(
  { match: 'and', conditions: [{ term: 'active', operator: 'equals', value: true }] },
  { sort: [{ property: 'name', direction: 'ASC' }], limit: 50, fields: ['code', 'name'] }
);
```

Exemplo create (testes em `src/__test__/api/insert.test.ts`):

```ts
const webElementModule = new WebElementModule();
const result = await webElementModule.create({ type: 'HTML', status: 'Ativo', name: 'web element name' });
```

Exemplo update/delete (testes em `src/__test__/api/update.test.ts`, `delete.test.ts`):

```ts
await webElementModule.update({ slug: 'new-slug' }, [{ _id: '...', _updatedAt: new Date() }]);
await webElementModule.delete([{ _id: '...', _updatedAt: new Date() }]);
```

## 5. Lookup em campos de módulo

Usar **module.lookup(fieldName, search, filter?)** ou **client.lookup(moduleName, fieldName, search, options?)**. Em módulos com campo lookup que expõe .lookup: `campaignModule.product.lookup('test')` (exemplo em `api/lookup.test.ts`).

## 6. FilesManager

Obter via **module.filesManager(recordData)**. recordData: metaObject, recordId, fieldName, recordCode?, files?.

- **upload(formData)** — POST /rest/file/upload/ns/access/:document/:recordId|recordCode/:fieldName. FormData (browser) ou form-data (Node). Retorna KonectyResult com FileConfig.
- **deleteFile(fileName)** — DELETE /rest/file/delete/ns/access/.../:fileName.
- **reorder(fileName, newPosition, reorderMode?)** ou **reorder(positions: string[])** — ordem em memória; persistir com update do registro no CRM.
- **toJson()** — KonFiles.FileConfig[].

Configurar: KonectyClientOptions.fileManager.providerUrl (senão usa endpoint). Ver `docs/FilesManager.md` e testes em `src/__test__/sdk/FilesManager.test.ts`.

## 7. Autenticação e sessão

- **login(user, password, extraData?)** — senha hasheada pelo SDK (MD5/SHA256). extraData: geolocation, resolution, source, disableSetCookie. Retorno: success, authId, user; client guarda accessKey.
- **info()** — no browser usa cookie _authTokenId; retorna { logged, user? }. Exemplo: `src/__test__/api/info.test.ts`.
- Chamadas autenticadas: header Authorization com accessKey.

## 8. CEP e fila

- **getAddressByZipCode(zipCode)** — GET /rest/dne/cep/:cep. Exemplo: `src/__test__/api/dne.test.ts` — `await client.getAddressByZipCode('69902458')`.
- **getNextOnQueue(queueId)** — próximo usuário da fila; retorno: user, queue, count, order.

## 9. O que o SDK não cobre (chamar CRM direto)

Process submit, stream find/findStream/count, query (json/sql/saved/export/explorer), comments, subscriptions, notifications, changeUser, pivot/graph/KPI, relations, export list, lead save, GET por :dataId, auth reset/setpassword/setgeolocation, file2, DNE além de CEP, dashboards. Lista completa em `docs/api.md`.

## 10. Referências de exemplos

- **SDK**: `src/__test__/api/KonectyClient.test.ts`, `retrieve.test.ts`, `insert.test.ts`, `update.test.ts`, `delete.test.ts`, `lookup.test.ts`, `info.test.ts`, `dne.test.ts`, `src/__test__/sdk/FilesManager.test.ts`.
- **CRM (API)**: repositório Konecty — `__test__/data/api/findStream.test.ts`, `graphStream.test.ts`, `pivotStream.test.ts`; `src/imports/data/api/__tests__/` (crossModuleQuery, explorerModules, sqlToRelationsParser). SDK não expõe stream/query; usar fetch ao CRM se necessário.

Ao sugerir código com o SDK, use os padrões e assinaturas acima e indique testes ou docs quando relevante.

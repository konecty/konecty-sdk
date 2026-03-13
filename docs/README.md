# Konecty SDK — Documentação

O **Konecty SDK** é uma biblioteca TypeScript/Node que atua como cliente da API REST do CRM Konecty. Ela oferece acesso tipado a operações de dados (CRUD), autenticação, menu, metadados de documentos, arquivos e permissões de acesso.

## Documentos

| Documento | Descrição |
|-----------|-----------|
| [api.md](api.md) | Referência da API pública do SDK e mapeamento de cada método para os endpoints do CRM. |
| [integrations.md](integrations.md) | Configuração, autenticação e convenções para integrar o SDK ao Konecty. |
| [development.md](development.md) | Como rodar, testar e contribuir no repositório (scripts, estrutura, testes). |
| [FilesManager.md](FilesManager.md) | Documentação detalhada da classe FilesManager (upload, delete, reorder). |
| [changelog/README.md](changelog/README.md) | Índice e formato do histórico de versões. |
| [usage-advanced.md](usage-advanced.md) | Uso, limites e caveats de features avançadas (stream, etc.). |

**Cursor / slash command:** no repositório do SDK existe o comando [.cursor/commands/konecty-sdk.md](../.cursor/commands/konecty-sdk.md). Ao digitar `/konecty-sdk` no chat do Cursor, o agente recebe a documentação completa do SDK (API, módulos, exemplos e mapeamento para o CRM). Projetos que usam o SDK podem copiar esse arquivo para o próprio `.cursor/commands/` para ter o comando disponível.

## Visão geral

O SDK expõe:

- **KonectyClient**: cliente HTTP que chama os endpoints REST do CRM (dados, auth, menu, metas, access, queue, CEP).
- **KonectyModule** (e subclasses User, Role, Group): abstração por módulo/documento com find, findOne, create, update, delete, getHistory, lookup e filesManager.
- **FilesManager**: gerenciamento de arquivos por registro e campo (upload, delete, reorder).

A autenticação é feita via token (`accessKey`) obtido no login; no browser o SDK pode persistir o token no cookie `_authTokenId`. A base URL do CRM é configurada em `endpoint` nas opções do cliente.

Para detalhes dos endpoints do CRM utilizados pelo SDK e da lista do que o CRM expõe e o SDK ainda não cobre, consulte [api.md](api.md).

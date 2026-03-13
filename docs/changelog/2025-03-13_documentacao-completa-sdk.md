# Changelog: Documentação completa do SDK Konecty

## Resumo

Criação da documentação técnica em `docs/`: índice (README), referência da API com mapeamento para os endpoints do CRM (api.md), guia de integração (integrations.md), guia de desenvolvimento (development.md), índice do changelog (changelog/README.md) e pasta de ADRs (adr/README.md). Atualização do README na raiz com links para a documentação.

## Motivação

Garantir que o repositório tenha documentação completa, objetiva e acionável conforme as regras do workspace; permitir que desenvolvedores entendam o mapeamento entre métodos do SDK e endpoints do CRM Konecty e saibam o que está coberto e o que não está.

## O que mudou

- Criado `docs/README.md`: índice da documentação e visão geral do SDK.
- Criado `docs/api.md`: exportações principais; tabela KonectyClient método → HTTP + path CRM; KonectyModule e FilesManager; lista de endpoints do CRM não cobertos pelo SDK; diagrama mermaid do fluxo SDK ↔ CRM.
- Criado `docs/integrations.md`: configuração (endpoint, accessKey, fileManager), autenticação (login, logout, info, cookie), convenções (datas, find, update, delete, create), upload de arquivos (ns/access, recordCode vs recordId).
- Criado `docs/development.md`: pré-requisitos, estrutura de pastas (sdk, cli, lib, utils, __test__), scripts (build, test, lint, etc.), testes e publicação.
- Criado `docs/changelog/README.md`: referência ao CHANGELOG.md na raiz e formato (semantic-release, conventional commits); menção a entradas datadas opcionais.
- Criado `docs/adr/README.md`: propósito da pasta, quando criar ADR e estrutura obrigatória do arquivo.
- Atualizado `README.md` na raiz: adicionado parágrafo com links para docs/README.md, api.md, integrations.md e development.md.

## Impacto técnico

Nenhuma alteração em código ou build; apenas novos arquivos Markdown em `docs/` e uma alteração de texto no README raiz.

## Impacto externo

Usuários e contribuidores passam a ter referência centralizada da API do SDK, do mapeamento para o CRM e da lista do que o CRM expõe e o SDK não cobre; e um guia de desenvolvimento e de integração.

## Como validar

Abrir cada arquivo em `docs/` e o README na raiz e conferir links e conteúdo; verificar que não há trechos de código (apenas referências a arquivos e comandos).

## Arquivos afetados

- docs/README.md (novo)
- docs/api.md (novo)
- docs/integrations.md (novo)
- docs/development.md (novo)
- docs/changelog/README.md (novo)
- docs/changelog/2025-03-13_documentacao-completa-sdk.md (novo)
- docs/adr/README.md (novo)
- README.md (alterado)

## Existe migração?

Não.

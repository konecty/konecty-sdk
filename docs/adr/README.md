# Architecture Decision Records (ADR)

Esta pasta contém os Architecture Decision Records do Konecty SDK. Os ADRs documentam decisões arquiteturais relevantes: escolha de dependências, padrões de integração com o CRM, convenções de API ou de build que impactem o projeto a longo prazo.

## Quando criar um ADR

Criar um ADR quando a decisão:

- Afetar a arquitetura do SDK ou a forma como ele se integra ao CRM.
- Introduzir ou remover dependências importantes.
- Definir um padrão estrutural ou de uso da API.
- Impactar deploy, versionamento ou compatibilidade.
- For difícil de reverter sem custo significativo.

## Formato

Cada ADR deve ser um arquivo Markdown com o nome `NNNN-titulo-da-decisao.md` (número sequencial de 4 dígitos e título em kebab-case). Estrutura obrigatória:

- **Título**
- **Status** (ex.: Aceito, Proposto, Substituído)
- **Data** (YYYY-MM-DD)
- **Contexto**
- **Decisão**
- **Alternativas consideradas**
- **Consequências**
- **Plano de implementação** (quando aplicável)
- **Referências**

Se um ADR for substituído por outro, marcar o status como Substituído e apontar para o novo arquivo.

Atualmente não há ADRs publicados; eles serão adicionados conforme decisões forem tomadas e documentadas.

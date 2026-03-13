# Desenvolvimento

Este documento descreve como configurar o ambiente, rodar os testes e construir o projeto. Os comandos devem ser executados na raiz do repositório.

## Pré-requisitos

- **Node**: versão >= 16.0.0 (conforme engines em package.json).
- **Yarn**: >= 1.22.0 (ou npm >= 7.10.0).

Instalação das dependências: na raiz do repositório, executar o comando de instalação do gerenciador de pacotes (por exemplo `yarn` ou `npm install`).

## Estrutura do repositório

- **src/sdk/**: núcleo do SDK. Contém Client.ts (cliente HTTP e todos os métodos que chamam o CRM), Module.ts (KonectyModule e tipos de filtro/documento), FilesManager.ts, User.ts, Role.ts, Group.ts, FieldOperators.ts, TypeUtils.ts e a pasta types (metadata, access, filter, files, konectyReturn).
- **src/cli/**: entrada e comandos da CLI (binário konecty); não reexportado no pacote principal.
- **src/lib/**: utilitários internos (credenciais, logger, env, criação de tipos a partir de metadados).
- **src/utils/**: funções auxiliares (verificação de resposta HTTP, parse de erros, geolocalização, tipos).
- **src/__test__/**: testes com Jest; subpastas api, cli, sdk e fixtures; setup em setup-test.ts. Os testes de API utilizam mocks (MSW ou similar) para não depender de um CRM em execução; a base URL usada nos testes é http://localhost:3000.

O build gera a saída em **dist/**: JavaScript (Babel) e declarações TypeScript (tsc), preservando a estrutura de pastas de src (exceto __test__ e arquivos de teste).

## Scripts principais

- **build**: limpa dist e arquivos tsbuildinfo, em seguida executa build:babel e build:types. Gera o pacote publicável em dist.
- **test**: executa Jest em modo runInBand com detecção de handles abertos; cobre sdk, api e cli.
- **test:watch**: mesmo que test, em modo watch.
- **lint**: ESLint em todos os arquivos .ts em src, com correção automática quando aplicável.
- **prettier**: formata os arquivos em src com Prettier.
- **clean**: remove a pasta dist e os arquivos .tsbuildinfo.
- **start**: inicia com ts-node e nodemon (watch em src), com inspeção Node e saída formatada por pino-pretty; útil para desenvolvimento local da aplicação que usa o pacote, não para rodar o SDK em si como servidor.
- **prepare**: instala hooks do Husky (ex.: pre-commit); executado automaticamente após install.

## Testes

Os testes estão em src/__test__/, organizados por área (sdk, api, cli). As requisições HTTP são mockadas para não depender de um servidor Konecty ativo. Para rodar toda a suíte: usar o script `test` (por exemplo `yarn test` ou `npm run test`). Para rodar em modo watch durante alterações: usar o script `test:watch`.

## Build e publicação

Após `build`, o conteúdo publicável está em dist/. O package.json define main e types apontando para dist, e exports para os subpaths (Client, Module, FilesManager, User, Role, Group, types, etc.). O binário da CLI está em dist/cli/index.js. O campo files do package.json inclui apenas /dist, então apenas essa pasta é enviada ao publicar no registro npm.

## Commit e release

O projeto utiliza commitlint (config convencional) e semantic-release com changelog e git. As mensagens de commit devem seguir o formato esperado pelo commitlint para que o semantic-release gere versões e entradas no CHANGELOG corretamente. O histórico de versões está documentado no [changelog](changelog/README.md).

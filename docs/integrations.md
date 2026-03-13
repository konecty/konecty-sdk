# Integração do SDK com o Konecty CRM

Este documento descreve como configurar o SDK para se conectar ao CRM Konecty, como funciona a autenticação e quais convenções de payload e formato de dados são utilizadas.

## Configuração

As opções do cliente são do tipo KonectyClientOptions (definido em `src/sdk/Client.ts`).

- **endpoint**: base URL do CRM (ex.: https://meu-crm.konecty.com). Obrigatório para chamadas à API; não há valor padrão no código.
- **accessKey**: token de autenticação. É preenchido automaticamente após um login bem-sucedido (campo authId na resposta) ou pode ser definido manualmente quando já se possui um token válido (ex.: sessão restaurada).
- **credentialsFile**: caminho opcional para arquivo de credenciais (uso em ambiente Node).
- **fileManager**: objeto opcional com **providerUrl** (URL base para upload/delete de arquivos; se omitido, usa o endpoint do cliente) e **origin** (para uso em ambiente browser quando necessário).

O KonectyClient mantém um objeto estático `defaults`; propriedades passadas no construtor sobrescrevem esses defaults. Em cenários browser, após o login o SDK pode gravar o token no cookie `_authTokenId` para reutilização.

## Autenticação

- **Envio do token**: em todas as requisições ao CRM (exceto login), o SDK envia o header `Authorization` com o valor de `accessKey`. O CRM aceita o token no header Authorization ou no cookie `authTokenId` / `_authTokenId`.
- **Login**: o método login envia user e senha (hash MD5 e SHA256 no body) para POST /rest/auth/login. A resposta inclui `authId`; em caso de sucesso o SDK atribui esse valor a `accessKey` e, no browser, pode definir o cookie `_authTokenId` (a menos que disableSetCookie seja true). Payload pode incluir geolocation, resolution, source; em browser, geolocation é obtido automaticamente quando não informado.
- **Logout**: GET /rest/auth/logout com credentials include (cookies). No browser o SDK remove o cookie `_authTokenId`.
- **Validação de sessão**: o método info(token?) permite verificar se um token é válido. Se token não for passado, no browser o SDK usa o cookie `_authTokenId`. O CRM responde com logged e dados do usuário; em caso de sucesso o SDK atualiza `accessKey` e opcionalmente o cookie.

Para integrações server-side ou quando o token é obtido por outro meio, basta definir `endpoint` e `accessKey` nas opções do cliente.

## Convenções de dados

- **Datas**: o SDK serializa datas no formato esperado pelo CRM (objeto com propriedade $date em ISO). Na deserialização das respostas, strings ISO e objetos $date são convertidos para Date (via Luxon).
- **Find**: os parâmetros (filter, sort, limit, start, fields) são serializados e enviados na query string do GET; filter e sort são objetos que seguem o formato de filtro e ordenação do CRM.
- **Update**: o body enviado ao CRM tem estrutura com **ids** (array de identificadores dos registros) e **data** (objeto com os campos a atualizar). O SDK recebe no método update o módulo, o objeto data e o array de ids.
- **Delete**: o body enviado ao CRM contém **ids** (array de identificadores). O SDK recebe o módulo e o array de ids.
- **Create**: o body é o próprio documento (objeto ou array, conforme suporte do CRM). O SDK envia o objeto passado ao método create.

Erros: o SDK trata status HTTP >= 400 como falha e retorna respostas com success false e array errors; em muitos métodos o CRM devolve success e errors no JSON.

## Upload de arquivos

O FilesManager usa paths fixos com os segmentos **ns** (namespace) e **access** (accessId). Ou seja, o SDK assume o uso do namespace e do access padrão configurados no CRM para essa forma de URL. Se o seu Konecty estiver configurado com outro namespace ou accessId na rota de arquivos, pode ser necessário estender o SDK ou usar a API de arquivos do CRM diretamente.

- **recordCode vs recordId**: no RecordData do FilesManager, se **recordCode** estiver presente ele é usado no path; caso contrário, usa-se **recordId**. Isso permite identificar o registro pelo código em vez do _id quando o CRM assim o exigir ou permitir.
- **base URL**: as requisições de upload e delete usam **fileManager.providerUrl** quando definido; senão, o **endpoint** do cliente. Isso permite apontar para um provedor de arquivos diferente do servidor principal, se a instalação do Konecty assim estiver configurada.

As requisições de upload devem enviar o body como multipart (FormData); o SDK repassa o FormData recebido e adiciona o header Authorization. Para detalhes dos métodos do FilesManager, consulte [FilesManager.md](FilesManager.md).

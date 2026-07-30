# AGENTS.md

Guia para agentes de IA (Claude Code, Cursor, etc.) neste repositório.

> Este arquivo é `AGENTS.md`; `CLAUDE.md` é um symlink para ele. **Edite `AGENTS.md`.**

`@konecty/sdk` — SDK **TypeScript** do Konecty. Cliente HTTP tipado sobre as APIs REST do backend (`konecty/Konecty`): dados, metadados, arquivos, KPIs, streaming e autenticação.

## O SDK tem um par: mantenha os dois em sincronia

Existem **dois SDKs oficiais do Konecty**, e eles são pares — não um principal e um secundário:

| | repo | pacote |
| --- | --- | --- |
| TypeScript | `konecty/konecty-sdk` (este) | `@konecty/sdk` (npm) |
| Python | `konecty/konecty-sdk-python` | `konecty-sdk-python` (PyPI) |

- **Mudou algo aqui que também existe lá? Provavelmente muda lá também.** Vale para método novo, campo novo, código de erro novo, correção de comportamento e mudança de assinatura. Antes de fechar a task, **verifique o SDK Python** e diga o que encontrou: ou você espelhou, ou não se aplica (e por quê), ou fica para uma task própria (e diga qual).
- **Nem tudo espelha, e tudo bem — mas justifique.** Exemplo real: `exchangeGoogleCode` passou a lançar `KonectyGoogleSessionError` com `code`, e isso **espelhou** no Python porque o buraco era o mesmo; já expor helpers puros que não gravam cookie **não espelhou**, porque era exigência de um consumidor de browser e o Python adota a sessão no objeto do client.
- **Mesma entrada, mesma saída.** Onde os dois expõem a mesma operação, o comportamento observável tem que bater: mesmos códigos de erro, mesma URL montada byte a byte, mesma semântica de parâmetro opcional. Divergências reais já aconteceram — codificação de query string (`encodeURIComponent` gerando `%20` contra `quote_plus` gerando `+`).
- **Trave a paridade por teste, não por comentário.** Ao espelhar, escreva no outro SDK um teste com **a mesma entrada e a mesma saída esperada**, citando o arquivo equivalente. Ver `src/__test__/api/googleLogin.test.ts` e `tests/test_auth_google.py` no Python.

E na direção do backend: mudança na superfície pública do `konecty/Konecty` (rota, campo de resposta, código de erro) precisa chegar **aos dois SDKs**. Um atualizado e o outro não é a falha mais comum, e ela só aparece quando um cliente da outra linguagem quebra.

## Publicação

- **Disparo manual:** aba Actions → **Release** → `Run workflow`. Nenhum merge na `main` publica sozinho.
- A versão é decidida pelo **semantic-release** a partir dos commits, com as regras em `.releaserc.yml` — `feat` → minor, `fix`/`perf`/`build` → patch, `chore`/`ci`/`docs`/`refactor`/`style`/`test` → nenhum release. Escreva a mensagem de commit sabendo disso: um `ci:` sozinho não gera versão.
- **Cuidado com o efeito colateral já vivido:** o semantic-release cria o commit de changelog e a **tag antes** do `publish`. Se o publish falha, a versão fica tagueada no git sem estar no npm, e o botão nunca mais a emite — ela passa a ser "já lançada". Por isso `@semantic-release/npm` está em `verifyConditions`: token inválido aborta o run **antes** de qualquer escrita. Não remova.
- Requer o secret `NPM_TOKEN` (token de automação; com 2FA, nível "Authorization only").

## Testes

```sh
yarn test
```

Jest + `msw` para interceptar HTTP (`src/__test__/`). Os testes assertam o **contrato observável** — URL, corpo enviado, status, erro lançado e estado do client depois — e não a implementação interna.

Ao corrigir um bug, escreva primeiro o teste que o reproduz. Nunca enfraqueça ou delete um teste para fazer a suíte passar.

## Convenções

- **Sem credenciais/segredos hardcoded.** Tokens e URLs de teste são fictícios; nada de literal apontando para deployment real.
- **Nada de `authId` em URL, log ou mensagem de erro.** O token de sessão só trafega em corpo de resposta e em header `Authorization`.
- **Erros carregam código legível por máquina** quando o backend fornece um. Quem consome traduz ou ramifica pelo código; obrigar a parsear a mensagem acopla o caller ao texto do servidor e quebra a paridade entre os SDKs.
- **Verifique, não chute.** Ao mexer em contrato do backend, confira `docs/pt-BR/api.md` no repo `konecty/Konecty` em vez de recordar de memória.

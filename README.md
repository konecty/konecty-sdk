![Konecty](./docs/logo-konecty.png)

![npm shield](https://img.shields.io/npm/v/@konecty/sdk?style=flat-square)

# Konecty SDK

| :bangbang: | This is a work in progress package. Follow us for updates. |
| :--------: | :--------------------------------------------------------- |

---

Documentação completa: [docs/README.md](./docs/README.md) (índice), [api.md](./docs/api.md) (mapeamento SDK ↔ CRM), [integrations.md](./docs/integrations.md) (configuração e autenticação), [development.md](./docs/development.md) (build e testes).

---

#### Login com Google

O Konecty hospeda o fluxo de authorization code: o SDK apenas **monta** a URL de início,
o browser é redirecionado para lá e, no retorno, o app troca o código de uso único
(TTL de 60s) por uma sessão. O `authId` nunca transita em URL — ele só existe no corpo
da resposta da troca, que deve ser feita no servidor do app.

| Method               | Signature                                                                                      | Description                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `getGoogleLoginUrl`  | `getGoogleLoginUrl(params: { clientId: string; redirectUri: string; state: string }): string`  | Monta a URL absoluta de `GET /api/auth/google/start`. Puro, não faz request. |
| `exchangeGoogleCode` | `exchangeGoogleCode(code: string, extraData?: GoogleSessionExtraData): Promise<GoogleSession>` | Troca o código pelo `{ authId, user }` e adota o `authId` no cliente.        |
| `getLoginOptions`    | `getLoginOptions(): Promise<LoginOptions>`                                                     | Flags de login habilitadas no servidor, incluindo `googleEnabled`.           |

```ts
import { KonectyClient } from '@konecty/sdk/Client';
import crypto from 'crypto';

const konecty = new KonectyClient({ endpoint: process.env.KONECTY_URL });

// 1. Monte a URL de início (nenhum request de rede acontece aqui)
const { googleEnabled } = await konecty.getLoginOptions();

if (googleEnabled) {
	const state = crypto.randomBytes(16).toString('hex'); // guarde na sessão do app
	const url = konecty.getGoogleLoginUrl({
		clientId: process.env.KONECTY_CLIENT_ID!,
		redirectUri: 'https://app.exemplo.com/auth/google/callback',
		state,
	});

	// 2. Redirecione o browser. O Konecty leva o usuário ao Google e devolve
	//    o browser para o seu redirectUri com ?code=<uso unico>&state=<state>
	//    (ou ?error=<codigo>&state=<state> em caso de recusa).
	response.redirect(url);
}

// 3. No handler do seu callback (servidor do app): valide o state e troque o código
async function handleCallback(query: { code?: string; error?: string; state?: string }) {
	if (query.error != null) {
		throw new Error(`Login recusado: ${query.error}`);
	}
	if (query.state !== expectedStateFromSession) {
		throw new Error('State inválido');
	}

	// Em erro, lança com a mensagem de errors[0].message e o cliente segue não autenticado.
	const { authId, user } = await konecty.exchangeGoogleCode(query.code!, {
		source: 'web', // geolocation, resolution e fingerprint também são opcionais
	});

	// O cliente já está autenticado; os requests seguintes usam este authId.
	const contacts = await konecty.find('Contact', { filter: {} });

	return { authId, user, contacts };
}
```

#### Files manager

You can read the [full documentation here.](./docs/FilesManager.md)

| Method  | Signature                                                                                                           | Description                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| upload  | `upload(formData: FormData \| NodeFormData): Promise<KonectyResult<KonFiles.FileConfig>>`                           | Uploads all files present in the provided `FormData` to the Konecty server.                     |
| delete  | `deleteFile(fileName: string): Promise<KonectyResult<'no-data'>>`                                                   | Deletes a file by its name from the Konecty record.                                             |
| reorder | `reorder(fileName: string, newPosition: number, reorderMode?: 'swap' \| 'push'): Promise<KonectyResult<'no-data'>>` | Reorders a single file in the list to a new position, using either 'swap' or 'push' mode.       |
| reorder | `reorder(positions: string[]): Promise<KonectyResult<'no-data'>>`                                                   | Reorders multiple files based on a new order of positions provided as an array of file names.   |
| toJson  | `toJson(): KonFiles.FileConfig[]`                                                                                   | Converts the list of managed files to a JSON-compatible array of `KonFiles.FileConfig` objects. |

type KonectyErrors = string[] | { message: string }[];

export default function parseKonectyErrors(err: KonectyErrors) {
	return err.map(err => (typeof err === 'string' ? err : err.message)).join('\n');
}

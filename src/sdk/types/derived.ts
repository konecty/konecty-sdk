/**
 * Campo derivado (ADR-0025 no repo Konecty): campo numérico que o chamador declara
 * numa consulta, calculado no servidor por uma expressão sobre campos `number`/`money`
 * do documento primário. Volta em todo registro e vale em `filter` (operadores
 * numéricos), `sort` e, na consulta cross-module, em `groupBy` e `aggregators[*].field`.
 *
 * O SDK só tipa e transporta: alias, aridade, limites (10 campos, profundidade 3,
 * 10 operandos) e permissão são decididos pelo servidor, que recusa com
 * `DERIVED_FIELD_INVALID` (forma) ou `DERIVED_FIELD_UNAVAILABLE` (permissão).
 * Mesma forma no SDK Python: `KonectySdkPython/lib/feature_types/derived.py`.
 */
export type DerivedOp = 'add' | 'subtract' | 'multiply' | 'coalesce';

/** string = campo do documento primário (`money` sem sufixo lê `.value`), number = literal, objeto = nó aninhado. */
export type DerivedOperand = string | number | DerivedExpression;

/** `add`/`subtract`/`multiply` ≥ 2 args (`subtract` da esquerda para a direita); `coalesce` exatamente 2, o segundo literal. */
export interface DerivedExpression {
	op: DerivedOp;
	args: DerivedOperand[];
}

/** `computed` de `find` e de `CrossModuleQuery`: alias → expressão. */
export type Computed = Record<string, DerivedExpression>;

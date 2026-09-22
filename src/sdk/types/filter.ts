import type { WithinRadiusValue } from '@konecty/sdk/filters/withinRadius';

/**
 * Valor de uma condição de filtro.
 *
 * O ramo `WithinRadiusValue` é aditivo: o operador `within_radius` é o primeiro
 * a receber um valor estruturado (`{ center, radius }`) em vez de escalar ou
 * lista de escalares.
 */
export type KonConditionValue = string | number | boolean | (string | number | boolean)[] | WithinRadiusValue;

export type KonCondition = {
	value: KonConditionValue;
	term: string;
	operator: string;
	editable?: boolean;
	disabled?: boolean;
};

export type KonFilter = {
	match: 'and' | 'or';
	textSearch?: string;
	conditions?: KonCondition[];
	filters?: {
		match?: 'and' | 'or';
		conditions?: KonCondition[];
		textSearch?: string;
	}[];
};

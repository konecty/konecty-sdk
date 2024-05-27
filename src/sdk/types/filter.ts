export type KonCondition = {
	value: string | number | boolean | (string | number | boolean)[];
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

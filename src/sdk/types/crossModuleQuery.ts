import type { KonFilter } from './filter';
import type { Computed } from './derived';

/** Aggregator names supported by Konecty POST /rest/query/json (cross-module query). */
export const AGGREGATOR_NAMES = [
	'count',
	'countDistinct',
	'sum',
	'avg',
	'min',
	'max',
	'first',
	'last',
	'push',
	'addToSet',
] as const;

export type AggregatorName = (typeof AGGREGATOR_NAMES)[number];

/** Single aggregator definition (e.g. count, sum over a field). */
export interface CrossModuleAggregator {
	aggregator: AggregatorName;
	field?: string;
}

/** Sort item for primary query or relation. */
export interface CrossModuleSortItem {
	property: string;
	direction?: 'ASC' | 'DESC';
}

/** Explicit join condition (left/right field names). */
export interface CrossModuleJoinOn {
	left: string;
	right: string;
}

/** One relation in a cross-module query (document, lookup, aggregators, optional nested relations). */
export interface CrossModuleRelation {
	document: string;
	lookup: string;
	on?: CrossModuleJoinOn;
	filter?: KonFilter;
	fields?: string;
	sort?: string | CrossModuleSortItem[];
	limit?: number;
	start?: number;
	aggregators: Record<string, CrossModuleAggregator>;
	relations?: CrossModuleRelation[];
}

/** Full cross-module query body for POST /rest/query/json. Aligned with Konecty CrossModuleQuerySchema. */
export interface CrossModuleQuery {
	document: string;
	filter?: KonFilter;
	fields?: string;
	sort?: string | CrossModuleSortItem[];
	limit?: number;
	start?: number;
	relations?: CrossModuleRelation[];
	groupBy?: string[];
	aggregators?: Record<string, CrossModuleAggregator>;
	/** Campos derivados do documento primário (ADR-0025); o alias vale em filter, sort, groupBy e aggregators[*].field. */
	computed?: Computed;
	includeTotal?: boolean;
	includeMeta?: boolean;
}

/** Konecty limits (for validation or builder hints). */
export const MAX_RELATIONS = 10;
export const MAX_NESTING_DEPTH = 2;
export const MAX_RELATION_LIMIT = 100_000;
export const DEFAULT_RELATION_LIMIT = 1000;
export const DEFAULT_PRIMARY_LIMIT = 1000;

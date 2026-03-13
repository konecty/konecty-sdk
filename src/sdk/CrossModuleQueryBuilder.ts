import type {
	CrossModuleAggregator,
	CrossModuleQuery,
	CrossModuleRelation,
	CrossModuleSortItem,
} from './types/crossModuleQuery';
import type { KonFilter } from './types/filter';
import {
	DEFAULT_PRIMARY_LIMIT,
	DEFAULT_RELATION_LIMIT,
	MAX_RELATION_LIMIT,
	MAX_RELATIONS,
} from './types/crossModuleQuery';

/**
 * Fluent builder for a single relation in a cross-module query.
 * Each relation must have at least one aggregator.
 */
export class CrossModuleRelationBuilder {
	private readonly _relation: CrossModuleRelation;

	constructor(document: string, lookup: string) {
		this._relation = {
			document,
			lookup,
			aggregators: {},
		};
	}

	/** Explicit join condition (left field on parent, right field on this relation). */
	on(left: string, right: string): this {
		this._relation.on = { left, right };
		return this;
	}

	/** Filter applied to this relation's document. */
	filter(f: KonFilter): this {
		this._relation.filter = f;
		return this;
	}

	/** Comma-separated field names to return from this relation. */
	fields(s: string): this {
		this._relation.fields = s;
		return this;
	}

	/** Sort: string (e.g. "name ASC") or array of { property, direction }. */
	sort(s: string | CrossModuleSortItem[]): this {
		this._relation.sort = s;
		return this;
	}

	/** Max records for this relation (1..MAX_RELATION_LIMIT). Default DEFAULT_RELATION_LIMIT. */
	limit(n: number): this {
		this._relation.limit = n;
		return this;
	}

	/** Start offset for this relation. */
	start(n: number): this {
		this._relation.start = n;
		return this;
	}

	/** Add an aggregator (alias -> { aggregator, field? }). At least one required. */
	aggregator(alias: string, agg: CrossModuleAggregator): this {
		this._relation.aggregators[alias] = agg;
		return this;
	}

	/** Add a nested relation (e.g. Contact -> Opportunity -> Activity). Pass a built CrossModuleRelation. */
	relation(rel: CrossModuleRelation): this {
		this._relation.relations = this._relation.relations ?? [];
		if (this._relation.relations.length >= MAX_RELATIONS) {
			throw new Error(`At most ${MAX_RELATIONS} relations allowed`);
		}
		this._relation.relations.push(rel);
		return this;
	}

	/** Add a nested relation by document + lookup + optional configurator. */
	addNested(document: string, lookup: string, configure?: (b: CrossModuleRelationBuilder) => void): this {
		const b = new CrossModuleRelationBuilder(document, lookup);
		configure?.(b);
		const built = b.build();
		this._relation.relations = this._relation.relations ?? [];
		if (this._relation.relations.length >= MAX_RELATIONS) {
			throw new Error(`At most ${MAX_RELATIONS} relations allowed`);
		}
		this._relation.relations.push(built);
		return this;
	}

	/** Build the relation object. Throws if no aggregators. */
	build(): CrossModuleRelation {
		if (Object.keys(this._relation.aggregators).length === 0) {
			throw new Error('Each relation must have at least one aggregator');
		}
		if (this._relation.limit != null && (this._relation.limit < 1 || this._relation.limit > MAX_RELATION_LIMIT)) {
			throw new Error(`Relation limit must be between 1 and ${MAX_RELATION_LIMIT}`);
		}
		return { ...this._relation };
	}
}

/**
 * Fluent builder for a cross-module query (POST /rest/query/json).
 * Strongly typed and aligned with Konecty CrossModuleQuerySchema.
 */
export class CrossModuleQueryBuilder {
	private readonly _query: CrossModuleQuery;

	constructor(document?: string) {
		this._query = {
			document: document ?? '',
			limit: DEFAULT_PRIMARY_LIMIT,
			start: 0,
			relations: [],
			groupBy: [],
			aggregators: {},
			includeTotal: true,
			includeMeta: false,
		};
	}

	/** Set primary document (module name). Required. */
	document(name: string): this {
		this._query.document = name;
		return this;
	}

	/** Filter for the primary document. */
	filter(f: KonFilter): this {
		this._query.filter = f;
		return this;
	}

	/** Comma-separated field names for the primary document. */
	fields(s: string): this {
		this._query.fields = s;
		return this;
	}

	/** Sort for primary: string or array of { property, direction }. */
	sort(s: string | CrossModuleSortItem[]): this {
		this._query.sort = s;
		return this;
	}

	/** Max records for primary (1..MAX_RELATION_LIMIT). Default DEFAULT_PRIMARY_LIMIT. */
	limit(n: number): this {
		this._query.limit = n;
		return this;
	}

	/** Start offset for primary. */
	start(n: number): this {
		this._query.start = n;
		return this;
	}

	/** Group primary results by these field names. */
	groupBy(fields: string[]): this {
		this._query.groupBy = fields;
		return this;
	}

	/** Add root-level aggregator (alias -> { aggregator, field? }). */
	aggregator(alias: string, agg: CrossModuleAggregator): this {
		this._query.aggregators = this._query.aggregators ?? {};
		this._query.aggregators[alias] = agg;
		return this;
	}

	/** Whether to include total count in response (X-Total-Count header). Default true. */
	includeTotal(value: boolean): this {
		this._query.includeTotal = value;
		return this;
	}

	/** Whether to include meta as first NDJSON line. Default false. */
	includeMeta(value: boolean): this {
		this._query.includeMeta = value;
		return this;
	}

	/** Add a relation: pass a built CrossModuleRelation. */
	relation(rel: CrossModuleRelation): this;
	/** Add a relation by document + lookup and optional configurator. */
	relation(
		document: string,
		lookup: string,
		configure?: (b: CrossModuleRelationBuilder) => void,
	): this;
	relation(
		relOrDocument: CrossModuleRelation | string,
		lookupOrConfigure?: string | ((b: CrossModuleRelationBuilder) => void),
		configure?: (b: CrossModuleRelationBuilder) => void,
	): this {
		if (this._query.relations!.length >= MAX_RELATIONS) {
			throw new Error(`At most ${MAX_RELATIONS} relations allowed`);
		}
		if (typeof relOrDocument === 'object') {
			this._query.relations!.push(relOrDocument);
			return this;
		}
		const document = relOrDocument;
		const lookup = typeof lookupOrConfigure === 'string' ? lookupOrConfigure : '';
		if (!lookup) {
			throw new Error('lookup is required when adding relation by document name');
		}
		const fn = configure;
		const b = new CrossModuleRelationBuilder(document, lookup);
		fn?.(b);
		this._query.relations!.push(b.build());
		return this;
	}

	/** Build the query object. Throws if document is empty or relation has no aggregators. */
	build(): CrossModuleQuery {
		if (!this._query.document || this._query.document.trim() === '') {
			throw new Error('document is required');
		}
		if (this._query.limit != null && (this._query.limit < 1 || this._query.limit > MAX_RELATION_LIMIT)) {
			throw new Error(`limit must be between 1 and ${MAX_RELATION_LIMIT}`);
		}
		return { ...this._query };
	}
}

/** Create a new cross-module query builder (optionally with primary document). */
export function createCrossModuleQuery(document?: string): CrossModuleQueryBuilder {
	return new CrossModuleQueryBuilder(document);
}

/** Create a new relation builder for the given document and lookup field. */
export function createCrossModuleRelation(document: string, lookup: string): CrossModuleRelationBuilder {
	return new CrossModuleRelationBuilder(document, lookup);
}

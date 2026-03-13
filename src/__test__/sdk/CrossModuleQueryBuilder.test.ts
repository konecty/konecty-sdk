import { expect } from 'chai';
import {
	createCrossModuleQuery,
	createCrossModuleRelation,
	CrossModuleQueryBuilder,
} from '@konecty/sdk/CrossModuleQueryBuilder';
import type { CrossModuleQuery, CrossModuleRelation } from '@konecty/sdk/types/crossModuleQuery';

describe('CrossModuleQueryBuilder', () => {
	it('builds minimal query with document only', () => {
		const q = createCrossModuleQuery('Contact').build();
		expect(q.document).to.equal('Contact');
		expect(q.relations).to.deep.equal([]);
		expect(q.limit).to.equal(1000);
		expect(q.start).to.equal(0);
		expect(q.includeTotal).to.equal(true);
		expect(q.includeMeta).to.equal(false);
	});

	it('builds query with filter, fields, sort, limit, start', () => {
		const q = createCrossModuleQuery('Contact')
			.filter({ match: 'and', conditions: [{ term: 'status', operator: 'equals', value: 'active' }] })
			.fields('code,name.full')
			.sort([{ property: 'name.full', direction: 'ASC' }])
			.limit(100)
			.start(10)
			.build();
		expect(q.document).to.equal('Contact');
		expect(q.filter).to.deep.equal({ match: 'and', conditions: [{ term: 'status', operator: 'equals', value: 'active' }] });
		expect(q.fields).to.equal('code,name.full');
		expect(q.sort).to.deep.equal([{ property: 'name.full', direction: 'ASC' }]);
		expect(q.limit).to.equal(100);
		expect(q.start).to.equal(10);
	});

	it('builds query with one relation via callback', () => {
		const q = createCrossModuleQuery('Contact')
			.relation('Opportunity', 'contact', b => b.aggregator('c', { aggregator: 'count' }))
			.build();
		expect(q.relations).to.have.lengthOf(1);
		expect(q.relations![0]).to.deep.include({
			document: 'Opportunity',
			lookup: 'contact',
			aggregators: { c: { aggregator: 'count' } },
		});
	});

	it('builds query with relation (pre-built CrossModuleRelation)', () => {
		const rel: CrossModuleRelation = {
			document: 'Opportunity',
			lookup: 'contact',
			aggregators: { total: { aggregator: 'sum', field: 'amount' } },
		};
		const q = createCrossModuleQuery('Contact').relation(rel).build();
		expect(q.relations).to.have.lengthOf(1);
		expect(q.relations![0].aggregators.total).to.deep.equal({ aggregator: 'sum', field: 'amount' });
	});

	it('builds relation with on, filter, fields, sort, limit, aggregators', () => {
		const rel = createCrossModuleRelation('Opportunity', 'contact')
			.on('_id', 'contact._id')
			.filter({ match: 'and', conditions: [{ term: 'status', operator: 'equals', value: 'open' }] })
			.fields('amount,closeDate')
			.sort([{ property: 'closeDate', direction: 'DESC' }])
			.limit(50)
			.aggregator('c', { aggregator: 'count' })
			.aggregator('totalAmount', { aggregator: 'sum', field: 'amount' })
			.build();
		expect(rel.document).to.equal('Opportunity');
		expect(rel.lookup).to.equal('contact');
		expect(rel.on).to.deep.equal({ left: '_id', right: 'contact._id' });
		expect(rel.aggregators.c).to.deep.equal({ aggregator: 'count' });
		expect(rel.aggregators.totalAmount).to.deep.equal({ aggregator: 'sum', field: 'amount' });
	});

	it('builds nested relation via addNested', () => {
		const rel = createCrossModuleRelation('Contact', 'staff')
			.aggregator('n', { aggregator: 'count' })
			.addNested('Activity', 'relatedTo', b => b.aggregator('activities', { aggregator: 'count' }))
			.build();
		expect(rel.relations).to.have.lengthOf(1);
		expect(rel.relations![0].document).to.equal('Activity');
		expect(rel.relations![0].lookup).to.equal('relatedTo');
		expect(rel.relations![0].aggregators.activities).to.deep.equal({ aggregator: 'count' });
	});

	it('throws if document is empty', () => {
		expect(() => new CrossModuleQueryBuilder().build()).to.throw('document is required');
		expect(() => new CrossModuleQueryBuilder('').build()).to.throw('document is required');
	});

	it('throws if relation has no aggregators', () => {
		expect(() => createCrossModuleRelation('Opportunity', 'contact').build()).to.throw(
			'at least one aggregator',
		);
	});

	it('produces CrossModuleQuery compatible with executeQueryJson', () => {
		const query: CrossModuleQuery = createCrossModuleQuery('Contact')
			.fields('name.full,code')
			.relation('Opportunity', 'contact', b => b.aggregator('count', { aggregator: 'count' }))
			.includeTotal(true)
			.includeMeta(false)
			.build();
		expect(query.document).to.equal('Contact');
		expect(query.relations?.length).to.equal(1);
		expect(JSON.parse(JSON.stringify(query))).to.deep.equal(query);
	});
});

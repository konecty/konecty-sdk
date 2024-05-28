import { KonCondition, KonFilter } from './filter';

export type FieldAccess = Record<
	'READ' | 'UPDATE' | 'CREATE' | 'DELETE',
	{
		allow: boolean;
		condition?: KonCondition;
	}
>;

export type MetaAccess = {
	type: 'access';
	_id: string;
	document: string;
	name: string;
	fields?: Record<string, FieldAccess>;

	readFilter?: KonFilter;
	updateFilter?: KonFilter;

	fieldDefaults: {
		isUpdatable?: boolean | undefined;
		isCreatable?: boolean | undefined;
		isReadable?: boolean | undefined;
		isDeletable?: boolean | undefined;
	};
	isUpdatable?: boolean | undefined;
	isCreatable?: boolean | undefined;
	isReadable?: boolean | undefined;
	isDeletable?: boolean | undefined;
};

export type UpdateAccessPayload =
	| {
			fields: {
				fieldNames: string[];
				allow: boolean;
				condition?: KonCondition;
			};

			readFilter?: MetaAccess['readFilter'];
			updateFilter?: MetaAccess['updateFilter'];
	  }
	| { readFilter: MetaAccess['readFilter']; updateFilter?: MetaAccess['updateFilter'] }
	| { updateFilter: MetaAccess['updateFilter']; readFilter?: MetaAccess['readFilter'] };

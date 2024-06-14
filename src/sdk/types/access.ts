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

	readFilter?: KonFilter & { allow?: boolean };
	updateFilter?: KonFilter & { allow?: boolean };

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

type FieldsUpdate = {
	fieldNames: string[];
	allow: boolean;
	operation: 'READ' | 'UPDATE' | 'CREATE' | 'DELETE';
	condition?: KonCondition;
}[];

export type UpdateAccessPayload =
	| {
			fields: FieldsUpdate;

			readFilter?: MetaAccess['readFilter'];
			updateFilter?: MetaAccess['updateFilter'];
	  }
	| { readFilter: MetaAccess['readFilter']; updateFilter?: MetaAccess['updateFilter']; fields?: FieldsUpdate }
	| { updateFilter: MetaAccess['updateFilter']; readFilter?: MetaAccess['readFilter']; fields?: FieldsUpdate };

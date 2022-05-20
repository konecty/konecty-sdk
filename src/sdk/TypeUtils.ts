type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

export type Join<K, P> = K extends string | number
	? P extends string | number
		? `${K}${'' extends P ? '' : '.'}${P}`
		: never
	: never;

export type Paths<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
	? {
			[K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K], Prev[D]>> : never;
	  }[keyof T]
	: '';

export type Leaves<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
	? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
	: '';

export type TypeFromPath<
	T extends object,
	Path extends string, // Or, if you prefer, Paths<T>
> = {
	[K in Path]: K extends keyof T
		? T[K]
		: K extends `${infer P}.${infer S}`
		? P extends keyof T
			? T[P] extends object
				? TypeFromPath<T[P], S>
				: never
			: never
		: never;
}[Path];

export type PickFromPath<
	T extends object,
	Path extends string, // Or, if you prefer, Paths<T>
> = Path extends keyof T
	? { [K in Path]: T[K] }
	: Path extends `${infer P}.${infer S}`
	? P extends keyof T
		? T[P] extends object
			? { [K in P]: PickFromPath<T[P], S> }
			: never
		: never
	: never;

type X = {
	a: number;
	b: {
		c: string;
		d: {
			e: number;
		};
	};
};

type J = PickFromPath<X, 'a' | 'b.c'>;

const j: J = {
	a: 0,
	b: {
		c: '',
	},
};

type Y = Paths<X>;
type Z = Leaves<X>;

type A = TypeFromPath<X, 'b.c'>;

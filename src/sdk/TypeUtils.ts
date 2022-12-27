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

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

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

export type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[] ? ElementType : never;

export type Nullable<T> = {
	[P in keyof T]?: T[P] | null;
};

export function List(target: Konecty.Document, propertyKey: string, descriptor: PropertyDescriptor & Konecty.Field<number>) {
	descriptor.isList = false;
	descriptor.enumerable = false;
}

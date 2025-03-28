# FilesManager Class Documentation

## Overview

The `FilesManager` class is responsible for managing file operations in conjunction with the Konecty platform. It handles uploading, deleting, and reordering files associated with a specific record AND a specific field in a Konecty collection. **So each managed file field in a record must have its own FilesManager instance**.
The class is designed to work both in browser environments and in Node.js.

## Usage

The class can be instantiated via a Konecty Module instance.

#### Parameters:

-   `konectyClientOpts`: An object of type `KonectyClientOptions` containing options for the Konecty client, with added files stuff.
-   `recordData`: An object of type `KonFiles.RecordData` containing metadata about the record associated with the files.
    -   `metaObject`: The name of the module that contains the field.
    -   `recordId`: The ID of the record.
    -   `recordCode`: (Optional) The code of the record. If present, will be used to generate the key instead of the `recordId`.
    -   `fieldName`: The name of the field in the record that contains the files.
    -   `files`: An array of file configurations (`KonFiles.FileConfig[]`) to manage. (The same stored in Konecty)

#### Example:

```typescript
const konectyClientOpts = {
	endpoint: 'http://konecty.com',
	accessKey: 'your-access-key',
	fileManager: {
		providerUrl: 'http://konecty.com',
		origin: 'http://konecty.com',
	},
};

const recordData = {
	recordId: myProduct._id,
	fieldName: 'pictures',
	// recordCode: myProduct.code
};

const ProdModule = new ProductModule(konectyClientOpts);
const myProduct = await fetchMyProduct();

const picturesManager = ProdModule.filesManager({
	recordId: myProduct._id,
	fieldName: 'pictures',
	files: myProduct.pictures,
});
```

## Methods

### `upload(formData: FormData | NodeFormData): Promise<KonectyResult<KonFiles.FileConfig>>`

Uploads all files present in the provided `FormData`. On the browser, this should be a native `FormData` object, while in Node.js, it should be compatible with the `form-data` package.

#### Parameters:

-   `formData`: An instance of `FormData` (browser) or `NodeFormData` (Node.js) containing files to upload.

#### Returns:

-   A promise that resolves to a `KonectyResult<KonFiles.FileConfig>` containing the uploaded file's configuration.

#### Example:

```typescript
const formData = new FormData();
formData.append('file', yourFile);

const result = await filesManager.upload(formData);
if (result.success) {
	console.log('File uploaded successfully:', result.data);
} else {
	console.error('Upload failed:', result.errors);
}
```

### `deleteFile(fileName: string): Promise<KonectyResult<'no-data'>>`

Deletes a file by its name from the Konecty record.

#### Parameters:

-   `fileName`: The name of the file to delete.

#### Returns:

-   A promise that resolves to a `KonectyResult<'no-data'>`.

#### Example:

```typescript
const result = await filesManager.deleteFile('file1');
if (result.success) {
	console.log('File deleted successfully');
} else {
	console.error('Deletion failed:', result.errors);
}
```

### `reorder(fileName: string, newPosition: number, reorderMode?: 'swap' | 'push'): Promise<KonectyResult<'no-data'>>`

Reorders a single file in the list.

#### Parameters:

-   `fileName`: The name of the file to reorder.
-   `newPosition`: The new position of the file in the list.
-   `reorderMode`: (Optional) The mode of reordering, either `'swap'` or `'push'`. Defaults to `'push'`.

#### Returns:

-   A promise that resolves to a `KonectyResult<'no-data'>`.

#### Example:

```typescript
await filesManager.reorder('file2', 0, 'push');
```

### `reorder(positions: string[]): Promise<KonectyResult<'no-data'>>`

Reorders multiple files based on a new order of positions.

#### Parameters:

-   `positions`: An array of file names representing the new order of files.

#### Returns:

-   A promise that resolves to a `KonectyResult<'no-data'>`.

#### Example:

```typescript
await filesManager.reorder(['file3', 'file1', 'file2']);
```

### `toJson(): KonFiles.FileConfig[]`

Converts the list of managed files to a JSON-compatible array of `KonFiles.FileConfig` objects.

#### Returns:

-   An array of `KonFiles.FileConfig` objects.

#### Example:

```typescript
const filesJson = filesManager.toJson();
console.log(filesJson);
```

## Example Usage

```typescript
const recordData = {
	recordId: '123',
	fieldName: 'pictures',
	files: pictures,
};

// Initialize FilesManager
const filesManager = new FilesManager(konectyClientOpts, recordData);

// Upload a file
const uploadResult = await filesManager.upload(formData);

// Delete a file
const deleteResult = await filesManager.deleteFile('file1');

// Reorder files
await filesManager.reorder('file2', 0, 'swap');

// Get files as JSON
const filesJson = filesManager.toJson();
```

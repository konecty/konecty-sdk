![Konecty](./docs/logo-konecty.png)

![npm shield](https://img.shields.io/npm/v/@konecty/sdk?style=flat-square)

# Konecty SDK

| :bangbang: | This is a work in progress package. Follow us for updates. |
| :--------: | :--------------------------------------------------------- |

---

#### Files manager

You can read the [full documentation here.](./docs/FilesManager.md)

| Method  | Signature                                                                                                           | Description                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| upload  | `upload(formData: FormData \| NodeFormData): Promise<KonectyResult<KonFiles.FileConfig>>`                           | Uploads all files present in the provided `FormData` to the Konecty server.                     |
| delete  | `deleteFile(fileName: string): Promise<KonectyResult<'no-data'>>`                                                   | Deletes a file by its name from the Konecty record.                                             |
| reorder | `reorder(fileName: string, newPosition: number, reorderMode?: 'swap' \| 'push'): Promise<KonectyResult<'no-data'>>` | Reorders a single file in the list to a new position, using either 'swap' or 'push' mode.       |
| reorder | `reorder(positions: string[]): Promise<KonectyResult<'no-data'>>`                                                   | Reorders multiple files based on a new order of positions provided as an array of file names.   |
| toJson  | `toJson(): KonFiles.FileConfig[]`                                                                                   | Converts the list of managed files to a JSON-compatible array of `KonFiles.FileConfig` objects. |

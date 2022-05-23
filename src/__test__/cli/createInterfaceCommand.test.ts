import { expect } from 'chai';
import fs, { Stats } from 'fs';
import path from 'path';
import createProgram from '../../cli/createProgram';

jest.mock('fs');
jest.mock('mkdirp');
jest.mock('path');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mocketPath = path as jest.Mocked<typeof path>;

describe('Konecty command line tool create command', () => {
	beforeEach(() => {
		mockedFs.writeFileSync.mockReset();
	});

	it('Should create typescript classes from metadata', async () => {
		// Arrange
		jest.spyOn(mockedFs, 'writeFileSync');
		const userMetadataContent = `
        {
            "_id": "User",
            "collection": "users",
            "description": {
                "en": "System users",
                "pt_BR": "Usuários do sistema"
            },
            "fields": {
                "active": {
                    "defaultValue": true,
                    "type": "boolean",
                    "name": "active",
                    "label": {
                        "en": "Active",
                        "pt_BR": "Ativo"
                    },
                    "isRequired": true,
                    "isSortable": true,
                    "isInherited": true
                },
                "_createdAt": {
                    "label": {
                        "en": "Created At",
                        "pt_BR": "Criado em"
                    },
                    "isSortable": true,
                    "type": "dateTime",
                    "name": "_createdAt",
                    "isInherited": true
                },
                "_createdBy": {
                    "type": "lookup",
                    "name": "_createdBy",
                    "label": {
                        "en": "Created by",
                        "pt_BR": "Criado por"
                    },
                    "isSortable": true,
                    "document": "User",
                    "descriptionFields": ["name", "group.name"],
                    "isInherited": true
                },
                "_updatedAt": {
                    "type": "dateTime",
                    "name": "_updatedAt",
                    "label": {
                        "pt_BR": "Atualizado em",
                        "en": "Updated At"
                    },
                    "isSortable": true,
                    "isInherited": true
                },
                "_updatedBy": {
                    "label": {
                        "en": "Updated by",
                        "pt_BR": "Atualizado por"
                    },
                    "document": "User",
                    "descriptionFields": ["name", "group.name"],
                    "type": "lookup",
                    "name": "_updatedBy",
                    "isInherited": true
                },
                "_user": {
                    "descriptionFields": ["name", "group.name", "active"],
                    "detailFields": ["phone", "emails"],
                    "type": "lookup",
                    "name": "_user",
                    "label": {
                        "en": "User",
                        "pt_BR": "Usuário"
                    },
                    "isSortable": true,
                    "isList": true,
                    "document": "User",
                    "isInherited": true
                }
            },
        
            "icon": "user",
            "label": {
                "en": "User",
                "pt_BR": "Usuário"
            },
            "menuSorter": 10,
            "name": "User",
            "namespace": ["base"],
            "plurals": {
                "en": "Users",
                "pt_BR": "Usuários"
            },
            "saveHistory": true,
            "type": "document",
            "parent": "base:User"
        }
        `;
		const packageJsonContent = `{ "version": "1.0.0" }`;
		const inputFile = './metadata/User.json';
		const outputFile = './types/User.ts';

		mocketPath.resolve.mockReturnValue('/dev/null');

		mockedFs.statSync.mockReturnValueOnce({ isFile: () => true } as Stats);

		mockedFs.readFileSync.mockReturnValueOnce(packageJsonContent).mockReturnValueOnce(userMetadataContent);

		// Act
		const program = createProgram();
		program.parse(['node', 'konecty', 'create', 'class', '-i', inputFile, '-o', outputFile]);

		// Assert
		expect(mockedFs.writeFileSync.mock.calls.length).to.equal(1);
	});
});

import { expect } from 'chai';
import fs, { Stats } from 'fs';
import path from 'path';
import createProgram from '../../cli/createProgram';

jest.mock('fs');
jest.mock('mkdirp');
jest.mock('path');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mocketPath = path as jest.Mocked<typeof path>;

describe('Konecty cli create doc command', () => {
	beforeEach(() => {
		mockedFs.writeFileSync.mockReset();
	});
	afterAll(async () => {
		mockedFs.writeFileSync.mockReset();
	});
	it('should create a documentation for User meta', async () => {
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

		const expectedOutput = `# User

| Config | Value |
| ------ | ----- |
| \`collection\` | users |
| \`description\` | <pre lang=\"yaml\">en: System users<br/>pt_BR: Usuários do sistema<br/></pre> |
| \`icon\` | user |
| \`label\` | <pre lang=\"yaml\">en: User<br/>pt_BR: Usuário<br/></pre> |
| \`menuSorter\` | 10 |
| \`name\` | User |
| \`namespace\` | <pre lang=\"yaml\">- base<br/></pre> |
| \`plurals\` | <pre lang=\"yaml\">en: Users<br/>pt_BR: Usuários<br/></pre> |
| \`saveHistory\` | true |
| \`type\` | document |
| \`parent\` | base:User |
## Fields

| key | label | type | required | list | options | other |
| --- | ----- | ---- | -------- | ---- | ------- | ----- |
| \`active\` | <pre lang=\"yaml\">en: Active<br/>pt_BR: Ativo<br/></pre> | \`boolean\` | \`true\` | \`false\` |  | \`defaultValue\`: true<br/>\`isSortable\`: true<br/>\`isInherited\`: true |
| \`_createdAt\` | <pre lang=\"yaml\">en: Created At<br/>pt_BR: Criado em<br/></pre> | \`dateTime\` | \`false\` | \`false\` |  | \`isSortable\`: true<br/>\`isInherited\`: true |
| \`_createdBy\` | <pre lang=\"yaml\">en: Created by<br/>pt_BR: Criado por<br/></pre> | \`lookup\` | \`false\` | \`false\` |  | \`document\`: User<br/>\`descriptionFields\`: <pre lang=\"yaml\">- name<br/>- group.name<br/></pre><br/>\`isSortable\`: true<br/>\`isInherited\`: true |
| \`_updatedAt\` | <pre lang=\"yaml\">pt_BR: Atualizado em<br/>en: Updated At<br/></pre> | \`dateTime\` | \`false\` | \`false\` |  | \`isSortable\`: true<br/>\`isInherited\`: true |
| \`_updatedBy\` | <pre lang=\"yaml\">en: Updated by<br/>pt_BR: Atualizado por<br/></pre> | \`lookup\` | \`false\` | \`false\` |  | \`document\`: User<br/>\`descriptionFields\`: <pre lang=\"yaml\">- name<br/>- group.name<br/></pre><br/>\`isInherited\`: true |
| \`_user\` | <pre lang=\"yaml\">en: User<br/>pt_BR: Usuário<br/></pre> | \`lookup\` | \`false\` | \`true\` |  | \`document\`: User<br/>\`descriptionFields\`: <pre lang=\"yaml\">- name<br/>- group.name<br/>- active<br/></pre><br/>\`detailFields\`: <pre lang=\"yaml\">- phone<br/>- emails<br/></pre><br/>\`isSortable\`: true<br/>\`isInherited\`: true |
`;
		const packageJsonContent = `{ "version": "1.0.0" }`;
		const inputFile = './metadata/User.json';
		const outputFile = './docs/User.md';

		mocketPath.resolve.mockReturnValue(outputFile);

		mockedFs.statSync.mockReturnValueOnce({ isFile: () => true } as Stats);

		mockedFs.readFileSync.mockReturnValueOnce(packageJsonContent).mockReturnValueOnce(userMetadataContent);

		// Act
		const program = createProgram();
		await program.parse(['node', 'konecty', 'create', 'doc', inputFile, '-o', outputFile]);

		// Assert
		expect(mockedFs.writeFileSync.mock.calls.length).to.equal(1);
		expect(mockedFs.writeFileSync.mock.calls[0][0]).to.equal(outputFile);
		expect(mockedFs.writeFileSync.mock.calls[0][1]).to.equal(expectedOutput);
	});
});

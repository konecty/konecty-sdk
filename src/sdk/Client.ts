import { isBrowser, isNode } from 'browser-or-node';
import crypto from 'crypto';
import fetch from 'isomorphic-fetch';
import Cookies from 'js-cookie';
import get from 'lodash/get';
import qs from 'qs';
import { UserGroupType } from './User';

import { PickFromPath, UnionToIntersection } from '@konecty/sdk/TypeUtils';
import logger from '../lib/logger';
import { deserializeDates, serializeDates } from '../utils/dateSerialization';
import getGeolocation from '../utils/getGeolocation';
import * as changeUserDomain from './domains/changeUser';
import * as commentsDomain from './domains/comments';
import * as exportDomain from './domains/export';
import * as fileDownloadDomain from './domains/fileDownload';
import * as graphDomain from './domains/graph';
import * as kpiDomain from './domains/kpi';
import * as notificationsDomain from './domains/notifications';
import * as pivotDomain from './domains/pivot';
import * as queryDomain from './domains/query';
import * as streamDomain from './domains/stream';
import * as subscriptionsDomain from './domains/subscriptions';
import { KonectyDocument } from './Module';
import { User } from './User';
import { DocumentTranslation, List, Menu, ZipCodeEntry } from './types';
import { MetaAccess, UpdateAccessPayload } from './types/access';
import type { CrossModuleQuery } from './types/crossModuleQuery';
import type { KpiConfig, KpiResult } from './types/query';

export interface KonectyClientOptions {
	credentialsFile?: string;
	endpoint?: string;
	accessKey?: string;
	fileManager?: {
		providerUrl?: string;
		origin?: string;
	};
}

export type KonectyFindParams = {
	filter: object;
	start?: number;
	limit?: number;
	sort?: Array<object>;
	fields?: Array<string | number | symbol>;
};

export type History = {
	_id: number;
	type: 'create' | 'update';
	createdAt: Date;
	createdBy: {
		group: UserGroupType;
		name: string;
		_id: string;
	};
	dataId: string;
	diffs: {
		[key: string]: {
			to: any;
		};
	};
};

export type KonectyFindResult<T = object> = {
	success: boolean;
	total?: number;
	data?: Array<T>;
	errors?: string[] | { message: string }[];
};

export type KonectyGetMetaResult<T> = {
	success: boolean;
	data?: T;
	errors?: string[] | { message: string }[];
};

export type KonectyLoginResult = {
	success: boolean;
	authId?: string;
	user?: UnionToIntersection<
		PickFromPath<User, 'access' | 'admin' | 'email' | 'group' | 'locale' | 'login' | 'name' | 'role' | '_id'>
	>;
	errors?: string[];
};

export type KonectyUserInfo = {
	logged: boolean;
	user?: User;
	errors?: string[];
};

export type KonectyNextOnQueueResult = {
	success: boolean;
	user?: {
		_id: string;
		user: UnionToIntersection<PickFromPath<User, '_id' | 'director' | 'group' | 'emails' | 'name' | 'code'>>;
		queue: {
			_id: string;
			name: string;
		};
		count: number;
		order: number;
		_user: Array<UnionToIntersection<PickFromPath<User, '_id' | 'group' | 'name'>>>;
		_createdAt: Date;
		_updatedAt: Date;
		_createdBy: Array<UnionToIntersection<PickFromPath<User, '_id' | 'group' | 'name'>>>;
		_updatedBy: Array<UnionToIntersection<PickFromPath<User, '_id' | 'group' | 'name'>>>;
	};
};
export class KonectyClient {
	static defaults: KonectyClientOptions = {};
	#options: KonectyClientOptions;

	constructor(options?: KonectyClientOptions) {
		this.#options = Object.assign({}, KonectyClient.defaults, options);

		if (isNode && this.#options.credentialsFile != null) {
		}
	}

	get options() {
		return this.#options;
	}

	// #region CRUD
	async find<T = KonectyDocument>(module: string, options: KonectyFindParams): Promise<KonectyFindResult<T & KonectyDocument>> {
		try {
			const params = new URLSearchParams();
			Object.keys(options).forEach(key => {
				if (key === 'fields') {
					params.set(key, (options.fields ?? []).map(String).join(','));
				} else {
					params.set(key, JSON.stringify(serializeDates(get(options, key))));
				}
			});
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}/find?${params.toString()}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<T & KonectyDocument>;
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async create<T = KonectyDocument>(module: string, data: object): Promise<KonectyFindResult<T & KonectyDocument>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}`, {
				method: 'POST',
				headers: {
					Authorization: `${this.#options.accessKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serializeDates(data)),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<T & KonectyDocument>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async update<T = KonectyDocument>(
		module: string,
		data: object,
		ids: object[],
	): Promise<KonectyFindResult<T & KonectyDocument>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}`, {
				method: 'PUT',
				headers: {
					Authorization: `${this.#options.accessKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serializeDates({ ids, data })),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<T & KonectyDocument>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async delete(module: string, ids: object[]): Promise<KonectyFindResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}`, {
				method: 'DELETE',
				headers: {
					Authorization: `${this.#options.accessKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serializeDates({ ids })),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	// #endregion

	async findStream<T = KonectyDocument>(
		module: string,
		options: KonectyFindParams,
		includeTotal?: boolean,
	): Promise<{ stream: AsyncGenerator<T & KonectyDocument>; total?: number }> {
		return streamDomain.findStream(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			options as streamDomain.StreamFindParams,
			includeTotal,
		) as Promise<{ stream: AsyncGenerator<T & KonectyDocument>; total?: number }>;
	}

	async streamCount(
		module: string,
		params: Pick<KonectyFindParams, 'filter'> & {
			displayName?: string;
			displayType?: string;
			sort?: Array<object>;
			withDetailFields?: boolean;
		},
	): Promise<{ success: boolean; total: number }> {
		return streamDomain.streamCount(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			params,
		);
	}

	async downloadFile(
		document: string,
		recordCode: string,
		fieldName: string,
		fileName: string,
	): Promise<ArrayBuffer> {
		return fileDownloadDomain.downloadFile(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			document,
			recordCode,
			fieldName,
			fileName,
		);
	}

	async downloadImage(
		document: string,
		recordId: string,
		fieldName: string,
		fileName: string,
		style?: 'full' | 'thumb' | 'wm',
	): Promise<ArrayBuffer> {
		return fileDownloadDomain.downloadImage(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			document,
			recordId,
			fieldName,
			fileName,
			style,
		);
	}

	async getKpi(module: string, kpiConfig: KpiConfig, params?: Partial<KonectyFindParams>): Promise<KpiResult> {
		return kpiDomain.getKpi(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			kpiConfig,
			params as Partial<streamDomain.StreamFindParams>,
		);
	}

	async exportList(
		module: string,
		listName: string,
		format: 'csv' | 'xlsx' | 'json',
		options?: KonectyFindParams,
	): Promise<ArrayBuffer> {
		return exportDomain.exportList(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			listName,
			format,
			options as Partial<streamDomain.StreamFindParams>,
		);
	}

	async getComments<T = unknown>(document: string, dataId: string): Promise<T> {
		return commentsDomain.getComments(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			document,
			dataId,
		);
	}

	async createComment<T = unknown>(
		document: string,
		dataId: string,
		text: string,
		parentId?: string,
	): Promise<T> {
		return commentsDomain.createComment(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			document,
			dataId,
			text,
			parentId,
		);
	}

	async updateComment<T = unknown>(
		document: string,
		dataId: string,
		commentId: string,
		text: string,
	): Promise<T> {
		return commentsDomain.updateComment(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			document,
			dataId,
			commentId,
			text,
		);
	}

	async deleteComment<T = unknown>(
		document: string,
		dataId: string,
		commentId: string,
	): Promise<T> {
		return commentsDomain.deleteComment(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			document,
			dataId,
			commentId,
		);
	}

	async searchCommentUsers<T = unknown>(
		document: string,
		dataId: string,
		query: string,
	): Promise<T> {
		return commentsDomain.searchCommentUsers(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			document,
			dataId,
			query,
		);
	}

	async searchComments<T = unknown>(
		document: string,
		dataId: string,
		params?: commentsDomain.SearchCommentsParams,
	): Promise<T> {
		return commentsDomain.searchComments(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			document,
			dataId,
			params,
		);
	}

	async getSubscriptionStatus<T = unknown>(module: string, dataId: string): Promise<T> {
		return subscriptionsDomain.getSubscriptionStatus(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			dataId,
		);
	}

	async subscribe<T = unknown>(module: string, dataId: string): Promise<T> {
		return subscriptionsDomain.subscribe(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			dataId,
		);
	}

	async unsubscribe<T = unknown>(module: string, dataId: string): Promise<T> {
		return subscriptionsDomain.unsubscribe(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			dataId,
		);
	}

	async listNotifications<T = unknown>(params?: {
		read?: boolean;
		page?: number;
		limit?: number;
	}): Promise<T> {
		return notificationsDomain.listNotifications(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			params,
		);
	}

	async getUnreadNotificationCount<T = unknown>(): Promise<T> {
		return notificationsDomain.getUnreadNotificationCount({
			endpoint: this.#options.endpoint!,
			accessKey: this.#options.accessKey,
		});
	}

	async markNotificationRead<T = unknown>(notificationId: string): Promise<T> {
		return notificationsDomain.markNotificationRead(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			notificationId,
		);
	}

	async markAllNotificationsRead<T = unknown>(): Promise<T> {
		return notificationsDomain.markAllNotificationsRead({
			endpoint: this.#options.endpoint!,
			accessKey: this.#options.accessKey,
		});
	}

	async changeUserAdd<T = unknown>(
		module: string,
		ids: unknown[],
		data?: unknown,
	): Promise<T> {
		return changeUserDomain.changeUserAdd(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			ids,
			data,
		);
	}

	async changeUserRemove<T = unknown>(
		module: string,
		ids: unknown[],
		data?: unknown,
	): Promise<T> {
		return changeUserDomain.changeUserRemove(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			ids,
			data,
		);
	}

	async changeUserDefine<T = unknown>(
		module: string,
		ids: unknown[],
		data?: unknown,
	): Promise<T> {
		return changeUserDomain.changeUserDefine(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			ids,
			data,
		);
	}

	async changeUserReplace<T = unknown>(
		module: string,
		ids: unknown[],
		data: { from?: string; to?: string },
	): Promise<T> {
		return changeUserDomain.changeUserReplace(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			ids,
			data,
		);
	}

	async changeUserCountInactive<T = unknown>(module: string, ids: unknown[]): Promise<T> {
		return changeUserDomain.changeUserCountInactive(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			ids,
		);
	}

	async changeUserRemoveInactive<T = unknown>(module: string, ids: unknown[]): Promise<T> {
		return changeUserDomain.changeUserRemoveInactive(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			ids,
		);
	}

	async changeUserSetQueue<T = unknown>(
		module: string,
		ids: unknown[],
		data?: unknown,
	): Promise<T> {
		return changeUserDomain.changeUserSetQueue(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			ids,
			data,
		);
	}

	async executeQueryJson<T = object>(
		body: CrossModuleQuery,
	): Promise<{ stream: AsyncGenerator<T>; total?: number }> {
		return queryDomain.executeQueryJson(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			body,
		);
	}

	async executeQuerySql<T = object>(
		sql: string,
		options?: { includeTotal?: boolean; includeMeta?: boolean },
	): Promise<{ stream: AsyncGenerator<T>; total?: number }> {
		return queryDomain.executeQuerySql(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			sql,
			options,
		);
	}

	async listSavedQueries<T = unknown>(): Promise<T> {
		return queryDomain.listSavedQueries({
			endpoint: this.#options.endpoint!,
			accessKey: this.#options.accessKey,
		});
	}

	async getSavedQuery<T = unknown>(id: string): Promise<T> {
		return queryDomain.getSavedQuery(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			id,
		);
	}

	async createSavedQuery<T = unknown>(payload: {
		name: string;
		description?: string;
		query: Record<string, unknown>;
	}): Promise<T> {
		return queryDomain.createSavedQuery(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			payload,
		);
	}

	async updateSavedQuery<T = unknown>(
		id: string,
		payload: { name?: string; description?: string; query?: Record<string, unknown> },
	): Promise<T> {
		return queryDomain.updateSavedQuery(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			id,
			payload,
		);
	}

	async deleteSavedQuery<T = unknown>(id: string): Promise<T> {
		return queryDomain.deleteSavedQuery(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			id,
		);
	}

	async shareSavedQuery<T = unknown>(id: string, payload: Record<string, unknown>): Promise<T> {
		return queryDomain.shareSavedQuery(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			id,
			payload,
		);
	}

	async getGraph(
		module: string,
		graphConfig: import('./types/graph').GraphConfig,
		params?: Partial<KonectyFindParams>,
	): Promise<string> {
		return graphDomain.getGraph(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			graphConfig,
			params as Partial<streamDomain.StreamFindParams>,
		);
	}

	async getPivot<T = unknown>(
		module: string,
		pivotConfig: import('./types/pivot').PivotConfig,
		params?: Partial<KonectyFindParams>,
	): Promise<T> {
		return pivotDomain.getPivot(
			{ endpoint: this.#options.endpoint!, accessKey: this.#options.accessKey },
			module,
			pivotConfig,
			params as Partial<streamDomain.StreamFindParams>,
		);
	}

	async getHistory(module: string, _id: string): Promise<KonectyFindResult<History>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}/${_id}/history`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			const deserializedDates = deserializeDates(body) as KonectyFindResult<History>;

			return {
				success: true,
				data: deserializedDates.data,
				total: deserializedDates.data?.length ?? 0,
			};
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async login(
		user: string,
		password: string,
		extraData?: {
			geolocation?: { longitude: number; latitude: number };
			resolution?: { width: number; height: number };
			source?: string;
			disableSetCookie?: boolean;
		},
	): Promise<KonectyLoginResult> {
		try {
			if (isBrowser && extraData?.geolocation == null) {
				const geo = await getGeolocation();
				extraData = Object.assign({}, extraData ?? {}, { geolocation: geo });
			}

			const loginPayload = Object.assign(
				{
					user,

					password: crypto.createHash('md5').update(password).digest('hex'),
					password_SHA256: crypto.createHash('sha256').update(password).digest('hex'),
				},
				extraData ?? {},
			);
			const result = await fetch(`${this.#options.endpoint}/rest/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: qs.stringify(loginPayload),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = (await result.json()) as KonectyLoginResult;

			if (body.success) {
				this.#options.accessKey = body.authId;

				if (isBrowser && extraData?.disableSetCookie !== true) {
					Cookies.set('_authTokenId', body.authId as string);
				}
			}

			return body;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async logout(): Promise<boolean> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/auth/logout`, {
				method: 'GET',
				credentials: 'include',
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = (await result.json()) as KonectyLoginResult;

			if (body.success) {
				if (isBrowser) {
					Cookies.remove('_authTokenId');
				}
				return true;
			}

			return false;
		} catch (err) {
			logger.error(err);
			return false;
		}
	}

	async getMenu(menu = 'main'): Promise<KonectyFindResult<Menu>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/menu/${menu}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyFindResult<Menu>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getListView(module: string, id = 'Default'): Promise<KonectyGetMetaResult<List>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/list-view/${module}/${id}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyGetMetaResult<List>;
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getDocumentNew(name: string): Promise<KonectyGetMetaResult<DocumentTranslation>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/document/${name}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyGetMetaResult<DocumentTranslation>;
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getForm(module: string, id = 'Default'): Promise<KonectyGetMetaResult<any>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/form/${module}/${id}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			};
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getMetasByDocument(document: string): Promise<KonectyGetMetaResult<any[]>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/metas/${document}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body) as any[],
			};
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async info(token?: string, disableSetCookie?: boolean): Promise<KonectyUserInfo> {
		try {
			const userToken = this.#getToken(token);

			if (userToken == null) {
				return { logged: false };
			}

			const result = await fetch(`${this.#options.endpoint}/rest/auth/info`, {
				method: 'GET',
				headers: {
					Authorization: userToken,
				},
			});

			if (result.status >= 400) {
				return { logged: false };
			}

			const body = (await result.json()) as KonectyUserInfo;

			if (body.logged) {
				this.#options.accessKey = userToken;

				if (isBrowser && disableSetCookie !== true) {
					Cookies.set('_authTokenId', userToken);
				}
			}

			return body;
		} catch (err) {
			logger.error(err);
			return {
				logged: false,
				errors: [(err as Error).message],
			};
		}
	}

	async lookup<T>(module: string, field: string, search: string, options?: KonectyFindParams): Promise<KonectyFindResult<T>> {
		try {
			const params = new URLSearchParams();
			params.set('search', search);
			params.set('page', '1');
			params.set('start', '0');
			params.set('limit', '100');

			if (options != null) {
				Object.keys(options).forEach(key => {
					params.set(key, JSON.stringify(serializeDates(get(options, key))));
				});
			}

			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}/lookup/${field}?${params.toString()}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<T>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	#getToken(token?: string): string | null | undefined {
		if (token != null) {
			return token;
		}
		if (isBrowser) {
			return Cookies.get('_authTokenId');
		}
	}

	async getDocuments(): Promise<KonectyFindResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/menu/documents`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getDocument(name: string): Promise<KonectyFindResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/menu/documents/${name}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getNextOnQueue(queueId: string): Promise<KonectyNextOnQueueResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/Queue/queue/next/${queueId}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyNextOnQueueResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
			};
		}
	}

	async getAddressByZipCode(zipCode: string): Promise<KonectyFindResult<ZipCodeEntry>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/dne/cep/${zipCode}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyFindResult<ZipCodeEntry>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getAccesses(document: string): Promise<KonectyFindResult<MetaAccess>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/access/${document}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<MetaAccess>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getAccess(document: string, accessName: string): Promise<KonectyGetMetaResult<MetaAccess>> {
		const allAccesses = await this.getAccesses(document);
		if (allAccesses.success) {
			const access = allAccesses.data?.find(a => a.name === accessName);

			return { success: access != null, data: access, errors: access == null ? ['Access not found'] : undefined };
		}

		return allAccesses as KonectyGetMetaResult<MetaAccess>;
	}

	async updateAccess(
		document: string,
		accessName: string,
		payload: UpdateAccessPayload,
	): Promise<KonectyGetMetaResult<MetaAccess>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/access/${document}/${accessName}`, {
				method: 'PUT',
				headers: {
					Authorization: `${this.#options.accessKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serializeDates(payload)),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyGetMetaResult<MetaAccess>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}
}

export type { KpiConfig, KpiResult } from './types/query';

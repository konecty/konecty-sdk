import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

export type FileDownloadClientOptions = {
	endpoint: string;
	accessKey?: string;
};

/**
 * Download file from Konecty file storage.
 * Path: GET /rest/file/:document/:code/:fieldName/:fileName
 */
export async function downloadFile(
	opts: FileDownloadClientOptions,
	document: string,
	recordCode: string,
	fieldName: string,
	fileName: string,
): Promise<ArrayBuffer> {
	const url = `${opts.endpoint}/rest/file/${document}/${recordCode}/${fieldName}/${encodeURIComponent(fileName)}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: opts.accessKey ?? '',
		},
	});

	if (response.status >= 400) {
		const errBody = await response.text();
		logger.error(`${response.status} ${response.statusText}`, { url, body: errBody });
		throw new Error(`${response.status} - ${response.statusText}`);
	}

	return response.arrayBuffer();
}

export type ImageStyle = 'full' | 'thumb' | 'wm';

/**
 * Download image from Konecty. Optional style: full (default), thumb (thumbnail), wm (watermark).
 * Full: GET /rest/image/:document/:recordId/:fieldName/:fileName
 * Style: GET /rest/image/:style/:document/:recordId/:fieldName/:fileName
 */
export async function downloadImage(
	opts: FileDownloadClientOptions,
	document: string,
	recordId: string,
	fieldName: string,
	fileName: string,
	style?: ImageStyle,
): Promise<ArrayBuffer> {
	const encodedFileName = encodeURIComponent(fileName);
	const path =
		style != null && style !== 'full'
			? `rest/image/${style}/${document}/${recordId}/${fieldName}/${encodedFileName}`
			: `rest/image/${document}/${recordId}/${fieldName}/${encodedFileName}`;
	const url = `${opts.endpoint}/${path}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: opts.accessKey ?? '',
		},
	});

	if (response.status >= 400) {
		const errBody = await response.text();
		logger.error(`${response.status} ${response.statusText}`, { url, body: errBody });
		throw new Error(`${response.status} - ${response.statusText}`);
	}

	return response.arrayBuffer();
}

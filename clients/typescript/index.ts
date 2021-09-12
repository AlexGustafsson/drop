/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ArchiveRequest {
  /** Name of the archive. */
  name: string;

  /**
   * The maximum number of files allowed to be uploaded. Use 0 to allow any count.
   * @min 0
   */
  maximumFileCount: number;

  /**
   * The maximum size of an uploaded file. Use 0 to allow any size.
   * @min 0
   */
  maximumFileSize: number;

  /**
   * The total maximum size of the uploaded files. use 0 to allow any size.
   * @min 0
   */
  maximumSize: number;
}

export interface ArchiveResponse {
  id: string;

  /** The UTC timestamp at which the archive was created. */
  created: number;

  /** Name of the archive. */
  name: string;

  /** The maximum number of files allowed to be uploaded. Use 0 to allow any count. */
  maximumFileCount: number;

  /** The maximum size of an uploaded file. Use 0 to allow any size. */
  maximumFileSize: number;

  /** The total maximum size of the uploaded files. use 0 to allow any size. */
  maximumSize: number;

  /** The files stored in the archive. */
  files: FileResponse[];
}

export interface ArchivesResponse {
  archives: ArchiveResponse[];
}

export interface TokenRequest {
  /** The number of seconds the token should be valid. */
  lifetime: number;
}

export interface TokenResponse {
  id: string;

  /** The UTC timestamp at which the token was created. */
  created: number;

  /** Token with upload access to the archive. */
  token: string;
}

export interface TokensResponse {
  tokens: { id?: string; created?: number }[];
}

export interface FileRequest {
  /** Name of the file. */
  name: string;

  /** The UTC timestamp when the file was last modified. */
  lastModified: number;

  /** Size in bytes. */
  size: number;

  /** The MIME type of the file. */
  mime: string;
}

export interface FileResponse {
  /** The id of the file. */
  id: string;

  /** The id of the archive the file belongs to. */
  archiveId: string;

  /** The UTC timestamp at which the file was created. */
  created: number;

  /** Name of the file. */
  name: string;

  /** The UTC timestamp when the file was last modified. */
  lastModified: number;

  /** Size in bytes. */
  size: number;

  /** The MIME type of the file. */
  mime: string;
}

export interface FilesResponse {
  files: FileResponse[];
}

export interface ErrorResponse {
  error: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:8080/api/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Drop
 * @version 0.1.0
 * @baseUrl http://localhost:8080/api/v1
 *
 * A self-hosted, end-to-end encrypted personal file sharing service
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  admin = {
    /**
     * No description
     *
     * @tags Admin Tokens
     * @name TokensList
     * @summary Retrieve all admin tokens.
     * @request GET:/admin/tokens
     * @secure
     */
    tokensList: (params: RequestParams = {}) =>
      this.request<TokensResponse, any>({
        path: `/admin/tokens`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Admin Tokens
     * @name TokensDetail
     * @summary Retrieve an admin token.
     * @request GET:/admin/tokens/{tokenId}
     * @secure
     */
    tokensDetail: (tokenId: string, params: RequestParams = {}) =>
      this.request<TokenResponse, any>({
        path: `/admin/tokens/${tokenId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Admin Tokens
     * @name TokensDelete
     * @summary Delete a token for an archive.
     * @request DELETE:/admin/tokens/{tokenId}
     * @secure
     */
    tokensDelete: (tokenId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/admin/tokens/${tokenId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  archives = {
    /**
     * No description
     *
     * @tags Archives
     * @name ArchivesList
     * @summary List all archives.
     * @request GET:/archives
     * @secure
     */
    archivesList: (params: RequestParams = {}) =>
      this.request<ArchivesResponse, any>({
        path: `/archives`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Archives
     * @name ArchivesCreate
     * @summary Create an archive.
     * @request POST:/archives
     * @secure
     */
    archivesCreate: (data: ArchiveRequest, params: RequestParams = {}) =>
      this.request<ArchiveResponse, any>({
        path: `/archives`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Archives
     * @name ArchivesDetail
     * @summary Retrieve an archive.
     * @request GET:/archives/{archiveId}
     * @secure
     */
    archivesDetail: (archiveId: string, params: RequestParams = {}) =>
      this.request<ArchiveResponse, any>({
        path: `/archives/${archiveId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Archives
     * @name ArchivesDelete
     * @summary Delete an archive.
     * @request DELETE:/archives/{archiveId}
     * @secure
     */
    archivesDelete: (archiveId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/archives/${archiveId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Archive Tokens
     * @name TokensDetail
     * @summary Retrieve tokens for an archive.
     * @request GET:/archives/{archiveId}/tokens
     * @secure
     */
    tokensDetail: (archiveId: string, params: RequestParams = {}) =>
      this.request<TokensResponse, any>({
        path: `/archives/${archiveId}/tokens`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Archive Tokens
     * @name TokensCreate
     * @summary Create a token for an archive.
     * @request POST:/archives/{archiveId}/tokens
     * @secure
     */
    tokensCreate: (archiveId: string, data: TokenRequest, params: RequestParams = {}) =>
      this.request<TokenResponse, any>({
        path: `/archives/${archiveId}/tokens`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Archive Tokens
     * @name TokensDetail2
     * @summary Retrieve a token for an archive.
     * @request GET:/archives/{archiveId}/tokens/{tokenId}
     * @originalName tokensDetail
     * @duplicate
     * @secure
     */
    tokensDetail2: (archiveId: string, tokenId: string, params: RequestParams = {}) =>
      this.request<TokenResponse, any>({
        path: `/archives/${archiveId}/tokens/${tokenId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Archive Tokens
     * @name TokensDelete
     * @summary Delete a token for an archive.
     * @request DELETE:/archives/{archiveId}/tokens/{tokenId}
     * @secure
     */
    tokensDelete: (archiveId: string, tokenId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/archives/${archiveId}/tokens/${tokenId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesDetail
     * @summary Retrieve all files for an archive.
     * @request GET:/archives/{archiveId}/files
     * @secure
     */
    filesDetail: (archiveId: string, params: RequestParams = {}) =>
      this.request<FilesResponse, any>({
        path: `/archives/${archiveId}/files`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesCreate
     * @summary Create a file.
     * @request POST:/archives/{archiveId}/files
     * @secure
     */
    filesCreate: (archiveId: string, data: FileRequest, params: RequestParams = {}) =>
      this.request<FileResponse, void>({
        path: `/archives/${archiveId}/files`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesDetail2
     * @summary Retrieve a file.
     * @request GET:/archives/{archiveId}/files/{fileId}
     * @originalName filesDetail
     * @duplicate
     * @secure
     */
    filesDetail2: (archiveId: string, fileId: string, params: RequestParams = {}) =>
      this.request<FileResponse, any>({
        path: `/archives/${archiveId}/files/${fileId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesDelete
     * @summary Delete a file.
     * @request DELETE:/archives/{archiveId}/files/{fileId}
     * @secure
     */
    filesDelete: (archiveId: string, fileId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/archives/${archiveId}/files/${fileId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesContentDetail
     * @summary Download bytes of a file.
     * @request GET:/archives/{archiveId}/files/{fileId}/content
     * @secure
     */
    filesContentDetail: (archiveId: string, fileId: string, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/archives/${archiveId}/files/${fileId}/content`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesContentCreate
     * @summary Upload bytes of a file.
     * @request POST:/archives/{archiveId}/files/{fileId}/content
     * @secure
     */
    filesContentCreate: (archiveId: string, fileId: string, data: File, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/archives/${archiveId}/files/${fileId}/content`,
        method: "POST",
        body: data,
        secure: true,
        ...params,
      }),
  };
  files = {
    /**
     * No description
     *
     * @tags Files
     * @name FilesList
     * @summary Retrieve all files.
     * @request GET:/files
     * @secure
     */
    filesList: (params: RequestParams = {}) =>
      this.request<FilesResponse, any>({
        path: `/files`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}

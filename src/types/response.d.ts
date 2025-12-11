export interface Response< T > {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
    duration: number;
    retries: number;
}

export interface ProfileResponse {}

export interface ListResponse {}

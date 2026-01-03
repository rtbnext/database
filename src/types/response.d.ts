export interface TResponse< T > {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
    duration: number;
    retries: number;
}

export interface TWaybackResponse {
    archived_snapshots: {
        closest?: {
            status: string;
            available: boolean;
            url: string;
            timestamp: string;
        };
    };
}

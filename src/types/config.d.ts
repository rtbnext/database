export interface FetchConfig {
    baseUrl: string;
    endpoints: {
        profile: string;
        list: string;
    };
    headers: Record< string, string >;
    agentPool: string[];
    rateLimit: {
        maxBatchSize: number;
        timeout: number;
        retries: number;
        requestDelay: {
            max: number;
            min: number;
        };
    };
}

export interface StorageConfig {}

export interface LoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    console?: boolean;
    file?: boolean;
}

export interface ConfigObject {
    fetch: FetchConfig;
    storage: StorageConfig;
    logging: LoggingConfig;
}

export interface TLoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    console?: boolean;
    file?: boolean;
}

export interface TStorageConfig {
    baseDir: string;
    compressing: boolean;
}

export interface TFetchConfig {
    endpoints: {
        list: string;
        profile: string;
        wikipedia: string;
        commons: string;
        wikidata: string;
        wayback: string;
        wbTest: string;
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

export interface TQueueConfig {
    profileAge: number;
    maxSize: number;
    defaultPrio: number;
}

export interface TConfigObject {
    logging: TLoggingConfig;
    storage: TStorageConfig;
    fetch: TFetchConfig;
    queue: TQueueConfig;
}

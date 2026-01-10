export type TLoggingLevel = 'error' | 'warn' | 'info' | 'debug';

export interface TLoggingConfig {
    level: TLoggingLevel;
    console?: boolean;
    file?: boolean;
}

export interface TJobConfig {
    silent: boolean;
    safeMode: boolean;
}

export interface TStorageConfig {
    baseDir: string;
    compression: boolean;
}

export interface TFetchConfig {
    endpoints: {
        profile: string;
        list: string;
        wikipedia: string;
        commons: string;
        wikidata: string;
        wayback: string;
    };
    headers: Record< string, string >;
    agentPool: string[];
    rateLimit: {
        batchSize: number;
        timeout: number;
        retries: number;
        requestDelay: {
            max: number;
            min: number;
        };
    };
}

export interface TQueueConfig {
    tsThreshold: number;
    maxSize: number;
    defaultPrio: number;
}

export interface TConfigObject {
    logging: TLoggingConfig;
    job: TJobConfig;
    storage: TStorageConfig;
    fetch: TFetchConfig;
    queue: TQueueConfig;
}

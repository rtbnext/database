export interface LoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    console?: boolean;
    file?: boolean;
}

export interface ConfigObject {
    logging: LoggingConfig;
}

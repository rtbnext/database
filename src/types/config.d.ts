export interface LoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    console?: boolean;
    file?: boolean;
}

export interface Config {
    logging: LoggingConfig;
}

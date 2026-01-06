export interface IStorage {
    exists ( path: string ) : boolean;
    assertPath ( path: string ) : void | never;
    ensurePath ( path: string, isDir: boolean = false ) : void;
    scanDir ( path: string, ext: string[] = [ 'json', 'csv' ] ) : string[];
    readJSON< T > ( path: string ) : T | false;
    writeJSON< T > ( path: string, content: T ) : boolean;
    readCSV< T extends any[] > ( path: string ) : T | false;
    writeCSV< T extends any[] > ( path: string, content: T ) : boolean;
    appendCSV< T extends any[] > ( path: string, content: T, nl: boolean = true ) : boolean;
    datedCSV< T extends any[] > ( path: string, content: T, force: boolean = false ) : boolean;
    move ( from: string, to: string, force: boolean = false ) : boolean;
    remove ( path: string, force: boolean = true ) : boolean;
}

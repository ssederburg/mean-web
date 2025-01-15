import odbc from 'odbc'

export class OdbcDb {

    public pool: odbc.Pool | null = null
    
    constructor(private config: IOdbcDbConfig) {
    }

    init(): Promise<odbc.Pool> {
        return new Promise(async(resolve, reject) => {
            try {
                if (this.pool) {
                    return resolve(this.pool)
                }
                const connectionString = `
                    Driver={ODBC Driver 17 for SQL Server};
                    Server=${this.config.dbServer};
                    Database=${this.config.database};
                    UID=${this.config.clientId};
                    PWD=${this.config.secret};
                    Authentication=ActiveDirectoryServicePrincipal;
                    Encrypt=yes;
                    TrustServerCertificate=no;
                    Connection Timeout=30;
                `
                this.pool = await odbc.pool(connectionString)
                
                console.log(`Connection Established`)
                return resolve(this.pool)
            } catch (err) {
                return reject(err)
            }
        })
    }

    query(statement: string): Promise<any> {
        return new Promise(async(resolve, reject) => {
            try {
                const pool: odbc.Pool = await this.init()
                if (!pool || pool instanceof Error) {
                    throw new Error(`Invalid SQL Connection Pool instance`)
                }
                const result = await pool.query(statement)
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }
}

export interface IOdbcDbConfig {
    clientId: string
    secret: string
    dbServer: string
    database: string
}
import express from 'express'
import helmet from 'helmet'
import ejs from 'ejs'
import * as fs from 'node:fs'
import * as path from 'node:path'
import 'dotenv/config'
import { v4 } from 'uuid'
import { ContentPostgresDb } from './core/postgresdb'
import { PoolConfig } from 'pg'
import { ContentMongoDb, IMongoConfig } from './core/mongodb'
import { MsSqlServerDb, ISqlServerConfig } from './core/mssqldb'

const app = express()
const port = process.env.PORT || 3000

app.use(helmet())
app.set('view engine', 'ejs')
app.use(express.json())

// #region Mongo DB Setup
if (process.env.MONGOURL) {
    const mongoConfig: IMongoConfig = {
        remoteuri: process.env.MONGOURL||'',
        dbname: process.env.MONGODBNAME||'',
        appname: process.env.APPNAME||'',
        timeout: 5000
    }
    const mongoDb = new ContentMongoDb(mongoConfig)
    app.locals.mongoDb = mongoDb
    app.get('/api/mongodb/collections', (req, res) => {
        return new Promise(async(resolve, reject) => {
            try {
                if (!app.locals.mongoDb) {
                    return res.status(400).json({
                        message: `No Mongo Database in application`
                    })
                }

                const result = await app.locals.mongoDb.collectionsDetailed()
                if (!result) {
                    return res.status(400).send({
                        message: `Unable to retrieve list of collections from mongodb`
                    })
                }
                return res.status(200).json(result)
            } catch (err) {
                console.error(err)
                return res.status(500).json(err)
            }
        })
    })
}
// #endregion

// #region Postgres DB Setup
if (process.env.PGHOST) {
    const postgresCert = '' //fs.readFileSync(`ca-certificate.crt`).toString()
    const postgresConfig: PoolConfig = {
        user: process.env.PGUSER,
        password: process.env.PGPWD,
        host: process.env.PGHOST,
        port: +(process.env.PGPORT||0),
        database: process.env.PGDATABASE
    }
    if(postgresConfig.host!=='localhost') {
        postgresConfig.ssl = {
            rejectUnauthorized: false,
            ca: postgresCert
        }
    }
    const postgresDb = new ContentPostgresDb(postgresConfig)
    app.locals.postgresDb = postgresDb    
    app.get('/api/postgres/tables', (req, res) => {
        return new Promise(async(resolve, reject) => {
            try {
                if (!app.locals.postgresDb) {
                    return res.status(400).json({
                        message: `No Postgres Database in application`
                    })
                }

                const result = await app.locals.postgresDb.getTableList()
                if (!result) {
                    return res.status(400).send({
                        message: `Unable to retrieve list of tables from postgresdb`
                    })
                }
                return res.status(200).json(result)
            } catch (err) {
                console.error(err)
                return res.status(500).json(err)
            }
        })
    })

}
// #endregion

// #region Sql Server DB Setup
if (process.env.SQLSRV) {
    const sqlConfig: ISqlServerConfig = {
        server: process.env.SQLSRV,
        database: process.env.SQLDB||'',
        driver: 'msnodesqlv8'
    }
    if (process.env.SQLUSER) {
        sqlConfig.user = process.env.SQLUSER
        sqlConfig.password = process.env.SQLPWD
    } else {
        // Use Windows Authentication
        sqlConfig.options = {
            trustedConnection: true,
            trustServerCertificate: true
        }
    }
    const sqlserver = new MsSqlServerDb(sqlConfig)
    app.locals.sqlserver = sqlserver
}
// #endregion

// Read manifest and create endpoints


app.all('/api/*', (req, res) => {
    res.sendStatus(404)
})

app.get('**', (req, res) => {
    // Send index.html for SPA
    res.sendStatus(404)
})

app.all('**', (req, res) => {
    res.sendStatus(404)
})

app.listen(port, () => {
    console.log(`Express server started on port ${port}`)
})

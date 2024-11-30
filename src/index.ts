import express from 'express'
import helmet from 'helmet'
import ejs from 'ejs'
import * as fs from 'node:fs'
import * as path from 'node:path'
import 'dotenv/config'
import { ContentPostgresDb } from './common/postgresdb'
import { ContentMongoDb, IMongoConfig } from './common/mongodb'
import { PoolConfig } from 'pg'

const app = express()
const port = process.env.PORT || 3000

app.use(helmet())
app.set('view engine', 'ejs')
app.use(express.json())

// #region Mongo DB Setup
const mongoConfig: IMongoConfig = {
    remoteuri: process.env.MONGOURL||'',
    dbname: process.env.MONGODBNAME||'',
    appname: process.env.APPNAME||'',
    timeout: 5000
}
const mongoDb = new ContentMongoDb(mongoConfig)
// #endregion

// #region Postgres DB Setup
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
// #endregion

app.get('/api/postgres/tables', (req, res) => {
    return new Promise(async(resolve, reject) => {
        try {
            const result = await postgresDb.getTableList()
            if (!result) {
                return res.status(400).send({
                    message: `Unable to retrieve list of tables from postgresdb`
                })
            }
            return res.send(result)
        } catch (err) {
            console.error(err)
            return res.status(500).send(err)
        }
    })
})
app.get('/api/mongodb/collections', (req, res) => {
    return new Promise(async(resolve, reject) => {
        try {
            const result = await mongoDb.collectionsDetailed()
            if (!result) {
                return res.status(400).send({
                    message: `Unable to retrieve list of collections from mongodb`
                })
            }
            return res.send(result)
        } catch (err) {
            console.error(err)
            return res.status(500).send(err)
        }
    })
})

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

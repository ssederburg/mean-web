import express from 'express'
import helmet from 'helmet'
import ejs from 'ejs'
import * as fs from 'node:fs'
import * as path from 'node:path'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 3000

app.use(helmet())
app.set('view engine', 'ejs')
app.use(express.json())

app.get('/api/test', (req, res) => {
    res.send({
        items: [
            {id: 1, name: 'Ford'},
            {id: 2, name: 'Chevrolet'},
            {id: 3, name: 'Dodge'},
            {id: 4, name: 'General Motors'},
            {id: 5, name: 'Jeep'},
            {id: 6, name: 'Plymouth'},
            {id: 7, name: 'Tesla'},
            {id: 8, name: 'Ram'},
            {id: 9, name: 'Cadillac'},
            {id: 10, name: 'Chrysler'},
            {id: 11, name: 'Buick'},
            {id: 12, name: 'GMC'},
            {id: 13, name: 'Lincoln'}
        ]
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

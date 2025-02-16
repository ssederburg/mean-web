import * as express from 'express'
import { Bootstrap } from './core/bootstrap'

import { OdbcDb } from './core/datasources/odbcsql'

const port = process.env.PORT || 3000
const bootstrapper: Bootstrap = new Bootstrap()

bootstrapper.start().then((app: express.Application) => {
    app.listen(port, async() => {
        console.log(`Web server started on port ${port}`)
    })
})

import * as express from 'express'
import { Bootstrap } from './core/bootstrap'

const port = process.env.PORT || 3000
const bootstrapper: Bootstrap = new Bootstrap()

bootstrapper.start().then((app: express.Application) => {
    app.listen(port, () => {
        console.log(`Express server started on port ${port}`)
    })
})

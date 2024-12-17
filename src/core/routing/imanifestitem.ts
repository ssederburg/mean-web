import * as express from 'express'

export interface IManifestItem {
    method: string // get, put, post, patch, delete
    path: string // route path
    fx (req: express.Request, res: express.Response, next?: express.NextFunction):Promise<any>
}
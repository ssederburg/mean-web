import express from 'express'

export interface IRoutable {

    all?(app: express.Express, req: express.Request, res: express.Response, next?: express.NextFunction): Promise<any>
    
}
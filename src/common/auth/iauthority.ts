import { IPrincipal } from "./iprincipal"
import express from 'express'
import * as mssql from 'mssql'

export interface IAuthority {
    register(username: string, password: string, tenant: string): Promise<any>
    login(username: string, password: string, tenant: string): Promise<any> 

    setPrincipal(value: IPrincipal): Promise<boolean|Error>
    getPrincipal(username: string, tenant: string): Promise<mssql.IResult<IPrincipal>>
    generateJwt(principle: IPrincipal): Promise<any>

    verify(req: express.Request, res: express.Response, next: Function): any
    refresh(token: any): Promise<any>
}

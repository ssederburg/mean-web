import { IPrincipal } from "./iprincipal"
import express from 'express'

export interface IAuthority {
    register(username: string, password: string, tenant: string): Promise<any>
    login(username: string, password: string, tenant: string): Promise<any> 

    setPrincipal(username: string, value: IPrincipal, tenant: string): Promise<IPrincipal|Error>
    getPrincipal(username: string, tenant: string): Promise<IPrincipal>
    generateJwt(principle: IPrincipal): Promise<any>

    verify(req: express.Request, res: express.Response, next: Function): any
    refresh(token: any): Promise<any>
}

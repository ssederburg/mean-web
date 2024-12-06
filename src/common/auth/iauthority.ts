import { IPrinciple } from "./iprinciple"
import express from 'express'

export interface IAuthority {
    register(username: string, password: string, tenant: string): Promise<any>
    login(username: string, password: string, tenant: string): Promise<any> 

    setPrinciple(username: string, value: IPrinciple, tenant: string): Promise<IPrinciple|Error>
    getPrinciple(username: string, tenant: string): Promise<IPrinciple>
    generateJwt(principle: IPrinciple): Promise<any>

    verify(req: express.Request, res: express.Response, next: Function): any
    refresh(token: any): Promise<any>
}

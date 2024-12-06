import bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import express from 'express'

import { IAuthority } from "../iauthority";
import { IPrinciple } from "../iprinciple";
import { BasicPrinciple } from "./principle";
import { IPrincipleStorage } from '../iprinciplestorage';

const secret = process.env.JWTSECRET || '123'

export class BasicAuthority implements IAuthority {

    constructor(private storage: IPrincipleStorage) {
    }

    register(username: string, password: string, tenant: string): Promise<any> {
        return new Promise(async(resolve, reject) => {
            try {
                if (!username || !password || !tenant) {
                    throw new Error(`Invalid parameters to register method`)
                }
                // TODO: Validate tenant
                // TODO: Validate non-repeating username
                const hashedPassword = await bcrypt.hash(password, 10)
                const principle = new BasicPrinciple(username, hashedPassword, tenant)
                const result: any = await this.setPrinciple(username, principle, tenant)
                if (result instanceof Error) throw result
                delete result.hash
                delete result.salt
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }

    login(username: string, password: string, tenant: string): Promise<any>  {
        return new Promise(async(resolve, reject) => {
            try {
                if (!username || !password || !tenant) {
                    throw new Error(`Invalid parameters to login method`)
                }
                const principle = await this.getPrinciple(username, tenant)
                if (!principle) {
                    setTimeout(() => {
                        return resolve(false)
                    }, 6500)
                }
                const isPasswordValid = await bcrypt.compare(password, principle.hash)
                if (!isPasswordValid) {
                    setTimeout(() => {
                        return resolve(false)
                    }, 6500)
                }
                const jwt = await this.generateJwt(principle)
                return resolve(jwt)
            } catch (err) {
                return reject(err)
            }
        })
    }

    setPrinciple(username: string, value: IPrinciple, tenant: string): Promise<IPrinciple|Error> {
        return new Promise(async(resolve, reject) => {
            try {
                const result = await this.storage.setPrinciple(username, value, tenant)
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }

    getPrinciple(username: string, tenant: string): Promise<IPrinciple> {
        return new Promise(async(resolve, reject) => {
            try {
                const result = await this.storage.getPrinciple(username, tenant)
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }

    generateJwt(principle: IPrinciple): Promise<any> {
        return new Promise(async(resolve, reject) => {
            try {
                if (!principle) {
                    throw new Error(`Invalid principle parameter to generateJwt method`)
                }
                const payload = {
                    id: principle.id,
                    username: principle.username,
                    tenant: principle.tenant
                }
                const token = jwt.sign(payload, secret, {expiresIn: '1h'})
                return resolve(token)
            } catch (err) {
                return reject(err)
            }
        })
    }

    verify(req: express.Request, res: express.Response, next: Function): any {
        try {
            const token = req.headers['authorization']
            if (!token) {
                throw new Error(`Invalid Authorization Token to verify method`)
            }
            const decoded = jwt.verify(token, secret)
            if (!decoded) {
                throw new Error(`Unauthorized`)
            }
            const anyreq: any = req
            anyreq.user = decoded
            next()
        } catch (err) {
            return res.status(401).json({error: 'Invalid Token'})
        }
    }

    refresh(token: any): Promise<any> {
        return new Promise(async(resolve, reject) => {
            try {
                if (!token) {
                    throw new Error(`Invalid Token to refresh method`)
                }
                const decoded = jwt.verify(token, secret)
                if (!decoded) {
                    throw new Error(`Unauthorized`)
                }
                const response = await this.generateJwt(decoded as IPrinciple)
                if (!response) {
                    throw new Error(`Unauthorized`)
                }
                return resolve(response)
            } catch (err) {
                return reject(err)
            }
        })
    }
}
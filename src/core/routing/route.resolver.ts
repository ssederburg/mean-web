import * as express from 'express'

import { BaseManifest } from "./base.manifest";
import { IManifestItem } from "./imanifestitem";
import { Utils } from '../utils';

export class RouteResolver {

    constructor(private path: string) {}

    attach(app: express.Application): Promise<any> {
        return new Promise(async(resolve, reject) => {
            try {
                const validPath = await Utils.directoryExists(this.path)
                if (!validPath) {
                    throw new Error(`Invalid path sent to RouteResolver: ${this.path}`)
                }
                const files = await Utils.getFilesWithPhrase(this.path, 'manifest.')
                const anyApp: any = app
                for (let filepath of files) {
                    const instance: BaseManifest = await Utils.loadClassInstance(filepath, 'BaseManifest', [])
                    if (instance && instance && instance.items && Array.isArray(instance.items) && instance.items.length > 0) {
                        for (let item of instance.items) {
                            anyApp[item.method](item.path, item.fx)
                        }
                    }
                }
                return resolve(true)
            } catch (err) {
                console.error(err)
                return reject(err)
            }
        })
    }

}
import { IManifestEntry } from "./imanifestentry"

export interface IManifest {
    appname: string
    authStrategy: AuthStrategy
    items: IManifestEntry
}

export enum AuthStrategy {
    'basic'='basic'
}

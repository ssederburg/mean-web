import { AuthStrategy } from "../auth/authstrategy"
import { IManifestItem } from "./imanifestitem"

export class BaseManifest {
    appname: string = ''
    authStrategy: AuthStrategy = AuthStrategy.none
    dependencies: string[] = [] // sqlserver, postgresdb, mongodb 
    items: IManifestItem[] = []
}

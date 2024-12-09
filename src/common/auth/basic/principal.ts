import { IPrincipal } from "../iprincipal";
import { v4 } from "uuid";

export class BasicPrincipal implements IPrincipal {
    id: string = ''
    username: string = ''
    hash: string = ''
    tenant: string = ''

    constructor(username: string, hash: string, tenant: string) {
        this.id = v4()
        this.username = username
        this.hash = hash
        this.tenant = tenant
    }
}
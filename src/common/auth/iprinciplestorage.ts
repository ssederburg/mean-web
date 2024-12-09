import { IPrincipal } from "./iprincipal"

export interface IPrincipleStorage {

    setPrincipal(username: string, value: IPrincipal, tenant: string): Promise<IPrincipal|Error>
    getPrincipal(username: string, tenant: string): Promise<IPrincipal>

}
import { IPrinciple } from "./iprinciple"

export interface IPrincipleStorage {

    setPrinciple(username: string, value: IPrinciple, tenant: string): Promise<IPrinciple|Error>
    getPrinciple(username: string, tenant: string): Promise<IPrinciple>

}
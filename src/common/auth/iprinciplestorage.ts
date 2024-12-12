import { IPrincipal } from "./iprincipal"
import * as mssql from 'mssql'

export interface IPrincipleStorage {

    setPrincipal(value: IPrincipal): Promise<boolean|Error>
    getPrincipal(username: string, tenant: string): Promise<IPrincipal>

}
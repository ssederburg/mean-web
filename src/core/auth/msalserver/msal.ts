import * as msal from '@azure/msal-node'

const tenantId = process.env.TENANTID||''
const clientId = process.env.CLIENTID||''
const clientSecret = process.env.SECRET||''
const scopesConfig = process.env.SCOPES||''

const authorityUrl = `https://login.microsoftonline.com/${tenantId}/`

const msalConfig = {
    auth: {
        authority: authorityUrl,
        clientId,
        clientSecret
    },
    system: {
        loggerOptions: {
            logLevel: msal.LogLevel.Warning,
            loggerCallback: (level: any, message: string, containsPii: boolean) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case msal.LogLevel.Error:
                        console.error(message);
                        return;
                    case msal.LogLevel.Info:
                        console.info(message);
                        return;
                    case msal.LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case msal.LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            },
            piiLoggingEnabled: false
        }
    }
}
const cca = new msal.ConfidentialClientApplication(msalConfig)
const scopes: string[] = scopesConfig ? scopesConfig.split(';'):[]
//,`${dynamicsUrl}/.default`]

export class MsalAuth {

    getToken(): Promise<msal.AuthenticationResult|null> {
        return new Promise(async(resolve, reject) => {
            try {
                const result = await cca.acquireTokenByClientCredential({
                    scopes: [...scopes]
                })
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }
    
}
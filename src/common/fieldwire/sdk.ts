const apiKey = process.env.fieldwire

export class FieldwireSDK {

    private _jwtToken: any = null
    private _rootUrl = `https://client-api.us.fieldwire.com/api/v3/`

    private _getJwtToken(): any {
        return new Promise(async(resolve, reject) => {
            try {
                const response = await fetch(`https://client-api.super.fieldwire.com/api_keys/jwt`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: `{"api_token": "${apiKey}"}`
                })
                if (response.status >= 300) {
                    return reject(new Error(`${response.status}: ${response.statusText}`))
                }
                const result = await response.json()
                console.dir(result)
                this._jwtToken = result.access_token
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }

    private get(path: string) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!this._jwtToken) {
                    await this._getJwtToken()
                }
                const url = `${this._rootUrl}${path}`
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Fieldwire-Version': '2024-11-01',
                        'Authorization': `Bearer ${this._jwtToken}`
                    }
                })
                if (response.status >= 300) {
                    return reject(new Error(`${response.status}: ${response.statusText}`))
                }
                const result = await response.json()
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }

    projects() {
        return new Promise(async(resolve, reject) => {
            try {
                const result = await this.get(`account/projects`)
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }

    
}

/*
- Account
  - Project
    - User
    - Floorplan
      - Sheet
        - Attachment
        - Hyperlink
        - Markup
    - Task
      - TaskCheckItem
      - Bubble (comments, photos, files)
    - Form
      - FormSection
        - FormSectionRecord
          - FormSectionRecordInput
          - FormSectionRecordValue
            - FormSectionRecordInputValue
*/
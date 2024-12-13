export interface IManifestEntry {
    id: string // some unique identifier
    path: string // route path
    method: string[]|string // get, put, post, patch, delete
    source: string // Filepath from root of workspaces
    
}
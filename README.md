# MEAN(S) Web
Express JS implementation on Node JS supporting patterns for the serving of Angular SPA with REST apis communicating with both Mongo and any form of SQL server (MS Sql, Azure Sql, Postgres etc.)

## CONFIG
The following .env (environment variables) are required to establish connections to both Mongo and Postgres.

| name | note |
|------|------|
| APPNAME | An application name to use when connecting to mongo or postgres for use in the remote systems logs and analytics |
| PORT | The port to run the web service on. Usually only relevant in development scenarios |
| MONGOURL | Remote URI from mongo database confirmation that typically includes usernames and passwords embedded with mongo port etc. This is the equivalent of the Mongo database connection string |
| MONGODBNAME | The database name residing at the above connection string endpoint |
| PGUSER | Postgres database username |
| PGPWD | Postgres database user password. It should go without saying this value along with other sensitive values should be stored securely in whatever hosting service is being used (such as KeyVault in Azure) |
| PGHOST | Host name is the URL (or localhost) of the postgres database |
| PGPORT | The port postgres is listening for requests on |
| PGDATABASE | The database name for the postgres database |
| SQLUSER | User to connect to sql server database |
| SQLPWD | Above user's password |
| SQLDB | Default database to connect to in sql server |
| SQLSRV | Remote URI including protocol and port for sql server database |
| JWTSECRET | When using JWT token generation techniques, use this value as the secret key used for JWT composition and verification |

## DATABASE SUPPORT FOR DEVELOPMENT
You can install local databases for free to use with development

### SQL Server
https://www.microsoft.com/en-us/sql-server/sql-server-downloads


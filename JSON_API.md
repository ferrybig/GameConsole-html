## JSON API
This api works using json endpoints

Every JSON endpoint requires the use of POST requests and its content-type set to Application/json, unless otherwise noted

This software defines the following endpoints:
### Defined endpoints
#### auth api
##### config
this is a HTTP GET endpoints
This endpoint should be called first in the auth process, this endpoint provides the following information:

* the type of auth service to use (noauth, password, url)
* Alternate url's for servicing (as load balancing/other reasons)
#### auth api
The following list of api's are related to auth basec actions
##### login_info
This endpoints provides the basic settings for password based service, the following settings are givin:

* The password policy
* The random token for the next login
* The amount of ProofOfWorks required
* The difficulty of the ProofOfWorks
##### login
This endpoints verifies the password, ProofOfWorks and token and provides a access token if successfull
#### management api
This api provides access to options to operate on the directory of servers itself, 
##### server_destroy
This removes a server
##### server_create
This adds a server, it requires the options listed by server_create_options
##### server_create_options
This endpoint provides the required variables needed for a server creating,

this endpoints accept a type variable, if this variable is present, it will list the variables needed for this type of server creation

If this variable isn't present, this function will only give a list of types it support, or none if the requestor doesn't have the required permission to create servers.
##### server_status
This shows the status of all servers inside the list
Notice: this request is a low priority request since getting all servers is an intensive operation
@see: #server_status at #server affecting api
##### server_list
Gets a list of all servers running
#### server affecting api
These endpoints provides the options to operate on the servers themself
##### server_status
##### server_log
##### server_cmd
##### server_start
##### server_kill
##### server_force_kill
##### server_settings
### Access token
### Common procedures

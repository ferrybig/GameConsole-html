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
* When this login_info expires (seconds)
##### login
This endpoints verifies the password, ProofOfWorks and token and provides a access token if successfull
#### management api
This api provides access to options to operate on the directory of servers itself, 
##### server_destroy
This removes a server. This cannot be undone and the server MAY keep files from the server on the disk, but it MAY also delete the files if it wants to
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
The status of this server

Returns:
readIndex
status
description
type
##### server_log
Returns the logfile of the server

Arguments:

readIndex: the start byte index where to start reading

Returns:
oldReadIndex:
  This is the start of the byte range you recieve, if this isn't the same as the readindex you have send, it means that the console has overrrun
nextReadIndex:
  Your next readindex for the next request
readIndex:
  The readindex on the server, if this is the same as nextReadIndex, that means you are up to date
##### server_cmd
Sends a command to the server

Arguments:

command: command
##### server_start
Starts a server

This starts the server as a new process and listens to its log files and returns the output of the process as stated at the server_log call
##### server_kill
Kills a server

This command should send a SIG TERM to the process running the server to close it.
##### server_force_kill
Force kills a server

this call may be implemented using the same code as a normal server_kill

This command should send a SIG KILL to the process running the server to force close it.
##### server_settings
Settings api for the server

Returns:

list of properties on this server, having the following attributes:

name: The name of the property
required: if this required
type: the type
readonly: Is this variable readonly
value: the value of this variable
### Access token
The whole api is driven by access tokens, these tokens are generated on login, or by a external api.

The maxium length on a access token is 128 hex characters

A access token SHOULD contain hex only

The access token MUST be provided on any non login api, UNLESS the server said no access token check will be performed

Servers SHOULD return HTTP 403 if your access key is invalid or expired
### ProofOfWork
### Common procedures
#### Logging in:

A normal password based login procedure goes as follows:

1. Client calls "HTTP.1/1 config GET" for default config
   Client updates internal url by the recieved new Endpoint
2. Client calls "HTTP.1/1 login_info GET" for password auth info
3. Client starts generating ProofOfWorks based on login info
4. Client waits for user until it filled in username and password
5. Client makes a request to "HTTP.1/1 login POST" using the random recieved inside the login info, its generated ProofOfWork, username and password
6. Client recieves an access token and is going to use this access key

Client is now ready to use the api

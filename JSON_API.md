# JSON API
This api works using json endpoints

Every JSON endpoint requires the use of POST requests and its content-type set to Application/json, unless otherwise noted

This software defines the following endpoints:

## Defined HTTP status codes

### 5xx
The client may retry the request later, but may also give up

### 403
The authoritation token has expired or deleted server side, the client should relogin

### 401
The client doesn't have permission to request that page

## Defined endpoints

### auth api

#### config
This is a HTTP GET endpoints
This endpoint should be called first in the auth process, this endpoint provides the following information:

Returns:
200 OK
Service : String (optional)
    This should give the next url for service
loginType : String (optional)
    This MUST be present if service is missing
loginTypeArgument : String (optional)

#### login_info
This is a HTTP GET endpoints
This endpoints provides the basic settings for password based service, the following settings are givin:

Returns:
200 OK
random : String
proofOfWorksNeeded : number
password-policy : String (regex)

#### login
This endpoints verifies the password, ProofOfWorks and token and provides a access token if successfull

**Arguments:**
username : String
password : String
random : String
ProofOfWorks : array of strings

**Returns on succes:**
200 OK with:
session-token : String

**Returns on Failure:**
403 FORBIDDEN
error_type : Fixed String : AUTH


### management api
This api provides access to options to operate on the directory of servers itself,


#### server_destroy
This removes a server. This cannot be undone and the server MAY keep files from the server on the disk, but it MAY also delete the files if it wants to

**Arguments:**
server-id : String

**Returns on success:**
204 NO_CONTENT

**Returns on Failure (permission):**
403 FORBIDDEN
error_type : Fixed String : PERMISSION

**Returns on Failure (server-failure):**
500 SERVER FAILURE
error_message : String (optional)


#### server_create
This adds a server, it requires the options listed by server_create_options

**Arguments:**
server-id : String

**Returns on success:**
200 OK
readIndex : integer

**Returns on Failure (server already exists):**
409 CONFLICT

**Returns on Failure (server type doesn't have required arguments):**
400 BAD_REQUEST

**Returns on Failure (permission):**
403 FORBIDDEN
error_type : Fixed String : PERMISSION

**Returns on Failure (server-failure):**
500 SERVER FAILURE
error_message : String (optional)
error_type : Fixed String : PERMISSION


#### server_create_options
This endpoint provides the required variables needed for a server creating,

this endpoints accept a type variable, if this variable is present, it will list the variables needed for this type of server creation

If this variable isn't present, this function will only give a list of types it support, or none if the requestor doesn't have the required permission to create servers.

#### server_status
This shows the status of all servers inside the list
Notice: this request is a low priority request since getting all servers is an intensive operation
@see: #server_status at #server affecting api

#### server_list
Gets a list of all servers running

**Returns on succes:**
200 OK
Servers : List of objects {
	? : String
        Used as server name
}

### server affecting api
These endpoints provides the options to operate on the servers themself

#### server_status
The status of this server

**Arguments:**
server-id : String
  Server to affect

**Returns:**
200 OK
readIndex : number
  The readindex on the server, if this is the same as nextReadIndex, that means you are up to date
status : String
  Offline or online
description : String
  Description of this server
type : String
  Type of server, shared or private

#### server_log
Returns the logfile of the server

**Arguments:**
server-id : String
  Server to affect
readIndex: the start byte index where to start reading

**Returns:**
200 OK
oldReadIndex:
  This is the start of the byte range you recieve, if this isn't the same as the readindex you have send, it means that the console has overrrun
nextReadIndex:
  Your next readindex for the next request
readIndex:
  The readindex on the server, if this is the same as nextReadIndex, that means you are up to date

#### server_cmd
Sends a command to the server, if the server is offline, the command wont be send

**Arguments:**
command : String
  Command to send
server-id : String
  Server to affect

**Returns:**
200 OK
readIndex:
  The readindex on the server, if this is the same as nextReadIndex, that means you are up to date
status : String
  Offline or online

#### server_start
Starts a server

This starts the server as a new process and listens to its log files and returns the output of the process as stated at the server_log call

#### server_kill
Kills a server

This command should send a SIG TERM to the process running the server to close it.

**Arguments:**
server-id : String
  Server to affect

#### server_force_kill
Force kills a server

this call may be implemented using the same code as a normal server_kill

This command should send a SIG KILL to the process running the server to force close it.

**Arguments:**
server-id : String
  Server to affect

#### server_settings
Settings api for the server

**Arguments:**
server-id : String
  Server to affect

**Returns:**
200 OK
list of properties on this server, having the following attributes:

name: The name of the property
required: if this required
type: the type
readonly: Is this variable readonly
value: the value of this variable

## Access token
The whole api is driven by access tokens, these tokens are generated on login, or by a external api.

The maxium length on a access token is 128 hex characters

A access token SHOULD contain hex only

The access token MUST be provided on any non login api, UNLESS the server said no access token check will be performed

Servers SHOULD return HTTP 403 if your access key is invalid or expired

## ProofOfWork

## Common procedures

### Logging in:

A normal password based login procedure goes as follows:

1. Client calls "HTTP.1/1 config GET" for default config
   Client updates internal url by the recieved new Endpoint
2. Client calls "HTTP.1/1 login_info GET" for password auth info
3. Client starts generating ProofOfWorks based on login info
4. Client waits for user until it filled in username and password
5. Client makes a request to "HTTP.1/1 login POST" using the random recieved inside the login info, its generated ProofOfWork, username and password
6. Client recieves an access token and is going to use this access key

Client is now ready to use the api

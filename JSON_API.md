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
##### server_create
##### server_create_options
##### server_status
##### server_list
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

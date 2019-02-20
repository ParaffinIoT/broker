# Paraffin Broker service
Paraffin HTTP/MQTT/CoAP Broker is based on Ponte and service REST API for IoT or Internet of Things.

## Installation
* Make sure you have at least Node 4.3 .Attention: you should currently not use broker with node 5.7 `node --version`
* Install mongo locally using https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04 and https://docs.mongodb.com/manual/administration/install-community/
* Run `mongo` to connect to your database, just to make sure it's working.
* Clone this repo. `git clone -b dev https://github.com/ParaffinIoT/broker`
* Change directory. `cd broker`
* `npm install`
* If you running in Development mode, for loading environment variable, it's necessary to change env.sample file name to .env and customize it.
* Run the server with: `npm start`
* After runing Broker, you can connect to REST API. in HTTP the address is http://localhost:3000/resources/TENANT/YOUR_TOPIC and for MQTT topic is TENANT/YOUR_TOPIC. `curl -X PUT -d 'Hello World' http://localhost:3000/resources/hello` if you set `HTTP_PORT=3000`
The authentication performs with Mongodb server directly. You can change and customize Mongodb server settings with environemt variables.
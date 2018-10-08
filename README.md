# Paraffin Broker service
Paraffin HTTP/MQTT/CoAP Broker is based on Ponte and service REST API for IoT and the other devices.

## Installation
* Make sure you have at least Node 4.3. Also Broker is tested against versions 0.12, 4.3.1 and 5. Attention: you should currently not use broker with node 5.7 `node --version`
* Install mongo locally using https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04 and https://docs.mongodb.com/manual/administration/install-community/
* Run `mongo` to connect to your database, just to make sure it's working. Once you see a mongo prompt, exit with Control-D
* Clone this repo. `git clone -b https://github.com/ParaffinIoT/broker`
* Change directory. `cd broker`
* `npm install`
* Run the server with: `npm start`
* After runing Broker, you can connect to REST API. in HTTP the address is http://localhost:80/resources/TENANT/YOUR_TOPIC and for MQTT topic is TENANT/YOUR_TOPIC. The authentication performs with API Server in TENANT name's Table.
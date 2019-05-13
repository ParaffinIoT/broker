# Paraffin Broker service

[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/) [![Build Status](https://travis-ci.org/ParaffinIoT/broker.svg)](https://travis-ci.com/ParaffinIoT/broker) [![Greenkeeper badge](https://badges.greenkeeper.io/ParaffinIoT/broker.svg)](https://greenkeeper.io/) https://dockerbuildbadges.quelltext.eu/status.svg?organization=paraffin&repository=broker

Paraffin HTTP/MQTT/CoAP Broker is based on NodeJS and service REST API for IoT or Internet of Things.

## Installation
* Make sure you have at least Node 4.3
* Install mongo locally using [how to install mongodb](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04) and [Mongo docs](https://docs.mongodb.com/manual/administration/install-community/)
* Run `mongo` to connect to your database, just to make sure it's working.
* Clone this repo. `git clone https://github.com/ParaffinIoT/broker`
* Change directory. `cd broker`
* `npm install`
* If you running in Development mode, for loading environment variable, it's necessary to change env.sample file name to .env and customize it.
* Run the server with: `npm start`
* After runing Broker, you can connect to REST API. in HTTP the address is http://localhost:3000/resources/TENANT/YOUR_TOPIC and for MQTT topic is TENANT/YOUR_TOPIC.

```
curl -X PUT \
-d "Hello World" \
http://localhost:3000/resources/hello
```

The authentication performs with Mongodb server directly. You can change and customize Mongodb server settings with environemt variables.

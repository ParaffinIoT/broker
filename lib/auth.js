//Thanks Eugenio Pace for auth0mosca repository in "https://github.com/eugeniop/auth0mosca"

var request = require('request');
var jwt = require('jsonwebtoken');

/*
  authNamespace is your api server URL, e.g. https://localhost:1337/api/functions/auth
  clientId, identifies your app (mosca or ponte) with AuthIOK
  clientSecret, is used to sign the JWT (and validate it when using JWT mode)
  connection identifies the user store you want to use in Auth0. It must be one that supports the 
  'Resource Owner' flow: Active Directory, database, etc.
*/
function AuthIOK(authSettings) {
    console.log('AuthIOK Starting...');
    this.authNamespace = authSettings.authNamespace;
    this.restapiKey = authSettings.restapiKey,
        this.appId = authSettings.appId,
        this.masterKey = authSettings.masterKey,
        this.connection = authSettings.connection;
    this.clientId = authSettings.clientId;
    this.clientSecret = authSettings.clientSecret;
    this.jwt = authSettings.jwt || false;
    this.timeout = authSettings.timeout || 6000;
}


/*
  Used when the device is sending credentials. 
  mqtt.username must correspond to the device username in the Auth connection
  if mqtt.username is JWT, mqtt.password is hte JWT itself
  mqtt.password must correspond to the device password
*/
AuthIOK.prototype.authenticate = function () {
    var self = this;
    console.log('authenticate with Credentials request!');
    return function (client, username, password, callback) {
        var data = {
            client_id: client.id, // {client-name}
            username: username,
            password: password.toString(),
            connection: self.connection,
            grant_type: "password",
            scope: 'openid profile'
        };

        request.get({
            headers: {
                "Content-type": "application/json",
                "X-Parse-Application-Id": self.appId,
                //"X-Parse-REST-API-Key": self.restapiKey,
                "X-Parse-Master-Key": self.masterKey
            },
            url: self.authNamespace + '/classes/Device'+'?where={"clientid":"30f18615"}',
            timeout: self.timeout,
            //body: JSON.stringify(data)
        }, function (e, r, b) {
            if (e) {
                console.log("Client does NOT Authenticate!");
                return callback(e, false);
            }
            var r = JSON.parse(b);
            console.log("##");
            console.log(r);
            if (r.error) {
                return callback(r, false);
            }

            if (username == 'JWT' || self.jwt) {
                jwt.verify(r.id_token, new Buffer(self.clientSecret, 'base64'), function (err, profile) {
                    if (err) {
                        return callback("Error getting UserInfo", false);
                    }
                    client.deviceProfile = profile; //profile attached to the client object
                    return callback(null, true);
                });
            }
            if ('results' in r && 'username' in r.results[0]) {
                if (r.results[0].username == username && r.results[0].password == password.toString()) {
                    console.log("Authen true");
                    client.deviceProfile = r.results[0].deviceProfile; //profile attached to the client object
                    return callback(null, true);
                }
            } else {
                console.log("API Server Response Scheme is undifined.")
            }
            console.log("Client does NOT Authenticate!");
            return callback("Client doesnot Authenticate!", false);

        });

    }
}

AuthIOK.prototype.authorizePublish = function () {
    return function (client, topic, payload, callback) {
        console.log("topic: " + topic);
        console.log("topicsIndex: " + client.deviceProfile);
        callback(null, client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1);
        //callback(null, client.user == topic.split('/')[1]);

    }
}

AuthIOK.prototype.authorizeSubscribe = function () {
    return function (client, topic, callback) {
        console.log("Subtopic: " + topic);
        console.log("SubtopicsIndex: " + JSON.stringify(client.deviceProfile));
        callback(null, client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1);
        //callback(null, client.user == topic.split('/')[1]);

    }
}

module.exports = AuthIOK;
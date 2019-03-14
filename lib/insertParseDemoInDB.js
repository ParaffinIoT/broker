// In a node.js environment
var Parse = require('parse/node')

Parse.initialize('APP_ID', 'JAVASCRIPT_KEY', 'MASTER_KEY')
// javascriptKey is required only if you have it on server.

Parse.serverURL = 'http://localhost:5000/api'

// documents to be inserted
var docs = [
  {
    name: 'mohammad',
    clientId: 'u103',
    secret: { type: 'openid', pwdhash: 'rasoul' },
    adapter: ['coap'],
    topics: ['hello', 'username', 'mahdi/hello', 'mohammad']
  },
  {
    name: 'mahdi',
    clientId: 'm313',
    secret: { type: 'openid', pwdhash: 'adrekni' },
    adapter: ['mqtt'],
    topics: ['hello', 'username', 'mahdi/hello']
  },
  {
    name: 'ali',
    clientId: 'a110',
    secret: { type: 'openid', pwdhash: 'yaAli' },
    adapter: ['http'],
    topics: ['hello', 'ali', 'ali/home']
  },
  {
    name: 'username',
    clientId: 'u911',
    secret: { type: 'openid', pwdhash: 'password' },
    adapter: ['*'],
    topics: [
      'hello',
      'username',
      'mahdi/hello',
      'ali/home',
      'mohammad/light',
      'username/home',
      'username/kitchen'
    ]
  }
]

console.log('Inserting Demo Docs is Starting')

for (let i = 0; i < docs.length; i++) {
  var Device = Parse.Object.extend(docs[i].name.toString())
  var device = new Device()

  device.save(docs[i]).then(
    device => {
      console.log('Doc [' + i + ']')
      // The object was saved successfully.
    },
    error => {
      console.log('Error: ' + error)
      // The save failed.
      // error is a Parse.Error with an error code and message.
    }
  )
}

console.log('Inserting Demo Docs is Finished.')

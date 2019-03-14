// we create 'users' collection in newdb database
var url = 'mongodb://localhost:27017/paraffin'

// create a client to mongodb
var MongoClient = require('mongodb').MongoClient

// make client connect to mongo service
MongoClient.connect(
  url,
  function (err, db) {
    if (err) throw err
    // db pointing to newdb
    console.log('Switched to ' + db.databaseName + ' database')

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

    db.collection('COLLECTION_PREFIX' + 'Device').drop(function (err, delOK) {
      if (err) console.log('Collection drop error')
      if (delOK) console.log('Collection deleted')
      db.close()
    })

    // insert multiple documents to 'users' collection using insertOne
    db.collection('COLLECTION_PREFIX' + 'Device').insertMany(docs, function (err, res) {
      if (err) throw err
      console.log(res.insertedCount + ' documents inserted')
      // close the connection to db when you are done with it
      db.close()
    })
  }
)


var SpeckleReceiver = require('./SpeckleReceiver')

var myReceiver = new SpeckleReceiver( {
  wsEndpoint: 'ws://10.211.55.2:8080', // replace with yours!
  restEndpoint: 'http://10.211.55.2:8080', // replace with yours! 
  // wsEndpoint: 'wss://5th.one', // replace with yours!, remote testing
  // restEndpoint: 'https://5th.one', // replace with yours!, remote testing
  token: 'asdf', // optional
  streamId: 'rykdLqJve'
} )

myReceiver.on('opened', data => {
  // do something
  console.log('live connection opened.')
})

myReceiver.on('ready', data => {
  // data.stream = various info about the stream
  // data.stream.liveInstance.layers = the layers of the stream (ie layers and their names)
  // data.stream.liveInstance.objects = the hash list of all the objects contained in this stream
  // further updates (ie 'live-data') will contain just the liveInstance object
  console.log('[ready] Stream init data received. #Structure:', data.layers.length, '#Objects:', data.objects.length, '#Name', data.name, '#History', data.history )
  // get all the objects from the server; no agressive caching is implemented
  myReceiver.getObjects(data.objects)
  .then( objects => {
    // do something with the objects.
    console.log('[first-data] Received all objects as well now.')
  })
})

myReceiver.on('live-update', data => {
  // data.liveInstance.layers = layers
  // data.liveInstance.objects = hash list
  console.log('[live-update] Live update received. #Structure:', data.layers.length, '#Objects:', data.objects.length )
  myReceiver.getObjects(data.objects)
  .then( objects => {
    // do something with the objects
    console.log('[live-update] Received all objects as well now.')
  })
  
  // you can also get just a single object, if so inclined:
  myReceiver.getObject( data.objects[0] )
  .then( obj => {
    console.log('[live-update] Example object:')
    console.log(obj)
  })
})

myReceiver.on('metadata-update', data => {
  // do something
  console.log('[metadata-update] Instance name:', data.name, '#Structures:', data.layers.length)
})

myReceiver.on('volatile-message', data => {
  // do something
  console.log(data)
})
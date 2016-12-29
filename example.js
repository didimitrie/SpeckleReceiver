
var SpeckleReceiver = require('./SpeckleReceiver')

var myReceiver = new SpeckleReceiver( {
  wsEndpoint: 'ws://10.211.55.2:8080', // replace with yours!
  restEndpoint: 'http://10.211.55.2:8080', // replace with yours! 
  token: 'asdf', // optional
  streamId: 'S1FWZ2TQl'
} )

myReceiver.on('opened', data => {
  // do something
  console.log('live connection opened.')
})

myReceiver.on('first-data', data => {
  // data.stream = various info about the stream
  // data.stream.liveInstance.structure = the structure of the stream (ie layers and their names)
  // data.stream.liveInstance.objects = the hash list of all the objects contained in this stream
  // further updates (ie 'live-data') will contain just the liveInstance object
  console.log('[first-data] Stream init data received. #Structure:', data.stream.liveInstance.structure.length, '#Objects:', data.stream.liveInstance.objects.length )
  // get all the objects from the server; no agressive caching is implemented
  myReceiver.getObjects(data.stream.liveInstance.objects)
  .then( objects => {
    // do something with the objects.
    console.log('[first-data] Received all objects as well now.')
  })
})

myReceiver.on('live-update', data => {
  // data.liveInstance.structure = structure
  // data.liveInstance.objects = hash list
  console.log('[live-update] Live update received. #Structure:', data.liveInstance.structure.length, '#Objects:', data.liveInstance.objects.length )
  myReceiver.getObjects(data.liveInstance.objects)
  .then( objects => {
    // do something with the objects
    console.log('[live-update] Received all objects as well now.')
  })
  
  // you can also get just a single object, if so inclined:
  myReceiver.getObject( data.liveInstance.objects[0] )
  .then( obj => {
    console.log('[live-update] Example object:')
    console.log(obj)
  })
})

myReceiver.on('metadata-update', data => {
  // do something
  console.log('[metadata-update] Instance name:', data.streamName, '#Structures:', data.structure.length)
})

myReceiver.on('volatile-message', data => {
  // do something
  console.log(data)
})
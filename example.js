
var SpeckleReceiver = require('./SpeckleReceiver')

var myReceiver = new SpeckleReceiver( {
  wsEndpoint: 'ws://10.211.55.2:8080',
  restEndpoint: 'http://10.211.55.2:8080',
  token: 'asdf', // optional for receivers
  streamId: 'S1FWZ2TQl'
} )

myReceiver.on('opened', data => {
  // do something
})

myReceiver.on('first-data', data => {
  // data.stream.liveInstance.structure = the structure of the stream (ie layers and their names)
  // data.stream.liveInstance.objects = the hash list of all the objects contained in this stream
  console.log('received cached stream data.')
})

myReceiver.on('live-update', data => {
  // do something
  console.log(data)
})

myReceiver.on('metadata-update', data => {
  // do something
  console.log(data)
})

myReceiver.on('volatile-message', data => {
  // do something
  console.log(data)
})
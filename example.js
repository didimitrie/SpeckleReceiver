
var SpeckleReceiver = require('./SpeckleReceiver')

var myReceiver = new SpeckleReceiver( {
  wsEndpoint: 'ws://10.211.55.2:8080', // replace with yours!
  restEndpoint: 'http://10.211.55.2:8080', // replace with yours! 
  token: 'asdf', // optional
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
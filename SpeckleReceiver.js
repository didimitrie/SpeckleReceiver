var WebSocket      = require('ws')
var request        = require('request')
var EventEmitter2  = require('eventemitter2').EventEmitter2
var inherits       = require('./inherits')

var SpeckleReceiver = function( options ) {
  var self = this

  // they are coming from the options arg
  this.wsEndpoint = options.wsEndpoint
  this.restEndpoint = options.restEndpoint
  this.token = options.token
  this.streamId = options.streamId

  this.wsSessionId = ''
  
  this.ws = {}
  this.maxReconnectAttempts = 1000
  this.reconnectAttempts = 0

  this.connect = () => {
    console.log('Connecting...')
    self.ws = new WebSocket( self.wsEndpoint + '/?access_token=' + self.token )
    self.ws.onerror = (err) => console.log('Error connecting.')

    self.ws.on('ping', () => self.ws.send('alive') )
    
    self.ws.on('open', () => {
      console.log('Connection opened.')
      self.reconnectAttempts = 0
      self.ws.send( JSON.stringify( {
        eventName: 'join-stream',
        args: self.streamId
      } ))
      self.emit('opened', null)
    })
  
    self.ws.on('message', (data, flags) => {
      data = JSON.parse( data )

      switch( data.eventName ) {
        case 'ws-session-id':
          console.log('Session id received.')
          self.wsSessionId = data.sessionId
          break
        
        case 'live-update': 
          console.log('Live update received.')
          self.emit('live-update', data.args)
          break

        case 'metadata-update':
          console.log('metadata updated')
          self.emit('metadata-update', data.args)
          break

        case 'history-update':
          console.log('history update')
          self.emit('history-update', data.args)
          break

        case 'volatile-message': 
          console.log('volatile message')
          self.emit('volatile-message', data.args)
          break
      }
    })

    self.ws.on('close', () => {
      console.log('Reconnecting', self.reconnectAttempts )
      if( ++self.reconnectAttempts < self.maxReconnectAttempts )
        setTimeout( self.connect, 1000*2 )
      else 
        console.log('Maximum reconnect attempts reached. Giving up.')
    })
  }
  
  this.getStream = () => {
    var requestOptions = {
      url: self.restEndpoint + '/api/stream',
      headers: {
        'speckle-token': self.token,
        'speckle-stream-id': self.streamId,
        'speckle-ws-id': self.wsSessionId
        }
    }
    request( requestOptions, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body)
        self.emit('first-data', data)
      }
    })
  }

  this.getObjects = ( hashList, cb ) => {
    // todo
  }
  
  this.getObject = ( objectHash, cb ) => {
    // todo
  }

  this.getHistoryInstance = ( historyInstanceId ) => {
    // todo
    console.log('Get history instance: TODO')
  }


  // let's go! 
  this.connect()
  this.getStream()
}

inherits( SpeckleReceiver, EventEmitter2 )
module.exports = SpeckleReceiver
var WebSocket      = require('ws')
var axios          = require('axios')
var EventEmitter2  = require('eventemitter2').EventEmitter2
var inherits       = require('./inherits')

const nonHashedTypes       = [ '404', 'Number', 'Boolean', 'String', 'Point', 'Vector', 'Line']

var SpeckleReceiver = function( options ) {
  var self = this

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

    // depecrated, browser clients seem not capable of handling some basic stuff
    // ping messages are now simply sent as "ping"
    // self.ws.on('ping', () => self.ws.send('alive') )
    
    self.ws.on('open', () => {
      console.log('Connection opened.')
      self.reconnectAttempts = 0
      self.ws.send( JSON.stringify( {
        eventName: 'join-stream',
        args: { streamid: self.streamId, role: 'receiver' }
      } ))
      self.emit('opened', null)
    })
  
    self.ws.on('message', (data, flags) => {
      if( data === 'ping') {
        console.log( 'got a ping. sent an alive.' )
        return self.ws.send('alive')
      } 
      data = JSON.parse( data )

      switch( data.eventName ) {
        case 'ws-session-id':
          console.log('Session id received.')
          self.wsSessionId = data.sessionId
          break
        
        case 'live-update': 
          self.emit('live-update', data.args)
          break

        case 'metadata-update':
          self.emit('metadata-update', data.args)
          break

        case 'history-update':
          self.emit('history-update', data.args)
          break

        case 'volatile-message': 
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
    axios.get( self.restEndpoint + '/api/stream', { headers : { 'speckle-token': self.token, 'speckle-stream-id': self.streamId, 'speckle-ws-id': self.wsSessionId }} )
      .then( response => {  
        self.emit('ready', response.data)
      })
  }

  this.getObjects = ( objects ) => {
    var promises = objects.map( this.getObject )
    return new Promise( (resolve, reject) => {
      Promise.all( promises )
      .then( res => {
        resolve( res )
      })  
    })
  }

  this.getObject = ( obj ) => {
    return new Promise( (resolve, reject) => {
      if(!obj) reject( 'No object provided' )
      if ( obj.hasOwnProperty('value') && nonHashedTypes.indexOf( obj.type ) >= 0 ) 
        return resolve( obj ) // just dump the object back out
      else 
        axios.get( self.restEndpoint + '/api/object', { params: { hash: obj.hash } } )
          .then( response => {
            return resolve( response.data )
          })
          .catch( err => {
            reject( response.data )
          })
    })
  }

  // let's go! 
  this.connect()
  this.getStream()
}

inherits( SpeckleReceiver, EventEmitter2 )
module.exports = SpeckleReceiver
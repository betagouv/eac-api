const mongoose = require('mongoose')
const utils = require('../utils')


const ActorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  loc: { type: Object, index: '2dsphere' },
  distance: Number,
})

class Actor {
  set location(latLng) {
    if(!this.loc.coordinates[0]) return
    if(typeof(latLng) === 'string') latLng = latLng.split(',').map(v => Number(v))
    this.distance = utils.distance(latLng, this.loc.coordinates)
  }
}

ActorSchema.index({ name: 'text', description: 'text' })
ActorSchema.loadClass(Actor)

module.exports = mongoose.model('Actor', ActorSchema)

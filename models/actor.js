const mongoose = require('mongoose')
const utils = require('../utils')

function cleanText (t) {
  return (t && t.replace(/\u0092/g, '’')) || ''
}

const ActorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, get: cleanText },
  loc: { type: Object, index: '2dsphere' },
  domains: Array,
  contactName: String,
  distance: Number
}, {strict: false})

class Actor {
  set location (latLng) {
    if (!this.loc.coordinates[0]) return
    if (typeof (latLng) === 'string') latLng = latLng.split(',').map(v => Number(v))
    this.distance = utils.distance(latLng, this.loc.coordinates)
  }
}

ActorSchema.index({ name: 'text', description: 'text' })
ActorSchema.loadClass(Actor)

ActorSchema.set('toObject', { getters: true })
ActorSchema.set('toJSON', { getters: true })

module.exports = mongoose.model('Actor', ActorSchema)

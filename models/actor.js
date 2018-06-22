const mongoose = require('mongoose')

const ActorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  loc: { type: Object, index: '2dsphere' },
  distance: Number,
})

class Actor {}

ActorSchema.index({ name: 'text', description: 'text' })
ActorSchema.loadClass(Actor)

module.exports = mongoose.model('Actor', ActorSchema)

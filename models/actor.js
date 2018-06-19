const mongoose = require('mongoose')

const ActorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
})

class Actor {}

ActorSchema.index({ name: 'text', description: 'text' })
ActorSchema.loadClass(Actor)

module.exports = mongoose.model('Actor', ActorSchema)

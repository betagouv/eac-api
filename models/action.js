const mongoose = require('mongoose')

const ActionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  actorId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }],
  createdAt: { type: Date, default: Date.now }
}, {
  strict: false
})

class Action {}

ActionSchema.index({
  name: 'text',
  description: 'text'
}, {
  default_language: 'french'
})
ActionSchema.loadClass(Action)

ActionSchema.set('toObject', {
  getters: true
})
ActionSchema.set('toJSON', {
  getters: true
})

module.exports = mongoose.model('Action', ActionSchema)

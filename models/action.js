const mongoose = require('mongoose')

const utils = require('../utils')
const { BaseModel } = require('../models')


const ActionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  actorId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }],
  distance: Number,
  loc: { type: Object, index: '2dsphere' },
  createdAt: { type: Date, default: Date.now }
}, {
  strict: false
})

class Action extends BaseModel {}

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

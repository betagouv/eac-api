const mongoose = require('mongoose')

const utils = require('../utils')
const { BaseModel } = require('../models')


function cleanText (t) {
  return (t && t.replace(/\u0092/g, '’')) || ''
}

function removeNewlines (text) {
  return text && text.replace(/(?:\r\n|\r|\n)/g, '\\n')
}

const ActorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, get: cleanText },
  loc: { type: Object, index: '2dsphere' },
  domains: Array,
  contactName: String,
  distance: Number,
  actions: Array,
  createdAt: { type: Date, default: Date.now }
}, {strict: false})

class Actor extends BaseModel {
  toCsv () {
    const actor = super.toCsv()
    actor.editUrl = `https://www.education-artistique-culturelle.fr/actor/${actor.id}`
    actor.description = removeNewlines(actor.description)
    actor.timetable = removeNewlines(actor.timetable)
    return actor
  }
}

ActorSchema.index(
  { name: 'text', description: 'text' },
  { default_language: 'french' }
)
ActorSchema.loadClass(Actor)

ActorSchema.set('toObject', { getters: true })
ActorSchema.set('toJSON', { getters: true })

module.exports = mongoose.model('Actor', ActorSchema)

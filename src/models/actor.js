const mongoose = require('mongoose')
const { cleanPostalCode, departmentOnSave } = require('../signals')
const { PostalCode, Department } = require('../schematypes')

function cleanText (t) {
  return (t && t.replace(/\u0092/g, '’')) || ''
}

function removeNewlines (text) {
  return text && text.replace(/(?:\r\n|\r|\n)/g, '\\n')
}

const ActorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  postalCode: PostalCode,
  department: Department,
  description: { type: String, get: cleanText },
  loc: { type: Object, index: '2dsphere' },
  domains: Array,
  contactName: String,
  distance: Number,
  actions: Array,
  createdAt: { type: Date, default: Date.now }
}, {strict: false})

cleanPostalCode(ActorSchema)
departmentOnSave(ActorSchema)

class Actor {
  toCsv () {
    const actor = this._doc
    actor.location = actor.loc && actor.loc.coordinates.join(',')
    actor.editUrl = `https://www.education-artistique-culturelle.fr/actor/${actor._id}`
    actor.description = removeNewlines(actor.description)
    actor.timetable = removeNewlines(actor.timetable)
    delete actor.id
    delete actor.loc
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

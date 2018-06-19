const mongoose = require('mongoose')

const ActorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: String,
  type: String,
  address: String,
  postalCode: String,
  city: String,
  phone: String,
  email: String,
  contactName: String,
  contactEmail: String,
  contactPhone: String,
  timetable: String,
  audience: String,
  description: String,
  links: String,
  keywords: String,
  domain: String,
  actions: String,
  partners: String,
})

class Actor {}

ActorSchema.loadClass(Actor)

module.exports = mongoose.model('Actor', ActorSchema)

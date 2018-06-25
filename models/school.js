const mongoose = require('mongoose')


const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: String,
  loc: { type: Object, index: '2dsphere' }
})

class School {}

SchoolSchema.index({ name: 'text', city: 'text' })
SchoolSchema.loadClass(School)

module.exports = mongoose.model('School', SchoolSchema)

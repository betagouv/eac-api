const mongoose = require('mongoose')

const { BaseModel } = require('../models')

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: String,
  postalCode: String,
  loc: { type: Object, index: '2dsphere' }
})

class School extends BaseModel {}

SchoolSchema.index({ name: 'text', city: 'text' })
SchoolSchema.loadClass(School)

module.exports = mongoose.model('School', SchoolSchema)

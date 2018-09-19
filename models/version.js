const mongoose = require('mongoose')

const VersionSchema = new mongoose.Schema({
  model: { type: String, enum: ['Action', 'Actor', 'School'] },
  modelId: { type: mongoose.Schema.Types.ObjectId },
  meta: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
})

class Version {}

VersionSchema.index({ name: 'text', city: 'text' })
VersionSchema.loadClass(Version)

module.exports = mongoose.model('Version', VersionSchema)

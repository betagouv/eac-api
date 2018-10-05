const mongoose = require('mongoose')

const FeedbackSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true },
  actionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Action', required: true },
  like: { type: Boolean },
  participation: { type: Boolean },
  createdAt: { type: Date, default: Date.now }
})

class Feedback {}
FeedbackSchema.loadClass(Feedback)

module.exports = mongoose.model('Feedback', FeedbackSchema)

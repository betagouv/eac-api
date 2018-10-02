const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  roles: [{ type: String, enum: ['admin', 'school', 'actor'], required: true }]
})

UserSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) {
    bcrypt.hash(this.password, 10, (_e, hash) => {
      this.password = hash
      next()
    })
    return
  }
  return next()
})

UserSchema.method('toJSON', function () {
  var user = this.toObject()
  delete user.password
  delete user.__v
  return user
})

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

UserSchema.index({ name: 'text', email: 'text' })

module.exports = mongoose.model('User', UserSchema)

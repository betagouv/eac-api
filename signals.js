const { departmentFromPostalCode } = require('./utils')

function departmentOnSave(schema) {
  schema.pre('save', function (next) {
    this.department = departmentFromPostalCode(this.postalCode)
    next()
  })
}

function cleanPostalCode(schema) {
  schema.pre('save', function (next) {
    this.postalCode = this.postalCode.trim()
    if (this.postalCode && this.postalCode.length === 4) {
      this.postalCode = `0${this.postalCode}`
    }

module.exports = { departmentOnSave, cleanPostalCode }

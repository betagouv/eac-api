const { departmentFromPostalCode } = require('./utils')

function departmentOnSave(schema) {
  schema.pre('save', function (next) {
    this.department = departmentFromPostalCode(this.postalCode)
    next()
  })
}

module.exports = { departmentOnSave }

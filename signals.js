function departmentOnSave(schema) {
  schema.pre('save', function (next) {
    const prefix = this.postalCode.slice(0, -3)
    this.department = prefix.length > 1 ? prefix : `0${prefix}`
    next()
  })
}

module.exports = { departmentOnSave }

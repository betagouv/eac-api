const mongoose = require('mongoose')
const { cleanPostalCode, departmentOnSave } = require('../signals')
const { PostalCode, Department } = require('../schematypes')

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: String,
  loc: { type: Object, index: '2dsphere' },
  postalCode: PostalCode,
  department: Department
})

cleanPostalCode(SchoolSchema)
departmentOnSave(SchoolSchema)

class School {
  toCsv () {
    const school = this._doc
    school.location = school.loc && school.loc.coordinates.join(',')
    delete school.id
    delete school.loc
    return school
  }
}

SchoolSchema.index({ name: 'text', city: 'text' })
SchoolSchema.loadClass(School)

module.exports = mongoose.model('School', SchoolSchema)

const mongoose = require('mongoose')

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: String,
  postalCode: String,
  loc: { type: Object, index: '2dsphere' }
})

class School {
  toCsv () {
    const school = this._doc
    school.location = school.loc && school.loc.coordinates.join(',')
    const department = school.postalCode.slice(0, -3)
    school.department = department.length >= 2 ? department : '0' + department
    delete school.id
    delete school.loc
    return school
  }
}

SchoolSchema.index({ name: 'text', city: 'text' })
SchoolSchema.loadClass(School)

module.exports = mongoose.model('School', SchoolSchema)

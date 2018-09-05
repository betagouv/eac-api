class BaseModel {
  toCsv () {
    const obj = this._doc
    if (obj.loc) {
      obj.location = obj.loc.coordinates.join(',')
    }
    if (obj.postalCode) {
      obj.postalCode = obj.postalCode.length >= 5 ? obj.postalCode : '0' + obj.postalCode
      obj.department = obj.postalCode.slice(0, -3)
    }
    obj.id = obj._id
    delete obj._id
    delete obj.loc
    return obj
  }
}

module.exports = { BaseModel }

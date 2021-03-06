module.exports = {
  PostalCode: {
    type: 'String',
    validate: {
      validator: (v) => /\d{5}/.test(v),
      message: props => `${props.value} is not a valid postal code.`
    }
  },
  Department: {
    type: 'String',
    validate: {
      validator: (v) => /^(?:9[78][12346]|\d{2}|2[AB])$/.test(v),
      message: props => `${props.value} is not a valid department.`
    }
  }
}

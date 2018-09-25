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
      validator: (v) => /\d[0-9AB]\d?/.test(v),
      message: props => `${props.value} is not a valid department.`
    }
  }
}

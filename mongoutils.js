function departmentFromPostalCode (postalCode) {
  const postalPrefix = postalCode.slice(0, -3)
  let department = postalPrefix.length < 2 ? `0${postalPrefix}` : postalPrefix
  // Corse
  if (department === '20') {
    department = Number(postalCode[2]) < 2 ? '2A' : '2B'
  }
  // Dom-Tom
  else if (['97', '98'].includes(department)) {
    department = postalCode.slice(0, 3)
  }
  return department
}

module.exports = { departmentFromPostalCode }

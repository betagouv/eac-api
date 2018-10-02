
function allowDepartmentsFilter (req, criteria = {}) {
  const departments = req.query.departments
  if (departments) {
    criteria['department'] = { $in: departments.split(',').map(d => d.trim()) }
  }
  return criteria
}

module.exports = { allowDepartmentsFilter }

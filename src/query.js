
function allowDepartmentsFilter (ctx, criteria = {}) {
  const departments = ctx.request.query.departments
  if (departments) {
    criteria['department'] = { $in: departments.split(',').map(d => d.trim()) }
  }
  return criteria
}

module.exports = { allowDepartmentsFilter }

print('Fixing school documents.')
db.schools.find({latLng: {$exists: false}}).forEach(school => {
  school.loc = {type: 'Point', coordinates: [school.latitude, school.longitude]}
  delete school.latitude
  delete school.longitude
  db.schools.update({_id: school._id}, school)
})

print('Extracting Domains.')
db.actors.find({domain: {$exists: true, $nin: ['', null]}}).forEach(actor => {
  actor.domains = actor.domain.length && actor.domain.split(',').map(a => a.trim())
  delete actor.domain
  db.actors.update({_id: actor._id}, actor)
}).batch_size(5000)

print('Extracting "adresse.data.gouv.fr" latLng to geoJSON.')
db.actors.find({latitude: {$nin: ['', null]}}).forEach(actor => {
  actor.loc = {type: 'Point', coordinates: [actor.latitude, actor.longitude]}
  delete actor.latitude
  delete actor.longitude
  db.actors.update({_id: actor._id}, actor)
}).batch_size(5000)

print('Extracting native latLnt to geoJSON.')
db.actors.find({latLng: {$nin: ['', null]}}).forEach(actor => {
  if(!actor.latLng.split) return
  const coordinates = actor.latLng.split(',').map(v => Number(v.trim()))
  delete actor.latLng
  actor.loc = {type: 'Point', coordinates: coordinates}
  db.actors.update({_id: actor._id}, actor)
}).batch_size(5000)

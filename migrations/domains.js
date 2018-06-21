db.actors.find({domain: {$exists: true}}).forEach(actor => {
  actor.domains = actor.domain.length && actor.domain.split(',').map(a => a.trim())
  db.actors.update({_id: actor._id}, actor)
})

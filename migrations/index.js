/* globals db */

// Get all actors having actions, then create a document for each and unset actions in actors.
db.actors.find({
  'actions.0': {
    $exists: true
  }
}).forEach(actor => {
  actor.actions.forEach(action => {
    action.actorId = actor._id
    db.actions.insert(action)
    db.actors.update({
      _id: actor._id
    }, {
      $unset: {
        actions: ''
      }
    })
  })
})

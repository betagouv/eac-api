/* globals db */

print("Get all actors having actions, then create a document for each and unset actions in actors.")
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

print("Set updatedAt and createdAt...") 
const origin = new Date('2018-07-01')

print("  ... No date at all") 
db.actors.find({
  updatedAt: null,
  createdAt: null
}).forEach(actor => {
  db.actors.update({
    _id: actor._id
  }, {
    updatedAt: origin,
    createdAt: origin
  })
})

print("  ... Only updatedAt, no createdAt")
db.actors.find({
  createdAt: null
}).forEach(actor => {
  db.actors.update({
    _id: actor._id
  }, {
    createdAt: actor.updatedAt
  })
})

print("  ... Only createdAt, no updatedAt")
db.actors.find({
  updatedAt: null
}).forEach(actor => {
  db.actors.update({
    _id: actor._id
  }, {
    updatedAt: actor.createdAt
  })
})

print("Done 🎊")

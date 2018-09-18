/* globals db, print, removeDomain, addDomain, replaceDomain */

print('Get all actors having actions, then create a document for each and unset actions in actors.')
db.actors.find({ 'actions.0': { $exists: true } }).forEach(actor => {
  actor.actions.forEach(action => {
    action.actorId = actor._id
    db.actions.insert(action)
    db.actors.update({ _id: actor._id }, { $unset: { actions: '' } })
  })
})

print('Set updatedAt and createdAt...')
const origin = new Date('2018-07-01')

print('  ... No date at all')
db.actors.find({ updatedAt: null, createdAt: null }).forEach(actor => {
  db.actors.update({ _id: actor._id }, { $set: { updatedAt: origin, createdAt: origin } })
})

print('  ... Only updatedAt, no createdAt')
db.actors.find({ createdAt: null }).forEach(actor => {
  db.actors.update({ _id: actor._id }, { $set: { createdAt: actor.updatedAt } })
})

print('  ... Only createdAt, no updatedAt')
db.actors.find({ updatedAt: null }).forEach(actor => {
  db.actors.update({ _id: actor._id }, { $set: { updatedAt: actor.createdAt } })
})

print('Delete orphans actions...')
db.actions.find({}).forEach(action => {
  if (action.actorId) {
    const actor = db.actors.findOne({ _id: action.actorId[0] || action.actorId })
    if (!actor || !actor._id) {
      print(` ...remove action ${action._id}`)
      db.actions.remove({ _id: action._id })
    }
  } else {
    print(` ...remove action ${action._id}`)
    db.actions.remove({ _id: action._id })
  }
})

print('Update loc for all actions...')
db.actions.find({ loc: null }).forEach(action => {
  if (action.location) {
    db.actions.update({ _id: action._id }, { $set: { loc: action.location }, $unset: { loc: action.loc } })
  } else {
    const actor = db.actors.findOne({ _id: action.actorId[0] || action.actorId })
    if (actor && actor._id) {
      print(` ...update loc for action ${action._id}`)
      db.actions.update({ _id: action._id }, { $set: { loc: actor.loc } })
    }
  }
})

// Managing domains

db.system.js.save({
  _id: 'removeDomain',
  value (name) {
    print(`> Removing domain "${name}"`)
    return db.actors.updateMany(
      { domains: { $in: [name] } },
      { $pull: { domains: name } }
    )
  }
})
db.system.js.save({
  _id: 'replaceDomain',
  value (oldName, newName) {
    print(`> Replacing domain "${oldName}" with "${newName}"`)
    return db.actors.updateMany(
      { domains: { $in: [oldName] } },
      { $pull: { domains: {$in: [oldName, newName]} } },
      { $push: { domains: newName } }
    )
  }
})
db.system.js.save({
  _id: 'addDomain',
  value (words, domain) {
    print(`> Adding domain "${domain}" where title has "${words.join(', ')}"`)
    return db.actors.updateMany(
      {
        name: { $regex: words.join('|'), $options: 'i' },
        domains: { $nin: [domain] }
      },
      { $push: { domains: domain } }
    )
  }
})

print('Cleaning domains')
db.loadServerScripts()

db.actors.updateMany({ domains: '' }, { $set: { domains: [] } })

removeDomain('Risques majeurs')
removeDomain('Art')

replaceDomain('Écriture', 'Livres')
replaceDomain('Lecture', 'Livres')
replaceDomain('Littérature', 'Livres')
replaceDomain('Cinéma', 'Arts visuels')
replaceDomain('Design', 'Arts visuels')
replaceDomain('Photographie', 'Arts visuels')
replaceDomain('Culture scientifique et technique', 'Développement durable')
replaceDomain('Audiovisuel', 'Arts visuels')
replaceDomain('danse', 'Danse')
replaceDomain('Spectacle vivant', 'Théâtre')
replaceDomain('Spectacle vivant', 'Théâtre')
replaceDomain('Arts appliqués', 'Arts plastiques')
replaceDomain('Expression dramatique', 'Théâtre')

addDomain(['musée', 'musee'], 'Musée')
addDomain(['theatre', 'théatre', 'théâtre'], 'Théâtre')
addDomain(['opéra', 'opera'], 'Opéra')
addDomain(['bibliothèque', 'médiathèque', 'livre', 'lecture', 'écriture'], 'Livres')
addDomain(['video', 'vidéo', 'cinema', 'cinéma', 'film'], 'Arts visuels')
addDomain(['numerique', 'numérique'], 'Arts numériques')
addDomain(['danse'], 'Danse')
addDomain(['philosophie'], 'Philosophie')
addDomain(['écolo', 'ecolo'], 'Développement durable')

print('Done 🎊')

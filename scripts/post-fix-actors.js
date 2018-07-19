const MongoClient = require('mongodb').MongoClient

// Form "Museum municipal des  cinémas 9°" to "musee des cinemas"
function fuzzify (str) {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, ' ')
    .replace(/municipale?|nationale?|departementale?/g, '')
    .replace(/museum/g, 'musee')
    .replace(/ +/g, ' ')
    .trim()
}

// Check for fuzzy dups (beware, dragons)
function isDup (actor) {
  // All names are fuzzified...
  let names = actor.items.filter(a => a).map(a => fuzzify(a.name))
  // ... and truncated to the shortest name ...
  const shortest = Math.min(...(names.map(n => n.length)))
  names = names.map(n => n.substr(0, shortest))
  // ... Add this command to understand what is done: `console.log(names)` ...
  // ... then, if all names are identical, it's a duplicate
  return names.every((val, _i, arr) => val === arr[0])
}

// Main async func (beacause await)
async function updateDb () {
  const client = await MongoClient.connect(process.argv[2], {
    useNewUrlParser: true
  })
  const db = await client.db('eac')

  // Get "duplicate" actors (without false positive <3)
  const actorsWithDup = (await db.collection('actors').aggregate([{
    '$group': {
      _id: '$loc.coordinates',
      count: {
        $sum: 1
      },
      items: {
        $push: '$$ROOT'
      }
    }
  },
  {
    '$match': {
      count: {
        $gt: 1
      }
    }
  }
  ]).toArray()).filter(a => a.count > 1 && isDup(a))

  // Recreate actors with more accurate values
  const newActors = actorsWithDup.map(actor => {
    return actor.items.reduce((acc, val) => {
      // "joconde" is a better source than "canope"
      if (val.source && val.source === 'joconde' && val.source !== acc.source) {
        return val
      } else {
        // Merge duplicate actors by taking the less "empty" properties (prefering the most recent)
        const merged = {}
        // This part should be improved, code is ugly.
        if (acc.createdAt && (!val.createdAt || (val.createdAt < acc.createdAt))) {
          Object.keys(acc).forEach((key) => merged[key] = acc[key] ? acc[key] : val[key])
        } else {
          Object.keys(val).forEach((key) => merged[key] = val[key] ? val[key] : acc[key])
        }
        return merged
      }
    }, actor.items[0])
  })
  // Remove _id, because we create new entries (see deletion below)
  newActors.forEach(a => delete a._id)
  newActors.length && await db.collection('actors').insertMany(newActors)

  // Remove duplicates
  const idsToRemove = [].concat.apply([], actorsWithDup.map(a => a.items.map(x => x._id)))
  idsToRemove.length && await db.collection('actors').remove({
    _id: {
      $in: idsToRemove
    }
  })
  await client.close()
}

// Boom.
updateDb()

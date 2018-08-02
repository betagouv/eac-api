const MongoClient = require('mongodb').MongoClient

// Form "Museum municipal des  cinémas 9°" to "musee des cinemas"
function fuzzify(str) {
  if (!str) {
    return ''
  }
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
function isDup(actor) {
  // All names are fuzzified...
  let names = actor.items.filter(a => a).map(a => fuzzify(a.name))
  // ... and truncated to the shortest name ...
  const shortest = Math.min(...(names.map(n => n.length)))
  names = names.map(n => n.substr(0, shortest))
  // ... Add this command to understand what is done: `console.log(names)` ...
  // ... then, if all names are identical, it's a duplicate
  return names.every((val, _i, arr) => val === arr[0])
}

// Compare sources of two 
function bestSource(actors) {
  const orderedSources = ['eac_website', 'direction_culture_cannes', 'joconde', 'canope']
  return actors.sort((x, y) => orderedSources.indexOf(x.source || '') - orderedSources.indexOf(y.source || ''))[0]
}

// Check if an actor was updated or created recently 
function isNewer(source, target) {
  return
  // Only source was updated ...
  (source.updatedAt && !target.updateAt)
  // ... or source and taget where updated and source is newer ...
  ||
  (source.updatedAt && source.updatedAt > target.updateAt)
  // ... or source has createdAt value but not the target (and the target was not updated) ...
  ||
  (source.createdAt && !target.updateAt && !target.createdAt)
  // ... or source and taget has createdAt value and source is newer
  ||
  (source.updatedAt && !target.updateAt && source.updatedAt > target.updateAt)
}

function removeEmptyValues(o) {
  Object.keys(o).forEach((key) => (o[key] == null) && delete o[key])
  return o
}

async function actorsDup(db, group) {
  return (await db.collection('actors').aggregate([{
      '$group': {
        _id: group,
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
}

// Main async func (beacause await)
async function updateDb() {
  const client = await MongoClient.connect(process.argv[2], {
    useNewUrlParser: true
  })
  const db = await client.db()

  // Get "duplicate" actors (without false positive <3)
  const actorsWithDup = [
    ...await actorsDup(db, '$loc.coordinates'),
    ...await actorsDup(db, {
      coordinates: '$loc.coordinates',
      name: '$name',
    })
  ];

  // Recreate actors with more accurate values
  const newActors = actorsWithDup.map(actor => {
    return actor.items.reduce((acc, val) => {
      // If source differs for a duplicate, we prefer the "best"
      if (val.source !== acc.source) {
        return bestSource([val, acc])
      } else {
        // Merge duplicate actors by taking the less "empty" properties (prefering the most recent)
        return isNewer(val, acc) ? { ...removeEmptyValues(acc),
          ...removeEmptyValues(val)
        } : { ...removeEmptyValues(val),
          ...removeEmptyValues(acc)
        }
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

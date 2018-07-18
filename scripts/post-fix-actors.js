const MongoClient = require('mongodb').MongoClient;

// Form "Museum municipal des  cinémas 9°" to "musee des cinemas"
function fuzzify(str) {
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
  let names = actor.items.map(a => fuzzify(a.name))
  // ... and truncated to the shortest name ...
  const shortest = Math.min(...(names.map(n => n.length)))
  names = names.map(n => n.substr(0, shortest))
  // ... Add this command to understand what is done: `console.log(names)` ...
  // ... then, if all names are identical, it's a duplicate
  return names.every((val, _i, arr) => val === arr[0])
}

// Main async func (beacause await)
async function updateDb() {
  const client = await MongoClient.connect(process.argv[2], {
    useNewUrlParser: true
  })
  const db = await client.db('eac')

  // Get "duplicate" actors (without false positive <3)
  const actors_with_dup = (await db.collection('actors').aggregate([{
      "$group": {
        _id: "$loc.coordinates",
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
  const new_actors = actors_with_dup.map(actor => {
    return actor.items.reduce((acc, val) => {
      // "joconde" is a better source than "canope"
      if (val.source && val.source == 'joconde') {
        return val
      } else {
        // Merge duplicate actors by taking the less "empty" properties
        const merged = {}
        Object.keys(acc).forEach((key) => merged[key] = acc[key] ? acc[key] : val[key]);
        return merged
      }
    }, actor.items[0])
  })
  // Remove _id, because we create new entries (see deletion below)
  new_actors.forEach(a => delete a._id)
  new_actors.length && await db.collection('actors').insertMany(new_actors)

  // Remove duplicates
  const id_to_remove = [].concat.apply([], actors_with_dup.map(a => a.items.map(x => x._id)))
  id_to_remove.length && await db.collection('actors').remove({
    _id: {
      $in: id_to_remove
    }
  })
  await client.close()
}

// Boom.
updateDb()

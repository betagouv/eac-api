const MongoClient = require('mongodb').MongoClient

async function schools (db) {
  const schools = db.collection('schools')
  await schools.insertOne({
    name: 'Lycée Liberté',
    city: 'Paris',
    loc: {
      type: 'Point',
      coordinates: [1, 2]
    }
  })
  return schools.createIndex({
    name: 'text',
    city: 'text'
  })
}

async function actors (db) {
  const actors = db.collection('actors')
  await actors.insertOne({
    name: 'Cirque du vent',
    description: 'Ateliers de cirque à partir de 4 ans.',
    domains: ['cirque', 'spectacle vivant'],
    loc: {
      type: 'Point',
      coordinates: [1, 2]
    }
  })
  return actors.createIndex({
    name: 'text',
    description: 'text'
  })
}

async function seed () {
  const client = await MongoClient.connect('mongodb://localhost')
  const db = await client.db('eac')
  await schools(db)
  await actors(db)
  client.close()
}
seed()

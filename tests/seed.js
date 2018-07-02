const MongoClient = require('mongodb').MongoClient

async function c() {
    const client = await MongoClient.connect('mongodb://localhost')
    const db = await client.db('eac')
    const collection = await db.collection('schools');
    await db.collection('schools').insertOne({
        name: 'Lycée Liberté',
        city: 'Paris',
        loc: {
            type: 'Point',
            coordinates: [1, 2]
        },
    })
    await db.collection('schools').createIndex({name: 'text', city: 'text'})
    client.close()
}
c()
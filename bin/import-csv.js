const fs = require('fs')
const parser = require('papaparse')
const mongoose = require('mongoose')


fs.readFile(process.argv[2], (err, data) => {
  const parsed = parser.parse(data.toString(), {
    header: true,
    skipEmptyLines: true
  })
  const db = mongoose.createConnection('mongodb://localhost/eac')
  const documents = db.collection('actors')
  documents.remove({}, _ => {
    documents.insertMany(parsed.data, (err, cursor) => {
      console.info(`Imported ${parsed.data.length} actors.`)
      return process.exit()
    })
  })
})

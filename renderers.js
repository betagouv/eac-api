const csvWriter = require('csv-write-stream')


function renderJson (context, body, status) {
  context.set('Content-Type', 'application/json')
  context.response.status = status || 200
  context.body = JSON.stringify(body)
}

function renderCsv (context, items) {
  const stream = csvWriter()
  items.forEach(item => {
    stream.write(item)
  })
  context.set('Content-disposition', `attachment; filename=export.csv`)
  context.statusCode = 200
  context.body = stream
  stream.end()
}

function render (ctx, documents) {
  switch (ctx.request.query.format) {
    case 'csv':
      const sample = documents[0]
      if (sample && !sample.toCsv) {
        throw new Error(`${sample} should have a toCsv method for exporting in a CSV format.`)
      }
      renderCsv(ctx, documents.map(doc => doc.toCsv()))
      break
    default:
      renderJson(ctx, documents)
  }
}

module.exports = { render, renderCsv, renderJson }

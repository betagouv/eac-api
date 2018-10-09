const csvWriter = require('csv-write-stream')
const Version = require('./models/version')
const { departmentFromPostalCode } = require('./mongoutils')

function distance (latlng1 = [], latlng2 = []) {
  if (!latlng1[0] || !latlng2[0]) return
  const [lat1, lng1] = (typeof (latlng1) === 'string') ? latlng1.split(',').map(v => Number(v)) : latlng1
  const [lat2, lng2] = (typeof (latlng2) === 'string') ? latlng2.split(',').map(v => Number(v)) : latlng2
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1) // deg2rad below
  const dLon = deg2rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

function deg2rad (deg) {
  return deg * (Math.PI / 180)
}

function apiRenderCsv (res, items) {
  const stream = csvWriter()
  items.forEach(item => {
    stream.write(item)
  })
  res.writeHead(200, {
    'Content-Type': 'text/csv',
    'Content-disposition': `attachment; filename=export.csv`
  })
  stream.pipe(res)
  stream.end()
}

function renderFormat (req, res, items) {
  if (req.query.format === 'csv') {
    apiRenderCsv(res, items)
  } else {
    res.send(items)
  }
}

function isLatLngString (s) {
  return s.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)
}

function searchCriteria (req) {
  const words = req.params.q
  const from = req.query.from
  const distance = Number(req.query.distance) || 100
  const domains = req.query.domains && req.query.domains.split(',')

  const criteria = !words ? {} : {
    $text: {
      $search: words.replace(/\s+/, ' ').split(' ').map(w => `"${w}"`).join(' ')
    }
  }

  if (domains) {
    criteria.domains = {
      $in: domains
    }
  }

  if (from) {
    const location = from.split(',').map(v => Number(v))
    criteria.loc = {
      $geoWithin: {
        $centerSphere: [location, distance / 6378.15]
      }
    }
  }
  return criteria
}

function version (model, objects) {
  return Version.insertMany((objects instanceof Array ? objects : [objects]).map(o => {
    return { model, modelId: o.id, meta: o }
  }))
}

module.exports = {
  distance,
  isLatLngString,
  searchCriteria,
  apiRenderCsv,
  version,
  departmentFromPostalCode,
  renderFormat
}

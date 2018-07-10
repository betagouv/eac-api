function distance (latlng1 = [], latlng2 = []) {
  const [lat1, lng1] = latlng1
  const [lat2, lng2] = latlng2
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

function apiRender (context, body, status) {
  context.set('Content-Type', 'application/json')
  context.response.status = status || 200
  context.body = JSON.stringify(body)
}

function isLatLngString (s) {
  return s.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)
}

module.exports = { distance, apiRender, isLatLngString }

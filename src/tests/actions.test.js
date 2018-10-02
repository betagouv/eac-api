/* global describe, test, expect, afterAll */
const app = require('../app')
const request = require('supertest')
const mongoose = require('mongoose')
const actorWithActionsParams = require('./helpers').actorWithActionsParams

afterAll(() => {
  mongoose.disconnect()
})

describe('Test actions', async () => {
  const actorsUrl = '/actors'
  const actionsUrl = '/actions'
  const params = actorWithActionsParams
  let actorId

  test(`Create an actor with action ${actorsUrl}`, async () => {
    const response = await request(app)
      .post(actorsUrl)
      .send(params)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
    expect(response.body.name).toBe(params.name)
    expect(response.body.address).toBe(params.address)
    actorId = response.body.id
  })

  test(`Get an actor with actions ${actorsUrl}/${actorId}`, async () => {
    const response = await request(app)
      .get(`${actorsUrl}/${actorId}`)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.name).toBe(params.name)
    expect(response.body.address).toBe(params.address)
    expect(response.body.actions.length).toBe(2)
    expect(response.body.actions[0].actorId[0]).toBe(response.body.id)
  })

  test(`Get all actions ${actionsUrl}`, async () => {
    const response = await request(app)
      .get(`${actionsUrl}`)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.length).toBeGreaterThanOrEqual(2)
    expect(!!response.body[0].name).toBeTruthy()
  })

  test(`Search for actions #1 ${actionsUrl}/search/?from=1,2`, async () => {
    const response = await request(app)
      .get(`${actionsUrl}/search/?from=1,2`)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.map(e => e.description)).toEqual(expect.arrayContaining(['d§', 's§']))
  })

  test(`Search for actions #2 ${actionsUrl}/search/spectacle?from=1,2`, async () => {
    const response = await request(app)
      .get(`${actionsUrl}/search/spectacle?from=1,2`)
      .set('Accept', 'application/json')
      .expect(200)
    const desc = response.body.map(e => e.description)
    expect(desc).toEqual(expect.arrayContaining(['s§']))
    expect(desc).toEqual(expect.not.arrayContaining(['d§']))
  })

  test(`Search for actions #3 ${actionsUrl}/search?from=1,2&limit=1`, async () => {
    const response = await request(app)
      .get(`${actionsUrl}/search?from=1,2&limit=1`)
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.length).toBe(1)
  })
})

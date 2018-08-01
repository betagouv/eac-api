# EAC API

This serves ressources for the EAC application.


## Installing

Depends on node (tested on v10).

run `npm install`


## Running

`npm start`

and open your browser at _http://localhost:3000/actors_ to find the default
list of actors.

It will require either a local MongoDB running or a environ variable `MONGO_URI`
pointing to a running instance.


## DB seed

Use this command to seed a DB (tested on MacOS, node v10):

```bash
# Local
MONGO_URI=mongodb://localhost:27017/eac \ 
LOUP_ACTORS_FILE=/path/to/loup/actors/csv/file \
JOCONDE_ACTORS_FILE=/path/to/joconde/actors/xlsx/file \
CANNES_ACTORS_FILE=/path/to/cannes/actors/xlsx/file \
npm run db-seed
```

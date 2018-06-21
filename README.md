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


## CSV tools

You may compose the MongoDB from a CSV file.

In order to do so:
- `make fix_csv file=path/to/your/file.csv` will rename the columns with the
one expected in the app
- `make csv_to_mongo file=path/to/your/file.csv` will prompt for the password
and import the CSV file into the MongoDB.

One you have imported your CSV into the database, you should run migrations

### Troubleshooting

#### Failed: fields cannot be identical: '' and ''

Your CSV has extra empty columns (`,,,,,,,`). You should clear out the columns
and try again.


### Failed: read error on entry …: bare " in non-quoted-field

Your CSV should enforce quoted text before injecting into MongoDB.
Save your CSV again checking the option for quoting all texts
(the option is called "quote all text cells" in LibreOffice).


## Running migrations

Importing the MongoDB from CSV generates raw data.
You should therefore apply some transformations through migrations:

```
mongo eac migrations
```

This task will apply migrations in the eac dababase of you localhost.

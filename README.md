# EAC API


## CSV tools

You may compose the MongoDB from a CSV file.

In order to do so:
- `make fix_csv file=path/to/your/file.csv` will rename the columns with the
one expected in the app
- `make csv_to_mongo file=path/to/your/file.csv` will prompt for the password
and import the CSV file into the MongoDB.


### Troubleshooting

#### Failed: fields cannot be identical: '' and ''

Your CSV has extra empty columns (`,,,,,,,`). You should clear out the columns
and try again.


### Failed: read error on entry …: bare " in non-quoted-field

Your CSV should enforce quoted text before injecting into MongoDB.
Save your CSV again checking the option for quoting all texts
(the option is called "quote all text cells" in LibreOffice).

csv_to_mongo:  # password="mongo_password" file="my_file.csv"
	mongo -u eac -p --eval "db.actors.remove({})" mongodb://eac:${password}@ds263740.mlab.com:63740/heroku_rskk4b5m
	mongoimport --uri=mongodb://eac:${password}@ds263740.mlab.com:63740/heroku_rskk4b5m -c actors --type csv --headerline --file $(file)

fix_csv:
	perl -pi -e 's/,"?adresse"?,/,address,/ if 1' $(file)
	perl -pi -e 's/,"?Compl_adresse"?,/,address2,/ if 1' $(file)
	perl -pi -e 's/,"?commune"?,/,city,/ if 1' $(file)
	perl -pi -e 's/,"?dep"?,/,department,/ if 1' $(file)
	perl -pi -e 's/,"?direction"?,/,ownerName,/ if 1' $(file)
	perl -pi -e 's/,"?dir_mail"?,/,ownerEmail,/ if 1' $(file)
	perl -pi -e 's/,"?dir_tel"?,/,ownerPhone,/ if 1' $(file)
	perl -pi -e 's/,"?Contact"?,/,contactName,/ if 1' $(file)
	perl -pi -e 's/,"?Cont_mail"?,/,contactEmail,/ if 1' $(file)
	perl -pi -e 's/,"?Cont_tel"?,/,contactPhone,/ if 1' $(file)
	perl -pi -e 's/,"?code_postal"?,/,postalCode,/ if 1' $(file)
	perl -pi -e 's/,"?geo_ban"?,/,banLatLng,/ if 1' $(file)
	perl -pi -e 's/,"?geo_insee"?,/,inseeLatLng,/ if 1' $(file)
	perl -pi -e 's/,"?coordonnees_finales"?,/,latLng,/ if 1' $(file)
	perl -pi -e 's/,"?code_Insee"?,/,inseeCode,/ if 1' $(file)
	perl -pi -e 's/,"?Domaine"?/,domain/ if 1' $(file)

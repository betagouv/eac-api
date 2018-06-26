MONGO_URI=mongodb://eac:$(password)@ds263660.mlab.com:63660/heroku_5pvx16b8
MONGO_URI=mongodb://localhost:27017/eac


fix_csv:  # file="my_file.csv"
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
	perl -pi -e 's/�/é/g' $(file)

csv_to_mongo:  # password="mongo_password" file="my_file.csv"
	@echo "Importing actors into $(MONGO_URI)"
	mongo -p --eval "db.actors.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c actors --type csv --headerline --file $(file)
	make migrate

migrate:
	@echo "Migrating $(MONGO_URI)"
	mongo $(MONGO_URI) migrations

import_schools_to_mongo:  # password="mongo_password" file="my_file.csv"
	# The file should be from https://www.data.gouv.fr/fr/datasets/r/f37d3fee-c5ab-40a1-8951-0f900bf8a99d
	# File should be saved again with coma separated values.

	@echo "Renaming columns"
	perl -pi -e 's/,"?nom"?,/,name,/ if 1' $(file)
	perl -pi -e 's/,"?CP"?,/,postalCode,/ if 1' $(file)
	perl -pi -e 's/,"?commune"?,/,city,/ if 1' $(file)
	perl -pi -e 's/,"?longitude \(X\)"?,/,latitude,/ if 1' $(file)
	perl -pi -e 's/,"?latitude \(Y\)"?,/,longitude,/ if 1' $(file)

	@echo "Importing schools into $(MONGO_URI)"
	mongo -p --eval "db.schools.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c schools --type csv --headerline --file $(file)

	@echo "Migrating $(MONGO_URI)"
	mongo $(MONGO_URI) migrations/schools.js

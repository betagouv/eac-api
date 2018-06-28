# MONGO_URI=mongodb://eac:$(password)@ds263660.mlab.com:63660/heroku_5pvx16b8
# MONGO_URI=mongodb://localhost:27017/eac

process_schools:
	@echo "Process schools  $(MONGO_URI)"
	node scripts/csv-schools.js > schools.json
	mongo --eval "db.schools.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c schools --jsonArray --file schools.json
	rm schools.json

process_actors:
	@echo "Process actors  $(MONGO_URI)"
	node scripts/csv-actors.js $(ACTORS_FILE) > actors.json
	node scripts/pre-geocode.js > addresses.csv
	rm -f addresses.geocoded.csv
	curl -X POST -F data=@./addresses.csv -F columns=address -F columns=city -F columns=postalCode https://api-adresse.data.gouv.fr/search/csv/ -O -J
	node scripts/post-geocode.js > actors.geocoded.json
	mongo --eval "db.actors.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c actors --jsonArray --file actors.geocoded.json
	rm actors.json actors.geocoded.json addresses.geocoded.csv addresses.csv

db_seed:
	make process_schools
	make process_actors
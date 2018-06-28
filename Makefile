# MONGO_URI=mongodb://eac:$(password)@ds263660.mlab.com:63660/heroku_5pvx16b8
# MONGO_URI=mongodb://localhost:27017/eac

process_schools:
	@echo "Process schools  $(MONGO_URI)"
	node scripts/csv-schools.js > result.json
	mongo -p --eval "db.schools.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c schools --jsonArray --file result.json
	rm result.json

process_actors:
	rm -f result.geocoded.csv
	@echo "Process actors  $(MONGO_URI)"
	node scripts/csv-actors.js $(ACTORS_FILE) > result.json
	node scripts/pre-geocode.js > result.csv
	curl -X POST -F data=@./result.csv -F columns=address -F columns=city -F columns=postalCode https://api-adresse.data.gouv.fr/search/csv/ -O -J
	node scripts/post-geocode.js > result2.json
	mongo -p --eval "db.actors.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c actors --jsonArray --file result2.json
	rm result.json result2.json result.geocoded.csv

db_seed:
	make process_schools
	make process_actors
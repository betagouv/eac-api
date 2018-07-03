# Prod: MONGO_URI=mongodb://eac:$(password)@ds263660.mlab.com:63660/heroku_5pvx16b8

process_schools:
	@echo "Process schools  $(MONGO_URI)"
	node scripts/csv-schools.js > schools.json
	mongo --eval "db.schools.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c schools --jsonArray --file schools.json
	rm schools.json

process_actors:
	@echo "Process actors  $(MONGO_URI)"
	node scripts/csv-actors.js $(ACTORS_FILE) > actors.json
	mongo --eval "db.actors.remove({})" $(MONGO_URI)
	ACTORS_FILE=$(ACTORS_FILE) MONGO_URI=$(MONGO_URI) ./scripts/geocode.sh
	rm actors.json actors.geocoded.json addresses.geocoded.csv addresses.csv

db_seed:
	make process_schools
	make process_actors

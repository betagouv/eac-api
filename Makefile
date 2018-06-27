# MONGO_URI=mongodb://eac:$(password)@ds263660.mlab.com:63660/heroku_5pvx16b8
# MONGO_URI=mongodb://localhost:27017/eac

process_schools:
	@echo "Process schools  $(MONGO_URI)"
	node scripts/csv-schools.js > result.json
	mongo -p --eval "db.schools.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c schools --jsonArray --file result.json
	rm result.json

process_actors:
	@echo "Process schools  $(MONGO_URI)"
	node scripts/csv-actors.js > result.json
	mongo -p --eval "db.actors.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c actors --jsonArray --file result.json
	rm result.json

db_seed:
	make process_schools
	make process_actors
# Prod: MONGO_URI=mongodb://eac:$(password)@ds263660.mlab.com:63660/heroku_5pvx16b8

# Download schools and add it to database
process_schools:
	@echo "Process schools  $(MONGO_URI)"
	node scripts/csv-schools.js > schools.json
	mongo --eval "db.schools.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c schools --jsonArray --file schools.json
	rm schools.json

# Remove all actors from database (warning)
remove_actors:
	@echo "Remove all actors $(MONGO_URI)"
	mongo --eval "db.actors.remove({})" $(MONGO_URI)

# Build actors from the file provided by Loup which is a mix between
# canope scraping and some data added by Loup
process_actors_canope:
	@echo "Process actors (canope) $(MONGO_URI)"
	node scripts/csv-actors.js $(LOUP_ACTORS_FILE) > actors.json
	LOUP_ACTORS_FILE=$(LOUP_ACTORS_FILE) MONGO_URI=$(MONGO_URI) ./scripts/geocode.sh
	rm actors.json actors.geocoded.json addresses.geocoded.csv addresses.csv

# Build actors from the file provided by Joconde via Nicolas
process_actors_joconde:
	@echo "Process actors (joconde) $(MONGO_URI)"
	node scripts/xlsx-joconde.js $(JOCONDE_ACTORS_FILE) > actors.json
	JOCONDE_ACTORS_FILE=$(JOCONDE_ACTORS_FILE) MONGO_URI=$(MONGO_URI) ./scripts/geocode.sh
	rm actors.json actors.geocoded.json addresses.geocoded.csv addresses.csv

# TODO: remove doublon with this script
post_fix_actors
	@echo "todo"

# This seeds the whole database
db_seed:
	make process_schools
	make remove_actors
	make process_actors_canope
	make process_actors_joconde
	make post_fix_actors

# OBSOLETE: This MAKEFILE must be copied to root in order to work. Anyway, this is not
# usable anymore. This file and all its siblings may be deleted anytime.

# Prod: MONGO_URI=mongodb://eac:$(password)@ds263660.mlab.com:63660/heroku_5pvx16b8

# Download schools and add it to database
process_schools:
	@echo "Process schools  $(MONGO_URI)"
	node scripts/legacy-seeders/csv-schools.js > schools.json
	mongo --eval "db.schools.remove({})" $(MONGO_URI)
	mongoimport --uri=$(MONGO_URI) -c schools --jsonArray --file schools.json
	rm schools.json

# Remove all actors from database (warning)
remove_actors:
	@echo "Remove all actors $(MONGO_URI)"
	mongo --eval "db.actors.remove({ source: { \$$ne: 'eac_website' }  })" $(MONGO_URI)

# Build actors from the file provided by Loup which is a mix between
# canope scraping and some data added by Loup
process_actors_canope:
	@echo "Process actors (canope) $(MONGO_URI)"
	node scripts/legacy-seeders/csv-actors.js $(LOUP_ACTORS_FILE) > actors.json
	ACTORS_FILE=$(LOUP_ACTORS_FILE) MONGO_URI=$(MONGO_URI) ./scripts/legacy-seeders/geocode.sh
	rm actors.json actors.geocoded.json addresses.geocoded.csv addresses.csv

# Build actors from the file provided by Joconde via Nicolas
process_actors_joconde:
	@echo "Process actors (joconde) $(MONGO_URI)"
	node scripts/legacy-seeders/xlsx-joconde.js $(JOCONDE_ACTORS_FILE) > actors.json
	ACTORS_FILE=$(JOCONDE_ACTORS_FILE) MONGO_URI=$(MONGO_URI) ./scripts/legacy-seeders/geocode.sh
	rm actors.json actors.geocoded.json addresses.geocoded.csv addresses.csv

# Build actors from the file "Actions / Acteurs (manuel)" created by @vinyll
process_actors_cannes:
	@echo "Process actors (cannes) $(MONGO_URI)"
	node scripts/legacy-seeders/xlsx-cannes.js $(CANNES_ACTORS_FILE) > actors.json
	mongoimport --uri=$(MONGO_URI) -c actors --jsonArray --file actors.json
	rm actors.json

# Remove doublon
post_fix_actors:
	@echo "Fix actors"
	node scripts/legacy-seeders/post-fix-actors.js $(MONGO_URI)

# This seeds the whole database
db_seed:
	make process_schools
	make remove_actors
	make process_actors_canope
	make process_actors_joconde
	make process_actors_cannes
	make post_fix_actors

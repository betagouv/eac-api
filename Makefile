csv_to_mongo:  # password="mongo_password" file="my_file.csv"
	# mongo -u eac -p=$(password) -h ds263740.mlab.com --port 63740 -d heroku_rskk4b5m
	# mongo ds263740.mlab.com:63740/heroku_rskk4b5m -u eac -p 3AcPlateforme --eval "db.actors.count()"
	mongoimport -p=$(password) --uri=mongo://ds263740.mlab.com:63740/heroku_rskk4b5m -c actors --type csv --headerline --file $(file)

fix_csv:
	perl -pi -e 's/,adresse,/,address,/' $(file)
	perl -pi -e 's/,Compl_adresse,/,address2,/' $(file)
	perl -pi -e 's/,commune,/,city,/' $(file)
	perl -pi -e 's/,dep,/,department,/' $(file)
	perl -pi -e 's/,direction,/,ownerName,/' $(file)
	perl -pi -e 's/,dir_mail,/,ownerEmail,/' $(file)
	perl -pi -e 's/,dir_tel,/,ownerPhone,/' $(file)
	perl -pi -e 's/,Contact,/,contactName,/' $(file)
	perl -pi -e 's/,Cont_mail,/,contactEmail,/' $(file)
	perl -pi -e 's/,Cont_tel,/,contactPhone,/' $(file)
	perl -pi -e 's/,code_postal,/,postalCode,/' $(file)
	perl -pi -e 's/,geo_ban,/,banLatLng,/' $(file)
	perl -pi -e 's/,geo_insee,/,inseeLatLng,/' $(file)
	perl -pi -e 's/,coordonnees_finales,/,latLng,/' $(file)
	perl -pi -e 's/,code_Insee,/,inseeCode,/' $(file)
	perl -pi -e 's/,Domaine/,domain/' $(file)
	## Replacing non-UTF8 chars (can't make it work though)
	# perl -pi -e 's/Ã©/é/g' $(file)
	# perl -pi -e 's/Ãª/ê/g' $(file)
	# perl -pi -e 's/Ã¢/â/g' $(file)
	# perl -pi -e 's/Ã´/ô/g' $(file)
	# perl -pi -e 's/Ã¨/è/g' $(file)
	# perl -pi -e 's/Âœ/œ/g' $(file)
	# perl -pi -e 's/Ã‰/É/g' $(file)
	# perl -pi -e 's/Ã§/ç/g' $(file)
	# perl -pi -e 's/Ã /à/g' $(file) # keep me last

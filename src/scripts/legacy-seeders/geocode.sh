for ((i=0; i<=$(wc -l < "$ACTORS_FILE"); i+=1000)); do
    echo from $i
    node scripts/legacy-seeders/pre-geocode.js $i > addresses.csv 
    j=$(wc -l < "addresses.csv")
    echo csv lines $j
    if (( j > 2 )); then
        echo ok
        rm -f addresses.geocoded.csv
        curl -X POST -F data=@./addresses.csv -F columns=address -F columns=city -F columns=postalCode https://api-adresse.data.gouv.fr/search/csv/ -O -J
        node scripts/legacy-seeders/post-geocode.js $i > actors.geocoded.json
        mongoimport --uri=$MONGO_URI -c actors --jsonArray --file actors.geocoded.json
    fi
done

if [ ! -f /app/data/db.json ]
then
    cp /app/cfg/db.json /app/data/db.json
fi

yarn run json-server --watch data/db.json --host 0.0.0.0 --port 30001

#!/bin/bash

sudo service postgresql stop

case $POSTGRESQL_VERSION in
    9.[5-9]*)
         sudo service postgresql start $POSTGRESQL_VERSION
    ;;
    *)
        sudo apt-get remove -q 'postgresql-*'
        sudo apt-get update -q
        sudo apt-get install -q postgresql-$POSTGRESQL_VERSION postgresql-client-$POSTGRESQL_VERSION
        sudo cp /etc/postgresql/{9.6,$POSTGRESQL_VERSION}/main/pg_hba.conf
        sudo service postgresql restart
    ;;
esac

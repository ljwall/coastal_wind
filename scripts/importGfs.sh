#! /bin/env bash

for HR in $(seq -f "%03g" 0 6 300); do
  FILE="./grib/gfs.t12z.pgrb2.0p50.f$HR"
  TABLE="gfs$HR"
  DROP="DROP TABLE $TABLE;"
  CREATE="CREATE TABLE $TABLE ( t1 varchar(255) DEFAULT NULL, t2 varchar(255) DEFAULT NULL, lat float DEFAULT NULL, lon float DEFAULT NULL, p1 varchar(64) DEFAULT NULL, p2 varchar(64) DEFAULT NULL, val double DEFAULT NULL);"

  mysql -u root -pbantham -Dgfs -e "$DROP"
  mysql -u root -pbantham -Dgfs -e "$CREATE"

  wgrib2 "$FILE" -mysql localhost root bantham gfs "$TABLE" -match "(UGRD|VGRD):10 m above"
done;

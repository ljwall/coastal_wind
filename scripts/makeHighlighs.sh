#! /bin/env bash

for HR in $(seq -f "%03g" 0 6 300); do
  TABLE="gfs$HR"
  OUTFILE="./public/geojson/wind-paths-$HR.geojson"

  node "./scripts/makeHighlight.js" "$TABLE" "$OUTFILE"
done;

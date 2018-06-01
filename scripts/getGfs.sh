#! /bin/env bash

for hr in $(seq -f "%03g" 0 6 300); do
  echo "Getting gfs.t12z.pgrb2.0p50.f$hr"

  wget "http://www.ftp.ncep.noaa.gov/data/nccf/com/gfs/prod/gfs.2018060112/gfs.t12z.pgrb2.0p50.f$hr"
done;

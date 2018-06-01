const fs = require('fs'),
  mysql = require('mysql');

var geojsonObject = {
  'type': 'FeatureCollection',
  'features': []
};

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'bantham',
  database: 'gfs'
});

connection.query('select * from gfs25 where lat>47 and lon>-8 and lat<65 and lon<5 AND p2="10 m above ground" AND p1 IN ("UGRD")', (err, ugrd) => {
    if (err) {
      console.log('errorA', err);
        connection.end();
      process.exit();
    }

    connection.query('select * from gfs25 where lat>47 and lon>-8 and lat<65 and lon<5 AND p2="10 m above ground" AND p1 IN ("VGRD")', (err, vgrd) => {
      if (err) {
        console.log('errorB', err);

        connection.end();
        process.exit(1);
      }

      ugrd.forEach((urow) => {
        vrow = vgrd.find((row) => row.lat == urow.lat && row.lon == urow.lon)

        if (typeof vrow === 'undefined') return;

        var speed = Math.sqrt(urow.val*urow.val + vrow.val*vrow.val),
          beaufort = speed < 0.3 ? 0 :
                     speed < 1.5 ? 1 :
                     speed < 3.3 ? 2 :
                     speed < 5.5 ? 3 :
                     speed < 7.9 ? 4 :
                     speed < 10.7 ? 5 :
                     speed < 13.8 ? 6 :
                     speed < 17.1 ? 7 :
                     speed < 20.7 ? 8 :
                     speed < 24.4 ? 9 :
                     speed < 28.4 ? 10 :
                     speed < 28.4 ? 10 :
                     speed < 32.6 ? 11 : 12;

        geojsonObject.features.push({
          type: 'Feature',
          properties: {
            wind: {
              beaufort: beaufort,
              direction: Math.atan2(vrow.val, urow.val)
            }
          },
          geometry: {
            type: 'Point',
            coordinates: [ urow.lon , urow.lat]
          }
        });
      });

      fs.writeFile(__dirname+'/wind-grid.geojson', JSON.stringify(geojsonObject), (err) => {
        if (err)
          return console.log('error');

        console.log('file wirtten');
      });

      connection.end();
    });
});


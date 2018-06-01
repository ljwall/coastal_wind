const table = process.argv[2] || 'gfs25',
  outfile = process.argv[3] || __dirname+'/wind-paths.geojson';

const fs = require('fs'),
  mysql = require('mysql');

var geojsonObject = {
  'type': 'FeatureCollection',
  'features': []
};

var features = {
  onshore: [],
  offshore: [],
  crossshore: []
};

['onshore', 'offshore', 'crossshore'].forEach((dir) => {
  var feature;

  for (var i=0; i <= 12; i++) {
    feature = {
      type: 'Feature',
      properties: {
        beaufort: i,
        direction: dir
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: []
      }
    };

    geojsonObject.features.push(feature);
    features[dir].push(feature);
  }
});

fs.readFile(__dirname+'/GB-parts.geojson', 'utf8', (err, json) => {
  var data = JSON.parse(json);

  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bantham',
    database: 'gfs'
  });

  connection.query('select * from '+table+' where lat>47 and lon>-8 and lat<65 and lon<5 AND p2="10 m above ground" AND p1 IN ("UGRD", "VGRD")', (err, res, fields) => {

    data.features.forEach((feature) => {
      var a = false;

      feature.geometry.coordinates[0].forEach((b) => {
        if (a === false) {
          a = b;
          return;
        }

        var lat = Math.round((a[1] + b[1]) * 2) / 4,
          lon = Math.round((a[0] + b[0]) * 2) / 4,
          ugrd = res.find((row) => row.lat == lat && row.lon == lon && row.p1 === 'UGRD'),
          vgrd = res.find((row) => row.lat == lat && row.lon == lon && row.p1 === 'VGRD');

        if (typeof ugrd === 'undefined' || typeof vgrd === 'undefined') return;

        // speed in m/s
        var speed = Math.sqrt(ugrd.val*ugrd.val + vgrd.val*vgrd.val),
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

        var landBearing = bearing(a[1], a[0], b[1], b[0]),
          windBearing = Math.atan2(vgrd.val, ugrd.val),
          windDiff = (windBearing - landBearing) * 180 / Math.PI,
          dir;

        if (windDiff > 180) {
          windDiff -= 360;
        } else if (windDiff < -180) {
          windDiff += 360;
        }

        if (15 <= windDiff && windDiff <= 180 - 15) {
          dir = 'offshore';
        } else if (-180 + 15 <= windDiff && windDiff <= - 15) {
          dir = 'onshore';
        } else {
          dir = 'crossshore';
        }

        features[dir][beaufort].geometry.coordinates.push([a, b]);

        // Store the previous point
        a = b;
      });

    });

    fs.writeFile(outfile, JSON.stringify(geojsonObject), (err) => {
      if (err)
        return console.log('error');

      console.log('file wirtten');
    });

  });

  connection.end();
});

/**
 * Returns bearing from one point to another, in radians
 */
function bearing(lat1, lon1, lat2, lon2) {
  var y = Math.sin(lon2-lon1) * Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2) -
          Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
  return Math.atan2(y, x);
}


import './main.less';
import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';

import Icon from 'ol/style/icon';
import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import GeoJSON from 'ol/format/geojson';
import proj from 'ol/proj'


const style = new Style({
    fill: new Fill({
      color: '#27262a'
    }),
    stroke: new Stroke({
      color: '#27262a',
      width: 1
    })
  }),

  highlightStyle = new Style({
    fill: new Fill({
      color: '#27262a'
    }),
    stroke: null
  }),

  	spotsStyle = new Style({
		image: new Circle({
		     radius: 4,
		     fill: new Fill({
				color: '#3089cb'
			}),
		     stroke: new Stroke({
		     	color: '#fff',
		     	width: 2
		     })
		 })
	}),

  	dangerPath =  new Style({
		stroke: new Stroke({
			color: '#ce3d48',
			width: 2
		})
	}),

  	successPath =  new Style({
		stroke: new Stroke({
			color: '#85b446',
			width: 2
		})
	}),

  	warningPath =  new Style({
		stroke: new Stroke({
			color: '#e76b38',
			width: 2
		})
	});

var windPathsLayers = [
  "000", "006", "012", "018", "024", "030", "036", "042",
  "048", "054", "060", "066", "072", "078", "084", "090", "096",
  "102", "108", "114", "120", "126", "132", "138"] .map((hr) => {
    return new VectorLayer({
      visible: false,
      source: new VectorSource({
        url: '/geojson/wind-paths-'+hr+'.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => {
        var props = feature.getProperties();

        if (props.direction === 'offshore') {

          if (feature.getProperties().beaufort >=6) {
            return dangerPath;
          } else if (feature.getProperties().beaufort >=4) {
            return warningPath;
          } else {
            return successPath;
          }

        } else if (props.direction === 'crossshore') {

          if (feature.getProperties().beaufort >=3) {
            return dangerPath;
          } else if (feature.getProperties().beaufort >=2) {
            return warningPath;
          } else {
            return successPath;
          }

        } else {

          return dangerPath;

        }
      }
  });
});

var windPathsLayer = windPathsLayers[0],
  curLayer = 0;

windPathsLayer.setVisible(true);

var windIcons = new VectorLayer({
		source: new VectorSource({
			url: '/geojson/wind-grid.geojson',
			format: new GeoJSON()
		}),
		style: (feature) => {
      var props = feature.getProperties();

			return new Style({
				image: new Icon({
					src: '/svg/windIcon.svg',
					imgSize: [12, 29],
          scale: props.wind.beaufort / 3.0,
					rotation: -props.wind.direction
		        })
			});
		}
    });

var spotLayer = new VectorLayer({
    	source: new VectorSource({
			url: '/geojson/spots.geojson',
			format: new GeoJSON()
    	}),
    	style: spotsStyle,
    });

var map = new Map({
  target: 'map',
  layers: [
    new VectorLayer({
      source: new VectorSource({
        url: '/geojson/NUTS/NUTS_RG_01M_2013_4326_LEVL_0.geojson',
        //url: '/geojson/UK-parts.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => {
        if (feature.values_.NUTS_ID === 'UK')
          return highlightStyle;

        return style;
      }
    })].concat(
      // Wind Paths
      windPathsLayers
    ).concat([
    // Wind Icons
    windIcons,
    // Spots
    spotLayer,
  ]),
  view: new View({
    center: proj.fromLonLat([-4.5155615, 50.4004579]),
    zoom: 9
  }),
});

map.getView().on('change', function () {
	var zoom = this.getZoom();
		//spots = map.getLayers()['array_'][3];
		//wind = map.getLayers()['array_'][2];

	if (this.getZoom() <= 8) {
		spotLayer.setVisible(false);
		windIcons.setVisible(false)

	} else {
		spotLayer.setVisible(true);
		windIcons.setVisible(true)
	}
});

$('.scrubber li').hover(function () {
	var id = $(this).data('id'),
		//paths = map.getLayers()['array_'][2],
		wind = map.getLayers()['array_'][3];


  //console.log(id);
  windPathsLayers[curLayer].setVisible(false);
  curLayer = +id
  console.log(curLayer);
  windPathsLayers[curLayer].setVisible(true);

	//windPathsLayer.setSource(new VectorSource({
	//		url: '/geojson/wind-paths-'+id+'.geojson',
	//		format: new GeoJSON()
	//	}));
	// wind.setSource(id);
});
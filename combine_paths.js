// polyfill for the deprecated `pathSegList`
// https://github.com/progers/pathseg
require("./js/pathseg.js");

module.exports = function(selector) {
  // get the paths 
  var paths = document.querySelectorAll(selector + " path");

  // convert to coordinates
  var coordinates = [];

  paths.forEach(function(path, i) {
    var segment = path.pathSegList;

    var coords = [];
    for (var c = 0; c < segment.numberOfItems; c += 1) {
      coords.push([ segment.getItem(c).x, segment.getItem(c).y ]);
    }

    var first = coords[0];
    var last = coords.slice(-1)[0];

    coordinates.push({
      first: first,
      last: last,
      coords: coords,
      path: path
    });
  });

  // the maximum distance between two lines should be 25 pixels
  var MAX_SEP = 25;
  var super_coordinates = [];

  // combine coords that begin or end near one another;
  while (coordinates.length > 1) {
    for (var c = 1; c < coordinates.length; c += 1) {
      var MATCHED = false;
      var match_type;

      var distances = {
        last_to_first: Math.pow(coordinates[0].last[0] - coordinates[c].first[0], 2) + Math.pow(coordinates[0].last[1] - coordinates[c].first[1], 2),
        first_to_last: Math.pow(coordinates[0].first[0] - coordinates[c].last[0], 2) + Math.pow(coordinates[0].first[1] - coordinates[c].last[1], 2),
        first_to_first: Math.pow(coordinates[0].first[0] - coordinates[c].first[0], 2) + Math.pow(coordinates[0].first[1] - coordinates[c].first[1], 2),
        last_to_last: Math.pow(coordinates[0].last[0] - coordinates[c].last[0], 2) + Math.pow(coordinates[0].last[1] - coordinates[c].last[1], 2)
      };

      var d = Math.min(distances.last_to_first, distances.first_to_last, distances.first_to_first, distances.last_to_last);

      if (d > MAX_SEP * MAX_SEP) {
        // console.log("Nothing close", coordinates);
        continue;
      }

      if (distances.last_to_first == d) {
        coordinates[c].coords = coordinates[0].coords.concat(coordinates[c].coords);
        match_type = "last-to-first";
      } else if (distances.first_to_last == d) {
        coordinates[c].coords = coordinates[c].coords.concat(coordinates[0].coords);
        match_type = "first-to-last";
      } else if (distances.first_to_first == d) {
        coordinates[c].coords = coordinates[0].coords.reverse().concat(coordinates[c].coords);
        match_type = "first-to-first";        
      } else if (distances.last_to_last == d) {
        coordinates[c].coords = coordinates[0].coords.concat(coordinates[c].coords.reverse());
        match_type = "last-to-last";
      } else {
        console.log("ERROR", distances, d);
        continue;
      }

      coordinates[c].first = coordinates[c].coords[0];
      coordinates[c].last = coordinates[c].coords.slice(-1)[0];

      /*
      var combined_path = document.createElementNS(svg.namespaceURI,"path");  
      combined_path.setAttributeNS(null, "d", line(coordinates[c].coords).replace(/L/g, "L "));
      combined_path.classList.add("example");
      svg.appendChild(combined_path);
      coordinates[c].path = combined_path;      
      console.log(match_type, coordinates[0].path, coordinates[c].path, coordinates[c]);        
      */

      coordinates.shift();
      MATCHED = true;
      break;
    }

    if (!MATCHED) {
      //console.log("No match", coordinates[0]);
      super_coordinates.push(coordinates[0]);
      coordinates.shift();        
    }
  }

  if (coordinates.length > 0) {
    // console.log("one left over", coordinates);
    super_coordinates.push(coordinates[0]);
    coordinates.shift();        
  }

  return super_coordinates;
}
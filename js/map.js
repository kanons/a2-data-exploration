// Map code

// Declare variables for map and path
var drawMap, pathGen;

$(function() {
  // Generate path
  pathGen = d3.geo.path();

  // Append SVG to div and set dimensions
  var svg = d3.select("#vis").append("svg")
      .attr("width", 850)
      .attr("height", 500);
  
  // Function to draw world map
  drawMap = function() {
    // Paths -- one each
    var paths = svg.selectAll("path")
        .data(topojson.feature(settings.data, settings.data.objects.counties).features);

    paths.enter().append('path')
        .attr("class", "border border--state")
        .attr("d", pathGen)

    paths.transition().duration(1000).delay(function(d, i) {
      return xScale(pathGen.centroid(d)[0])*1.5
    }).style('fill', function(d, i){
          return settings.scale == 'quantize' ? quantizeScale(values[i]) : quantileScale(values[i])
        })
  };
});
/* Create a barchart of drinking patterns*/
$(function() {
    // Read in prepped_data file
    d3.csv('data/claims-data-2015.csv', function(error, data) {

        /************************************** Data prep ***************************************/

        // Track the sex (male, female) and drinking type (any, binge) in variables
        var measure = 'claim_site';

        // You'll need to *aggregate* the data such that, for each device-app combo, you have the *count* of the number of occurances
        data.forEach(function(d) {
            d.value = 1;
        });

        var countSite = d3.nest()
            .key(function(d) {return d.Claim_Site;})
            .rollup(function(d) { 
                return d3.sum(d, function(g) {return g.value; });
            }).entries(data);

        var countType = d3.nest()
            .key(function(d) {return d.Claim_Type;})
            .rollup(function(d) { 
                return d3.sum(d, function(g) {return g.value; });
            }).entries(data);

        var countMonth = d3.nest()
            .key(function(d) {
                var date = new Date(d.Incident_D);
                var month = date.getMonth();
                //var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                //return months[date.getMonth()];
                return month;
                //return d.Item_Category;
            })
            .rollup(function(d) { 
                return d3.sum(d, function(g) {return g.value; });
            }).entries(data);
        // Margin: how much space to put in the SVG for axes/titles
        var margin = {
            left: 70,
            bottom: 100,
            top: 50,
            right: 50
        };

        // Height and width of the total area
        var height = 600;
        var width = 1000;

        // Height/width of the drawing area for data symbols
        var drawHeight = height - margin.bottom - margin.top;
        var drawWidth = width - margin.left - margin.right;

        // Select SVG to work with, setting width and height (the vis <div> is defined in the index.html file)
        var svg = d3.select('#vis')
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        // Append a 'g' element in which to place the rects, shifted down and right from the top left corner
        var g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('height', drawHeight)
            .attr('width', drawWidth);

        // Append an xaxis label to your SVG, specifying the 'transform' attribute to position it (don't call the axis function yet)
        var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (drawHeight + margin.top) + ')')
            .attr('class', 'axis');

        // Append a yaxis label to your SVG, specifying the 'transform' attribute to position it (don't call the axis function yet)
        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');

        // Append text to label the y axis (don't specify the text yet)
        var xAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left + drawWidth / 2) + ',' + (drawHeight + margin.top + 40) + ')')
            .attr('class', 'title');

        // Append text to label the y axis (don't specify the text yet)
        var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + drawHeight / 2) + ') rotate(-90)')
            .attr('class', 'title');

        // Define xAxis using d3.axisBottom(). Scale will be set in the setAxes function.
        var xAxis = d3.axisBottom();

        // Define yAxis using d3.axisLeft(). Scale will be set in the setAxes function.
        var yAxis = d3.axisLeft()
            .tickFormat(d3.format('.2s'));

        // Define an xScale with d3.scaleBand. Domain/rage will be set in the setScales function.
        var xScale = d3.scaleBand();

        // Define a yScale with d3.scaleLinear. Domain/rage will be set in the setScales function.
        var yScale = d3.scaleLinear();

        // Write a function for setting scales.
        var setScales = function(currentData) {
            // Get the unique values of states for the domain of your x scale
            var xValues = currentData.map(function(d) {
                return d.key;
            });

            // Set the domain/range of your xScale
            xScale.range([0, drawWidth])
                .padding(0.2)
                .domain(xValues);

            // Get min/max values of the percent data (for your yScale domain)
            var yMin = d3.min(currentData, function(d) {
                return d.value;
            });

            var yMax = d3.max(currentData, function(d) {
                return d.value;
            });

            // Set the domain/range of your yScale
            yScale.range([drawHeight, 0])
                .domain([0, yMax]);
        };

        // Function for setting axes
        var setAxes = function() {
            // Set the scale of your xAxis object
            xAxis.scale(xScale);

            // Set the scale of your yAxis object
            yAxis.scale(yScale);

            // Render (call) your xAxis in your xAxisLabel
            xAxisLabel.transition().duration(1500).call(xAxis);

            // Render (call) your yAxis in your yAxisLabel
            yAxisLabel.transition().duration(1500).call(yAxis);

            // Update xAxisText and yAxisText labels
            xAxisText.text(measure);
            yAxisText.text('Number of Claims');
        }

        // Write a function to filter down the data to the current sex and type
        var filterData = function() {
            // var currentData;
            if(measure == 'claim_site') {
                var currentData = countSite;
            } else if(measure == 'claim_type') {
                var currentData = countType
            } else if(measure == 'incident_date') {
                var currentData = countMonth;
            }
            return currentData;
        };

        // Add tip
        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
            return d.value;
        });
        g.call(tip);

        // Store the data-join in a function: make sure to set the scales and update the axes in your function.
        var draw = function(currentData) {
            // Set scales
            setScales(currentData);

            // Set axes
            setAxes();

            // Select all rects and bind data
            var bars = g.selectAll('rect').data(currentData);

            // Use the .enter() method to get your entering elements, and assign initial positions
            bars.enter().append('rect')
                .attr('x', function(d) {
                    return xScale(d.key);
                })
                .attr('y', function(d) {
                    return drawHeight;
                })
                .attr('height', 0)
                .attr('class', 'bar')
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .attr('width', xScale.bandwidth())
                .merge(bars)
                .transition()
                .duration(500)
                .delay(function(d, i) {
                    return i * 50;
                })
                .attr('y', function(d) {
                    return yScale(d.value);
                })
                .attr('height', function(d) {
                    return drawHeight - yScale(d.value);
                });

            // Use the .exit() and .remove() methods to remove elements that are no longer in the data
            bars.exit().remove();
        };

        // Assign a change event to input elements to set the sex/type values, then filter and update the data
        $("input").on('change', function() {
            // Get value, determine if it is the sex or type controller
            var val = $(this).val();
            measure = val;

            // Filter data, update chart
            var currentData = filterData();
            draw(currentData);
        });

        // Filter data to the current settings then draw
        var currentData = filterData();
        draw(currentData);

    });
});
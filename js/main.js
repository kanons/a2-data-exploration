/* Bar chart of impaired driving death rates from 2014*/
$(function() {
    // Variables for scale and filtered data
    var xScale, yScale, currentData, checking;

    // Track the death rate column in variable
    var rate = 'All Ages';

    // Margin in SVG for axes and titles
    var margin = {
        left: 70,
        bottom: 100,
        top: 50,
        right: 50,
    };

    // Height and width of the drawing area
    var height = 600 - margin.bottom - margin.top;
    var width = 1000 - margin.left - margin.right;

    // Read in data file
    // https://catalog.data.gov/dataset/impaired-driving-death-rate-by-age-and-gender-2012-all-states-587fd
    d3.csv('data/Impaired_Driving_Data.csv', function(error, allData) {
        /* ************************************** Create chart wrappers ***************************************/
        // Select SVG and set dimensions
        var svg = d3.select('#vis')
            .append('svg')
            .attr('height', 600)
            .attr('width', 1000);
        
        // Append text to SVG for title
        var title = svg.append('text')

        // Append 'g' element, translate to top left, set dimensions
        var g = svg.append('g')
            .attr('transform', 'translate(' + margin.left+ ',' + margin.top + ')')
            .attr('height', height)
            .attr('width', width);

        /* ********************************** Data prep  ********************************** */

        // Function to filter down data to current rate type
        var filterData = function() {
            currentData = allData
                .filter(function(d) {
                    return checkData(d);
                })
        }

        /* ********************************** Select rate  ********************************** */

        var checkData = function(d) {
                if(rate == 'All Ages') {
                    checking = d.all_ages;
                } else if(rate == 'Ages 0-20') {
                    checking = d.ages_0_20;
                } else if(rate == 'Ages 21-34') {
                    checking = d.ages_21_34;
                } else if(rate == 'Ages 35+') {
                    checking = d.ages_35;
                } else if(rate == 'Male') {
                    checking = d.male;
                } else if(rate == 'Female') {
                    checking = d.female;
                }
                return checking;
        }

        /* ********************************** Define scale and axis variables  ********************************** */

        // Append x-axis label to SVG and position
        var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
            .attr('class', 'axis')

        // Append y-axis label to SVG and position
        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');

        // Append 'text' to label the y axis
        var xAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left + width / 2) + ',' + (height + margin.top + 80) + ')')
            .attr('class', 'title');

        // Append 'text' to label the y axis
        var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + height / 2) + ') rotate(-90)')
            .attr('class', 'title');

        /* ********************************** Functions for setting scales and axes  ********************************** */
        // Function to set scales
        var setScales = function(data) {
            // Get states for the domain of x-scale
            var states = data.map(function(d) {return d.state;});

            // Ordinal xScale
            xScale = d3.scaleBand()
                .range([0, width], .2)
                .domain(states)
                .padding(0.1);

            // Get min/max values of the percent data
            var yMin = d3.min(data, function(d) {
                return checkData(d);
            });

            // Get y-maximum for domain of y-scale
            var yMax = d3.max(data, function(d) {
                return checkData(d)*1.1;
            });

            // Define the yScale
            yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, yMax]);
        }

        // Function for setting axes
        var setAxes = function() {
            // Define x-axis using d3.axisBottom(), assigning the scale as the xScale
            var xAxis = d3.axisBottom()
                .scale(xScale);

            // Define y-axis using d3.axisLeft(), assigning the scale as the yScale
            var yAxis = d3.axisLeft()
                .scale(yScale)
                .tickFormat(d3.format('.2s'));

            // Call xAxis, rotate axis labels
            xAxisLabel.call(xAxis)
                .selectAll('text')
                .style("text-anchor", "end")
                .attr('transform', 'rotate(-45) translate(-5, -5)');

            // Call yAxis
            yAxisLabel.transition().duration(1500).call(yAxis);

            // x-axis title label
            xAxisText.text('State')

            // y-axis title label
            yAxisText.text('Death Rate (per 100K population)')

            // Chart title, changes on rate type
            title.text('Impaired Driving Death Rates' + ' ('+ rate + ')')
            .attr('transform', 'translate(' + (margin.left + width / 2) + ',' + (margin.top-20)  + ')')
            .attr('text-anchor', 'middle')  
            .style('font-size', '16px')
            .style('font-weight', 'bold');

        }

        /* ********************************** Function for drawing bars  ********************************** */

        // Store the data-join in a function: make sure to set the scales and update the axes in your function.
        var draw = function(data) {
            // Set scales
            setScales(data);

            // Set axes
            setAxes();

            // Select all rects and bind data
            var bars = g.selectAll('rect').data(data);

            // Get entering elements and assign position
            bars.enter().append('rect')
                .attr('x', function(d) {
                    return xScale(d.state);
                })
                .attr('y', function(d) {
                    return yScale(checkData(d));
                })
                .attr('height', function(d) {
                    return height - yScale(checkData(d));
                })
                .attr('width', xScale.bandwidth())
                .attr('class', 'bar')
                .attr('fill', '#ff4646')
                .attr('data-original-title', function(d) {
                    return (d.state + ": " + checkData(d));
                });

            // Update hover title
            bars.attr('data-original-title', function(d) {
                    return (d.state + ": " + checkData(d));
            });

            // Remove elements not in data
            bars.exit().remove();

            // Transition properties of the update selection
            bars.transition()
                .duration(1500)
                .delay(function(d, i) {
                    return i * 50;
                })
                .attr('height', function(d) {
                    return height - yScale(checkData(d));
                })
                .attr('y', function(d) {
                    return yScale(checkData(d));
                });
        };

        /* ********************************** Event listener  ********************************** */

        // Change event to input elements to set rate value and update
        $("input").on('change', function() {
            var val = $(this).val();
            rate = val;

            // Filter data, update chart
            filterData();
            draw(currentData);
        });

        // Filter data to the current settings then draw
        filterData();
        draw(currentData);

        /* ********************************** Hover tooltip  ********************************** */

        /* Using jQuery, select all circles and apply a tooltip */
        $("rect").tooltip({
            'container': 'body',
            'placement': 'top'
        });

    });
});

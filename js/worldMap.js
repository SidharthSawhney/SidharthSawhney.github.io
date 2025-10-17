
/*
 * StackedAreaChart - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the that's provided initially
 * @param  displayData      -- the data that will be used finally (which might vary based on the selection)
 *
 * @param  focus            -- a switch that indicates the current mode (focus or stacked overview)
 * @param  selectedIndex    -- a global 'variable' inside the class that keeps track of the index of the selected area
 */

class WorldMap {

// constructor method to initialize StackedAreaChart object
constructor(parentElement) {
    this.parentElement = parentElement;
    this.countryData = {};
    this.displayData = [];
}


	/*
	 * Method that initializes the visualization (static content, e.g. SVG area or axes)
 	*/
	initVis(){
		let vis = this;

		vis.margin = {top: 40, right: 40, bottom: 60, left: 40};

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "5px")
            .style("border", "1px solid black")
            .style("display", "none");

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			
        vis.g = vis.svg.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Store initial transform for reset
        vis.initialTransform = `translate(${vis.margin.left},${vis.margin.top})`;

        // Setup close button handler
        d3.select("#close-panel").on("click", function() {
            // Slide out panel
            d3.select("#country-panel").style("right", "-50%");
            
            // Reset zoom
            vis.g.transition()
                .duration(750)
                .attr("transform", vis.initialTransform);
        });

		// Overlay with path clipping
		vis.svg.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", vis.width)
			.attr("height", vis.height);

        vis.projection = d3.geoMercator()
            .scale(vis.width / 6.5)
            .translate([vis.width / 2, vis.height / 1.5]);

        vis.path = d3.geoPath().projection(vis.projection);
        
        // Load country data first, then world map
        d3.json("data/new.json").then(countryData => {
            vis.countryData = countryData;
            
            // Calculate min and max values from data
            const values = Object.values(countryData);
            vis.minValue = d3.min(values);
            vis.maxValue = d3.max(values);
            
            // Create color scale based on actual data range
            vis.colorScale = d3.scaleSequential()
                .interpolator(d3.interpolateYlOrRd)
                .domain([vis.minValue, vis.maxValue]);
            
            // Draw legend with dynamic scale
            vis.drawLegend();
            
            // Load world map
            d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(worldData => {
            vis.g.selectAll("path")
                .data(worldData.features)
                .enter()
                .append("path")
                .attr("d", vis.path)
                .attr("fill", d => {
                    const countryName = d.properties.name;
                    const value = vis.countryData[countryName];
                    return value !== undefined ? vis.colorScale(value) : "#cccccc";
                })
                .attr("stroke", "#333333")
                .attr("stroke-width", 0.5)
                .style("opacity", 0.9)
                .on("mouseover", function(event, d) {
                    vis.tooltip.style("display", "block").text(d.properties.name);
                })
                .on("mousemove", function(event) {
                    vis.tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY + 10) + "px");
                })
                .on("mouseout", function() {
                    vis.tooltip.style("display", "none");
                })
                .on("click", function(_, d) {
                    // Slide in the panel and set country name
                    d3.select("#country-panel").style("right", "0");
                    d3.select("#country-name").text(d.properties.name);
                    
                    const bounds = vis.path.bounds(d);
                    const dx = bounds[1][0] - bounds[0][0];
                    const dy = bounds[1][1] - bounds[0][1];
                    const x = (bounds[0][0] + bounds[1][0]) / 2;
                    const y = (bounds[0][1] + bounds[1][1]) / 2;
                    // Scale to fit left half of canvas (width / 2)
                    const scale = 0.9 / Math.max(dx / (vis.width / 2), dy / vis.height);
                    // Center in left half (width / 4 instead of width / 2)
                    const translate = [vis.width / 4 - scale * x, vis.height / 2 - scale * y];

                    vis.g.transition()
                        .duration(750)
                        .attr("transform", `translate(${translate}) scale(${scale})`);
                });
            });
        });

		// TO-DO: (Filter, aggregate, modify data)
		vis.wrangleData();

	}

	/*
 	* Data wrangling
 	*/
	wrangleData(){
		let vis = this;
        
        vis.displayData = vis.stackedData;


		// Update the visualization
		vis.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
 	* Function parameters only needed if different kinds of updates are needed
 	*/
	updateVis(){
		// let vis = this;

		// // Update domain
        // // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
        // vis.y.domain([0, d3.max(vis.displayData, function(d) {
        //     return d3.max(d, function(e) {
        //         return e[1];
        //     });
        // })
        // ]);

		// // Draw the layers
		// let categories = vis.svg.selectAll(".area")
		// 	.data(vis.displayData);

		// categories.enter().append("path")
		// 	.attr("class", "area")
		// 	.merge(categories)
		// 	.style("fill", d => {
		// 		return vis.colorScale(d)
		// 	})
		// 	.attr("d", d => vis.area(d))
		// 	.on("mouseover", (_, d) => {
		// 		vis.tooltip.text(d.key);
		// 	})
		// 	.on("mouseout", (_, d) => {
		// 		vis.tooltip.text("");
		// 	})
            
            
        //     // TO-DO (Activity IV): update tooltip text on hover
			

		// categories.exit().remove();

		// // Call axis functions with the new domain
		// vis.svg.select(".x-axis").call(vis.xAxis);
		// vis.svg.select(".y-axis").call(vis.yAxis);
	}

	/*
	 * Draw the color legend
	 */
	drawLegend() {
		let vis = this;

		const legendSvg = d3.select("#legend");
		const legendWidth = 30;
		const legendHeight = parseInt(legendSvg.style("height"));
		const axisWidth = 35;

		// Create gradient
		const defs = legendSvg.append("defs");
		const linearGradient = defs.append("linearGradient")
			.attr("id", "legend-gradient")
			.attr("x1", "0%")
			.attr("y1", "100%")
			.attr("x2", "0%")
			.attr("y2", "0%");

		// Create color stops for gradient using dynamic values
		const numStops = 10;
		for (let i = 0; i <= numStops; i++) {
			const value = vis.minValue + (i / numStops) * (vis.maxValue - vis.minValue);
			linearGradient.append("stop")
				.attr("offset", `${(i / numStops) * 100}%`)
				.attr("stop-color", vis.colorScale(value));
		}

		// Draw legend rectangle
		legendSvg.append("rect")
			.attr("x", axisWidth)
			.attr("y", 0)
			.attr("width", legendWidth)
			.attr("height", legendHeight)
			.style("fill", "url(#legend-gradient)")
			.style("stroke", "#333")
			.style("stroke-width", 1);

		// Add scale for axis with dynamic domain
		const legendScale = d3.scaleLinear()
			.domain([vis.minValue, vis.maxValue])
			.range([legendHeight, 0]);

		const legendAxis = d3.axisLeft(legendScale)
			.ticks(6)
			.tickFormat(d3.format(".2f"));

		// Add axis on the left side
		legendSvg.append("g")
			.attr("transform", `translate(${axisWidth}, 0)`)
			.call(legendAxis)
			.style("font-size", "10px");
	}
}
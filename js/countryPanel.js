
/*
 * StackedAreaChart - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the that's provided initially
 * @param  displayData      -- the data that will be used finally (which might vary based on the selection)
 *
 * @param  focus            -- a switch that indicates the current mode (focus or stacked overview)
 * @param  selectedIndex    -- a global 'variable' inside the class that keeps track of the index of the selected area
 */

class CountryPanel {

// constructor method to initialize StackedAreaChart object
constructor(parentElement, countryData) {
    this.parentElement = parentElement;
    this.countryData = countryData;
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

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			
        vis.g = vis.svg.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr("width", 100)
            .attr("height", 100)
            .style("background", "black");

        

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

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
constructor(parentElement, internalData) {
    this.parentElement = parentElement;
    this.internalData = internalData; // Internal data (year -> country -> {jewelry, bar_and_coin})
    this.selectedCountry = null;
    this.currentYear = "2024";
    this.displayData = [];
}


	/*
	 * Method that initializes the visualization (static content, e.g. SVG area or axes)
 	*/
	initVis(){
		let vis = this;

		vis.margin = {top: 40, right: 40, bottom: 60, left: 60};

		const container = document.getElementById(vis.parentElement);
		console.log('Panel container:', container);
		console.log('Container dimensions:', container.getBoundingClientRect());
		
		vis.width = container.getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = container.getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
		
		console.log('Panel dimensions:', vis.width, vis.height);

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.style("border", "1px solid #ddd");
			
        vis.g = vis.svg.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Placeholder text when no country is selected
        vis.placeholderText = vis.g.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#999")
            .text("Select a country to view details");
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
	 * Update the visualization for a selected country
	 */
	updateCountry(countryName, year) {
		let vis = this;
		
		console.log('updateCountry called with:', countryName, year);
		console.log('Internal data:', vis.internalData);
		
		vis.selectedCountry = countryName;
		vis.currentYear = year;
		
		// Hide placeholder text
		if (vis.placeholderText) {
			vis.placeholderText.remove();
			vis.placeholderText = null;
		}
		
		// Get data for this country for the selected year
		const yearData = vis.internalData[year];
		console.log('Year data:', yearData);
		
		// Check if data exists for this country
		if (!yearData || !yearData[countryName]) {
			console.log(`No data available for ${countryName} in ${year}`);
			// Show "No data" message
			vis.g.selectAll(".viz-content").remove();
			vis.g.append("text")
				.attr("class", "viz-content")
				.attr("x", vis.width / 2)
				.attr("y", vis.height / 2)
				.attr("text-anchor", "middle")
				.style("font-size", "14px")
				.style("fill", "#666")
				.text(`No data available for ${countryName}`);
			return;
		}
		
		const countryData = yearData[countryName];
		console.log(`Data for ${countryName}:`, countryData);
		
		// Clear previous visualization
		vis.g.selectAll(".viz-content").remove();
		
		// Create a simple bar chart showing jewelry vs bar_and_coin
		const data = [
			{ category: "Jewelry", value: countryData.jewelry || 0 },
			{ category: "Bar & Coin", value: countryData.bar_and_coin || 0 }
		];
		
		// Scales
		const xScale = d3.scaleBand()
			.domain(data.map(d => d.category))
			.range([0, vis.width])
			.padding(0.3);
		
		const yScale = d3.scaleLinear()
			.domain([0, d3.max(data, d => d.value)])
			.range([vis.height, 0])
			.nice();
		
		// Draw bars
		vis.g.selectAll(".bar")
			.data(data)
			.enter()
			.append("rect")
			.attr("class", "bar viz-content")
			.attr("x", d => xScale(d.category))
			.attr("y", d => yScale(d.value))
			.attr("width", xScale.bandwidth())
			.attr("height", d => vis.height - yScale(d.value))
			.attr("fill", "#ff8000");
		
		// Add value labels on bars
		vis.g.selectAll(".label")
			.data(data)
			.enter()
			.append("text")
			.attr("class", "label viz-content")
			.attr("x", d => xScale(d.category) + xScale.bandwidth() / 2)
			.attr("y", d => yScale(d.value) - 5)
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.style("font-weight", "bold")
			.text(d => d.value.toFixed(1));
		
		// Add axes
		const xAxis = d3.axisBottom(xScale);
		const yAxis = d3.axisLeft(yScale);
		
		vis.g.append("g")
			.attr("class", "x-axis viz-content")
			.attr("transform", `translate(0, ${vis.height})`)
			.call(xAxis);
		
		vis.g.append("g")
			.attr("class", "y-axis viz-content")
			.call(yAxis);
		
		// Add y-axis label
		vis.g.append("text")
			.attr("class", "viz-content")
			.attr("transform", "rotate(-90)")
			.attr("x", -vis.height / 2)
			.attr("y", -45)
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.text("Tonnes");
	}
}
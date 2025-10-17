
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
constructor(parentElement, internalData, externalData) {
    this.parentElement = parentElement;
    this.internalData = internalData; // Internal data (year -> country -> {jewelry, bar_and_coin})
    this.externalData = externalData; // External data for color scale
    this.selectedCountry = null;
    this.currentYear = "2024";
    this.displayData = [];
    
    // Create the same color scale as the world map (log scale)
    let allValues = [];
    Object.keys(externalData).forEach(year => {
        allValues = allValues.concat(Object.values(externalData[year]));
    });
    const positiveValues = allValues.filter(v => v > 0);
    const minValue = d3.min(positiveValues);
    const maxValue = d3.max(positiveValues);
    
    this.colorScale = d3.scaleLog()
        .domain([minValue, maxValue])
        .range(["#ffffcc", "#e67300"])
        .clamp(true);
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

		// Create tooltip
		vis.tooltip = d3.select("body").append("div")
			.attr("class", "country-panel-tooltip")
			.style("position", "absolute")
			.style("background", "rgba(0, 0, 0, 0.8)")
			.style("color", "white")
			.style("padding", "10px")
			.style("border-radius", "5px")
			.style("font-size", "12px")
			.style("pointer-events", "none")
			.style("display", "none")
			.style("z-index", "10000");

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
		
		console.log('updateCountry called with:', countryName, year, 'type:', typeof year);
		console.log('Internal data:', vis.internalData);
		
		vis.selectedCountry = countryName;
		vis.currentYear = year.toString(); // Convert to string for consistency
		
		// Hide placeholder text
		if (vis.placeholderText) {
			vis.placeholderText.remove();
			vis.placeholderText = null;
		}
		
		// Get data for this country for the selected year (ensure year is string)
		const yearString = year.toString();
		const yearData = vis.internalData[yearString];
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
		
		console.log(`Data for ${countryName}:`, yearData[countryName]);
		
		// Clear previous visualization
		vis.g.selectAll(".viz-content").remove();
		
		// Create data for all years showing TOTAL consumption (jewelry + bar_and_coin)
		const data = [];
		const years = Object.keys(vis.internalData).sort();
		
		years.forEach(y => {
			if (vis.internalData[y] && vis.internalData[y][countryName]) {
				const countryYearData = vis.internalData[y][countryName];
				const jewelry = countryYearData.jewelry || 0;
				const barAndCoin = countryYearData.bar_and_coin || 0;
				const total = jewelry + barAndCoin;
				
				// Get external data value for color scale
				const externalValue = vis.externalData[y] && vis.externalData[y][countryName] 
					? vis.externalData[y][countryName] 
					: null;
				
				data.push({
					year: y,
					total: total,
					jewelry: jewelry,
					barAndCoin: barAndCoin,
					externalValue: externalValue,
					isSelected: y === yearString  // Compare strings
				});
			}
		});
		
		console.log('All years data:', data);
		
		// Scales
		const xScale = d3.scaleBand()
			.domain(data.map(d => d.year))
			.range([0, vis.width])
			.padding(0.8); // Increased padding to make bars thinner
		
		const yScale = d3.scaleLinear()
			.domain([0, d3.max(data, d => d.total)])
			.range([vis.height, 40]) // Leave more space at top for legend
			.nice();
		
		// Draw bars with heatmap color scale
		vis.g.selectAll(".bar")
			.data(data)
			.enter()
			.append("rect")
			.attr("class", "bar viz-content")
			.attr("x", d => xScale(d.year))
			.attr("y", d => yScale(d.total))
			.attr("width", xScale.bandwidth())
			.attr("height", d => vis.height - yScale(d.total))
			.attr("fill", d => {
				// Use color scale based on external data value
				if (d.externalValue && d.externalValue > 0) {
					return vis.colorScale(d.externalValue);
				}
				return "#cccccc";
			})
			.attr("stroke", d => d.isSelected ? "#000" : "none") // Black outline for selected year
			.attr("stroke-width", d => d.isSelected ? 2 : 0)
			.on("mouseover", function(event, d) {
				vis.tooltip
					.style("display", "block")
					.html(`
						<strong>Year: ${d.year}</strong><br/>
						Total: ${d.total.toFixed(1)} tonnes<br/>
						Jewelry: ${d.jewelry.toFixed(1)} tonnes<br/>
						Bar & Coin: ${d.barAndCoin.toFixed(1)} tonnes
					`);
			})
			.on("mousemove", function(event) {
				vis.tooltip
					.style("left", (event.pageX + 15) + "px")
					.style("top", (event.pageY - 28) + "px");
			})
			.on("mouseout", function() {
				vis.tooltip.style("display", "none");
			});
		
		// Create pie chart generator with larger fixed size
		const pieRadius = 15; // Fixed larger size for pies
		const pie = d3.pie()
			.value(d => d.value)
			.sort(null);
		
		const arc = d3.arc()
			.innerRadius(0)
			.outerRadius(pieRadius);
		
		// Draw pie charts on top of each bar
		const pieGroups = vis.g.selectAll(".pie-group")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "pie-group viz-content")
			.attr("transform", d => {
				const x = xScale(d.year) + xScale.bandwidth() / 2;
				const y = yScale(d.total);
				return `translate(${x}, ${y})`;
			});
		
		// Add pie slices with tooltips
		pieGroups.each(function(yearData) {
			const pieData = pie([
				{ category: "Jewelry", value: yearData.jewelry, color: "#87CEEB" },
				{ category: "Bar & Coin", value: yearData.barAndCoin, color: "#9370DB" }
			]);
			
			d3.select(this)
				.selectAll("path")
				.data(pieData)
				.enter()
				.append("path")
				.attr("d", arc)
				.attr("fill", d => d.data.color)
				.attr("stroke", "white")
				.attr("stroke-width", 1)
				.on("mouseover", function(event, d) {
					vis.tooltip
						.style("display", "block")
						.html(`
							<strong>Year: ${yearData.year}</strong><br/>
							Total: ${yearData.total.toFixed(1)} tonnes<br/>
							Jewelry: ${yearData.jewelry.toFixed(1)} tonnes<br/>
							Bar & Coin: ${yearData.barAndCoin.toFixed(1)} tonnes
						`);
				})
				.on("mousemove", function(event) {
					vis.tooltip
						.style("left", (event.pageX + 15) + "px")
						.style("top", (event.pageY - 28) + "px");
				})
				.on("mouseout", function() {
					vis.tooltip.style("display", "none");
				});
		});
		
		// Add value labels on bars (only for selected year)
		vis.g.selectAll(".label")
			.data(data.filter(d => d.isSelected))
			.enter()
			.append("text")
			.attr("class", "label viz-content")
			.attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
			.attr("y", d => yScale(d.total) - pieRadius - 10)
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.style("font-weight", "bold")
			.text(d => d.total.toFixed(1));
		
		// Add axes
		const xAxis = d3.axisBottom(xScale)
			.tickValues(xScale.domain().filter((d, i) => i % 2 === 0)); // Show every other year
			
		const yAxis = d3.axisLeft(yScale);
		
		vis.g.append("g")
			.attr("class", "x-axis viz-content")
			.attr("transform", `translate(0, ${vis.height})`)
			.call(xAxis)
			.selectAll("text")
			.style("font-size", "10px");
		
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
			.text("Total Consumption (Tonnes)");
		
		// Add legend for pie chart (top right corner)
		const legend = vis.g.append("g")
			.attr("class", "pie-legend viz-content")
			.attr("transform", `translate(${vis.width - 100}, 0)`);
		
		// Jewelry legend item
		legend.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 6)
			.attr("fill", "#87CEEB")
			.attr("stroke", "white")
			.attr("stroke-width", 1);
		
		legend.append("text")
			.attr("x", 12)
			.attr("y", 4)
			.style("font-size", "11px")
			.text("Jewelry");
		
		// Bar & Coin legend item
		legend.append("circle")
			.attr("cx", 0)
			.attr("cy", 20)
			.attr("r", 6)
			.attr("fill", "#9370DB")
			.attr("stroke", "white")
			.attr("stroke-width", 1);
		
		legend.append("text")
			.attr("x", 12)
			.attr("y", 24)
			.style("font-size", "11px")
			.text("Bar & Coin");
	}
}
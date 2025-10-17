
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
    // this.data = data;
    this.displayData = [];

    let colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];

    // grab all the keys from the key value pairs in data (filter out 'year' ) to get a list of categories
    // this.dataCategories = Object.keys(this.data[0]).filter(d=>d !== "Year")

    // prepare colors for range
    // let colorArray = this.dataCategories.map( (d,i) => {
    //     return colors[i%10]
    // })

    // // Set ordinal color scale
    // this.colorScale = d3.scaleOrdinal()
    //     .domain(this.dataCategories)
    //     .range(colorArray);
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
            // Hide panel
            d3.select("#country-panel").style("display", "none");
            
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
		d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(worldData => {
            vis.g.selectAll("path")
                .data(worldData.features)
                .enter()
                .append("path")
                .attr("d", vis.path)
                .attr("fill", "#000000")
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
                    // Show the panel
                    d3.select("#country-panel").style("display", "block");
                    
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
}
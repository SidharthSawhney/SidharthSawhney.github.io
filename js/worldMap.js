class WorldMap {

constructor(parentElement, allYearData) {
    this.parentElement = parentElement;
    this.allYearData = allYearData;
    this.currentYear = "2024";
    this.countryData = allYearData[this.currentYear];
}

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 40, bottom: 60, left: 40 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "5px")
            .style("border", "1px solid black")
            .style("display", "none");

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.g = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.initialTransform = `translate(${vis.margin.left},${vis.margin.top})`;

        d3.select("#close-panel").on("click", function() {
            d3.select("#country-panel").style("right", "-50%");
            vis.g.transition()
                .duration(750)
                .attr("transform", vis.initialTransform);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                d3.select("#country-panel").style("right", "-50%");
                vis.g.transition()
                    .duration(750)
                    .attr("transform", vis.initialTransform);
            }
        });

        vis.projection = d3.geoMercator()
            .scale(vis.width / 6.5)
            .translate([vis.width / 2, vis.height / 1.5]);

        vis.path = d3.geoPath().projection(vis.projection);
		
 		let allValues = [];
 		Object.keys(vis.allYearData).forEach(year => {
 			allValues = allValues.concat(Object.values(vis.allYearData[year]));
 		});
 		
 		const positiveValues = allValues.filter(v => v > 0);
 		vis.minValue = d3.min(positiveValues);
 		vis.maxValue = d3.max(positiveValues);
		
		vis.colorScale = d3.scaleLog()
			.domain([vis.minValue, vis.maxValue])
			.range(["#ffffcc", "#e67300"])
			.clamp(true);
		
		vis.drawLegend();
		
 		d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(worldData => {
 			vis.countryPaths = vis.g.selectAll("path")
 				.data(worldData.features)
 				.enter()
 				.append("path")
 				.attr("d", vis.path)
 				.attr("fill", d => {
 					const countryName = d.properties.name;
 					const value = vis.countryData[countryName];
 					if (value === undefined || value <= 0) {
 						return "#cccccc";
 					}
 					return vis.colorScale(value);
 				})
 				.attr("stroke", "#333333")
 				.attr("stroke-width", 0.5)
 				.style("opacity", 0.9)
				.on("mouseover", function (event, d) {
					vis.tooltip.style("display", "block").text(d.properties.name);
				})
				.on("mousemove", function (event) {
					vis.tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY + 10) + "px");
				})
				.on("mouseout", function () {
					vis.tooltip.style("display", "none");
				})
				.on("click", function(_, d) {
					const countryName = d.properties.name;
					
					d3.select("#country-panel").style("right", "0");
					d3.select("#country-name").text(countryName);
					
					if (window.countryPanel) {
						window.countryPanel.updateCountry(countryName, vis.currentYear);
					}
					
					const bounds = vis.path.bounds(d);
					const dx = bounds[1][0] - bounds[0][0];
					const dy = bounds[1][1] - bounds[0][1];
					const x = (bounds[0][0] + bounds[1][0]) / 2;
					const y = (bounds[0][1] + bounds[1][1]) / 2;
					const scale = 0.9 / Math.max(dx / (vis.width / 2), dy / vis.height);
					const translate = [vis.width / 4 - scale * x, vis.height / 2 - scale * y];

					vis.g.transition()
						.duration(750)
						.attr("transform", `translate(${translate}) scale(${scale})`);
				});
		});
    }

	drawLegend() {
		let vis = this;

		const legendSvg = d3.select("#legend");
		const legendWidth = parseInt(legendSvg.style("width"));
		const legendHeight = 30;

		const defs = legendSvg.append("defs");
		const linearGradient = defs.append("linearGradient")
			.attr("id", "legend-gradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%");

		const numStops = 20;
		const logMin = Math.log(vis.minValue);
		const logMax = Math.log(vis.maxValue);
		
		for (let i = 0; i <= numStops; i++) {
			const logValue = logMin + (i / numStops) * (logMax - logMin);
			const value = Math.exp(logValue);
			
			linearGradient.append("stop")
				.attr("offset", `${(i / numStops) * 100}%`)
				.attr("stop-color", vis.colorScale(value));
		}

		legendSvg.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", legendWidth)
			.attr("height", legendHeight)
			.style("fill", "url(#legend-gradient)")
			.style("stroke", "#333")
			.style("stroke-width", 1);

		const legendScale = d3.scaleLog()
			.domain([vis.minValue, vis.maxValue])
			.range([0, legendWidth]);

		const legendAxis = d3.axisBottom(legendScale)
			.tickValues([10, 100, 1000])
			.tickFormat(d3.format(".0f"));

		legendSvg.append("g")
			.attr("transform", `translate(0, ${legendHeight})`)
			.call(legendAxis)
			.style("font-size", "10px");
	}

	updateYear(year) {
		let vis = this;
		
		vis.currentYear = year.toString();
		vis.countryData = vis.allYearData[vis.currentYear];
		
		if (vis.countryPaths) {
			vis.countryPaths
				.transition()
				.duration(500)
				.attr("fill", d => {
					const countryName = d.properties.name;
					const value = vis.countryData[countryName];
					if (value === undefined || value <= 0) {
						return "#cccccc";
					}
					return vis.colorScale(value);
				});
		}
	}
}
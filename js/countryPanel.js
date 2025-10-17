class CountryPanel {

constructor(parentElement, internalData, externalData) {
    this.parentElement = parentElement;
    this.internalData = internalData;
    this.externalData = externalData;
    this.selectedCountry = null;
    this.currentYear = "2024";
    
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

	initVis(){
		let vis = this;

		vis.margin = {top: 40, right: 40, bottom: 60, left: 60};

		const container = document.getElementById(vis.parentElement);
		vis.width = container.getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = container.getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.style("border", "1px solid #ddd");
			
		vis.g = vis.svg.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

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

		vis.placeholderText = vis.g.append("text")
			.attr("x", vis.width / 2)
			.attr("y", vis.height / 2)
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("fill", "#999")
			.text("Select a country to view details");
	}

	updateCountry(countryName, year) {
		let vis = this;
		
		vis.selectedCountry = countryName;
		vis.currentYear = year.toString();
		
		if (vis.placeholderText) {
			vis.placeholderText.remove();
			vis.placeholderText = null;
		}
		
		const yearString = year.toString();
		const yearData = vis.internalData[yearString];
		
		if (!yearData || !yearData[countryName]) {
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
		
		vis.g.selectAll(".viz-content").remove();
		
		const data = [];
		const years = Object.keys(vis.internalData).sort();
		
		years.forEach(y => {
			if (vis.internalData[y] && vis.internalData[y][countryName]) {
				const countryYearData = vis.internalData[y][countryName];
				const jewelry = countryYearData.jewelry || 0;
				const barAndCoin = countryYearData.bar_and_coin || 0;
				const total = jewelry + barAndCoin;
				
				const externalValue = vis.externalData[y] && vis.externalData[y][countryName] 
					? vis.externalData[y][countryName] 
					: null;
				
				data.push({
					year: y,
					total: total,
					jewelry: jewelry,
					barAndCoin: barAndCoin,
					externalValue: externalValue,
					isSelected: y === yearString
				});
			}
		});
		
		const xScale = d3.scaleBand()
			.domain(data.map(d => d.year))
			.range([0, vis.width])
			.padding(0.8);
		
		const yScale = d3.scaleLinear()
			.domain([0, d3.max(data, d => d.total)])
			.range([vis.height, 40])
			.nice();
		
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
				if (d.externalValue && d.externalValue > 0) {
					return vis.colorScale(d.externalValue);
				}
				return "#cccccc";
			})
			.attr("stroke", d => d.isSelected ? "#000" : "none")
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
		
		const pieRadius = 15;
		const pie = d3.pie()
			.value(d => d.value)
			.sort(null);
		
		const arc = d3.arc()
			.innerRadius(0)
			.outerRadius(pieRadius);
		
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
		
		const xAxis = d3.axisBottom(xScale)
			.tickValues(xScale.domain().filter((d, i) => i % 2 === 0));
			
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
		
		vis.g.append("text")
			.attr("class", "viz-content")
			.attr("transform", "rotate(-90)")
			.attr("x", -vis.height / 2)
			.attr("y", -45)
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.text("Total Consumption (Tonnes)");
		
		vis.g.append("text")
			.attr("class", "viz-content")
			.attr("x", vis.width / 2)
			.attr("y", vis.height + 45)
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.text("Year");
		
		const legend = vis.g.append("g")
			.attr("class", "pie-legend viz-content")
			.attr("transform", `translate(${vis.width - 100}, 0)`);
		
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
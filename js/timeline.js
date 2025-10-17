class Timeline {

	constructor(parentElement){
		this._parentElement = parentElement;
	}

	initVis() {
		let vis = this;

		vis.margin = {top: 0, right: 40, bottom: 30, left: 40};

		vis.width = document.getElementById(vis._parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis._parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

        vis.slider = d3.sliderHorizontal()
            .min(2010)
            .max(2024)
            .step(1)
            .width(vis.width)
            .tickFormat(d3.format('d'))
            .displayValue(true)
            .default(2024)
            .on('onchange', (val) => {
                yearUpdate(val);
            });

	vis.svg = d3.select("#" + vis._parentElement).append("svg")
		.attr("width", vis.width + vis.margin.left + vis.margin.right)
		.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
		.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + 10 + ")")
        .call(vis.slider);
	
	vis.svg.selectAll("text")
		.style("font-size", "14px");
	
	// Add keyboard controls
	document.addEventListener('keydown', (event) => {
		const currentValue = vis.slider.value();
		
		if (event.key === 'ArrowLeft' && currentValue > 2010) {
			vis.slider.value(currentValue - 1);
			yearUpdate(currentValue - 1);
		} else if (event.key === 'ArrowRight' && currentValue < 2024) {
			vis.slider.value(currentValue + 1);
			yearUpdate(currentValue + 1);
		}
	});
	}
}
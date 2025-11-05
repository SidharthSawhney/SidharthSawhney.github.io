const SECONDS_PER_YEAR = 0.5;

class Timeline {

	constructor(parentElement){
		this._parentElement = parentElement;
		this.isPlaying = false;
		this.playInterval = null;
	}

	initVis() {
		let vis = this;

		vis.margin = {top: 0, right: 40, bottom: 30, left: 40};

		vis.width = document.getElementById(vis._parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis._parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

		vis.updateSlider();
		
		vis.svg = d3.select("#" + vis._parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom);
		
		vis.g = vis.svg.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + 10 + ")")
			.call(vis.slider);
	
		vis.g.selectAll("text")
			.style("font-size", "14px");
	
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

		vis.setupControlButtons();
	}

	setupControlButtons() {
		let vis = this;

		const playButton = d3.select("#play-pause-button");
		const rewindButton = d3.select("#rewind-button");
		const forwardButton = d3.select("#forward-button");
		
		playButton.on("click", function() {
			if (vis.isPlaying) {
				vis.pause();
			} else {
				vis.play();
			}
		});

		rewindButton.on("click", function() {
			vis.pause();
			vis.slider.value(2010);
			yearUpdate(2010);
		});

		forwardButton.on("click", function() {
			vis.pause();
			vis.slider.value(2024);
			yearUpdate(2024);
		});
	}

	play() {
		let vis = this;
		
		if (vis.isPlaying) return;
		
		vis.isPlaying = true;
		d3.select("#play-pause-button").classed("playing", true);
		
		vis.playInterval = setInterval(() => {
			const currentValue = vis.slider.value();
			
			if (currentValue >= 2024) {
				vis.pause();
				return;
			}
			
			const nextValue = currentValue + 1;
			vis.slider.value(nextValue);
			yearUpdate(nextValue);
		}, SECONDS_PER_YEAR * 1000);
	}

	pause() {
		let vis = this;
		
		if (!vis.isPlaying) return;
		
		vis.isPlaying = false;
		d3.select("#play-pause-button").classed("playing", false);
		
		if (vis.playInterval) {
			clearInterval(vis.playInterval);
			vis.playInterval = null;
		}
	}

	updateSlider() {
		let vis = this;
		
		const allYears = [];
		for (let year = 2010; year <= 2024; year++) {
			allYears.push(year);
		}
		
		const estimatedLabelWidth = 35;
		const minSpacing = 40;
		const maxVisibleTicks = Math.floor(vis.width / minSpacing);
		
		let tickStep;
		if (maxVisibleTicks >= allYears.length) {
			tickStep = 1;
		} else if (maxVisibleTicks >= allYears.length / 2) {
			tickStep = 2;
		} else if (maxVisibleTicks >= allYears.length / 3) {
			tickStep = 3;
		} else if (maxVisibleTicks >= allYears.length / 4) {
			tickStep = 4;
		} else {
			tickStep = 5;
		}
		
		const tickValues = allYears.filter((year, index) => index % tickStep === 0 || year === allYears[allYears.length - 1]);
		
		vis.slider = d3.sliderHorizontal()
			.min(2010)
			.max(2024)
			.step(1)
			.width(vis.width)
			.tickFormat(d3.format('d'))
			.tickValues(tickValues)
			.displayValue(true)
			.default(2024)
			.on('onchange', (val) => {
				yearUpdate(val);
			});
	}

	resize() {
		let vis = this;
		
		const currentValue = vis.slider ? vis.slider.value() : 2024;
		const wasPlaying = vis.isPlaying;
		
		if (wasPlaying) {
			vis.pause();
		}
		
		vis.width = document.getElementById(vis._parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis._parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
		
		vis.updateSlider();
		
		vis.svg
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom);
		
		vis.g.remove();
		vis.g = vis.svg.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + 10 + ")")
			.call(vis.slider);
		
		vis.slider.value(currentValue);
		
		vis.g.selectAll("text")
			.style("font-size", "14px");
		
		if (wasPlaying) {
			vis.play();
		}
	}
}
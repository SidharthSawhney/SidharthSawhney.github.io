
// Variables for the visualization instances
let worldMap, countryPanel, timeline;


// Start application by loading the data
loadData();

function loadData() {
    d3.json("data/consumer_internal_external.json").then(jsonData => {
        console.log('data loaded', jsonData);

        // Store external and internal data
        const externalData = jsonData.external;
        const internalData = jsonData.internal;

        // Instantiate visualization objects
        worldMap = new WorldMap("world-map", externalData);
        countryPanel = new CountryPanel("panel-content", internalData);
        timeline = new Timeline("timeline");

        // Initialize visualizations with default year 2024
        worldMap.initVis();
        countryPanel.initVis();
        timeline.initVis();
    });
}

// Handle year updates across all visualizations
function yearUpdate(year) {
    console.log('Year updated to:', year);
    
    // Update year label
    d3.select('#year-label').text("Year: " + year);
    
    // Update world map
    if (worldMap) {
        worldMap.updateYear(year);
    }
    
    // Update country panel if a country is selected
    if (countryPanel && countryPanel.selectedCountry) {
        countryPanel.updateCountry(countryPanel.selectedCountry, year);
    }
}


// helper function - PROVIDE WITH TEMPLATE
function prepareDataForStudents(data){

	// let parseDate = d3.timeParse("%Y");

	// let preparedData = {};

	// // Convert Pence Sterling (GBX) to USD and years to date objects
	// preparedData.layers = data.layers.map( d => {
	// 	for (let column in d) {
	// 		if (d.hasOwnProperty(column) && column !== "Year") {
	// 			d[column] = parseFloat(d[column]) * 1.481105 / 100;
	// 		} else if(d.hasOwnProperty(column) && column === "Year") {
	// 			d[column] = parseDate(d[column].toString());
	// 		}
	// 	}
	// });

	// //
	// data.years.forEach(function(d){
	// 	d.Expenditures = parseFloat(d.Expenditures) * 1.481105 / 100;
	// 	d.Year = parseDate(d.Year.toString());
	// });

	// return data
}



function brushed() {
	// // Get the extent of the current brush
	// let selection = d3.brushSelection(d3.select(".brush").node());
	
	// // Convert the extent into the corresponding domain values
	// areachart.x.domain(selection.map(timeline.x.invert))

	// areachart.wrangleData()
}

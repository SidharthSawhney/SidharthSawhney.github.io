
// Variables for the visualization instances
let worldMap, countryPanel, timeline;


// Start application by loading the data
loadData();

function loadData() {
    d3.json("data/new.json"). then(jsonData=>{
            
    //     // prepare data
    //     let data = prepareDataForStudents(jsonData)
        
    //     console.log('data loaded ')

    //     // TO-DO (Activity I): instantiate visualization objects
		areachart = new WorldMap("world-map", jsonData)
		countryPanel = new CountryPanel("panel-content", jsonData)
		timeline = new Timeline("timeline")

    //     // TO-DO (Activity I):  init visualizations
		areachart.initVis()
		countryPanel.initVis()
		timeline.initVis()
    });
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

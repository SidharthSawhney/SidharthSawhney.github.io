let worldMap, timeline, countryPanel;

loadData();

function loadData() {
    d3.json("data/consumer_internal_external.json").then(jsonData => {
        const externalData = jsonData.external;
        const internalData = jsonData.internal;

        worldMap = new WorldMap("world-map", externalData);
        countryPanel = new CountryPanel("panel-content", internalData, externalData);
        window.countryPanel = countryPanel;
        timeline = new Timeline("timeline");

        worldMap.initVis();
        countryPanel.initVis();
        timeline.initVis();
    });
}

function yearUpdate(year) {
    d3.select('#year-label').text("Year: " + year);
    
    if (worldMap) {
        worldMap.updateYear(year);
    }
    
    if (countryPanel && countryPanel.selectedCountry) {
        countryPanel.updateCountry(countryPanel.selectedCountry, year);
    }
}

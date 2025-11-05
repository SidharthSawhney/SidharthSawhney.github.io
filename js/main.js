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

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });
    });
}

function handleResize() {
    if (worldMap) {
        worldMap.resize();
    }
    if (timeline) {
        timeline.resize();
    }
    if (countryPanel) {
        countryPanel.resize();
    }
}

function yearUpdate(year) {
    d3.select('#main-title').text("World Gold Consumer Demand in " + year);
    
    if (worldMap) {
        worldMap.updateYear(year);
    }
    
    if (countryPanel && countryPanel.selectedCountry) {
        countryPanel.updateCountry(countryPanel.selectedCountry, year);
    }
}

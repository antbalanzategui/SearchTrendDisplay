import * as d3 from 'https://cdn.skypack.dev/d3@7.2.0';

let svg;

/**
 * Antonio Balanzategui, 3/18/2023
 */


/**
 * May have to refresh page to load localStorage? :/
 */

/**
 * Creates a tool tip, this function is used
 * within each render function, to
 * allow for interactive on hover effects which
 * display particular information
 *
 * @returns {*} toolTip initialization
 */
function getTooltip() {
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("color", "#B3B3B3")
        .style("opacity", 0);
    return tooltip;
}
/**
 *  Function used to intialize the local storage,
 *  same format as in video, with key as "searchData"
 */
async function establishLocalStorage() {
    fetch("./data.json")
        .then((response) => response.json())
        .then((jsonData) => {
            const searchData = {
                searchData: jsonData
            };
            localStorage.setItem("searchData", JSON.stringify(searchData));

        })
        .catch((error) => console.error(error));
}

/**
 * Function used to get averages of the json data, which
 * was stored within localStorage
 *
 * Create keys to use in order to get data from the json data
 * via key/value pairs
 *
 * Uses those each key within keys in forEach loop to associate
 * one of keys with its respective average, using Math.round and .mean
 *
 * @returns {{}} dataMean, object with key value pairs of javascript, python, java
 */
function getAverages() {
    const searchDataString = localStorage.getItem("searchData");
    const data = JSON.parse(searchDataString).searchData;
    const keys = ["javascript", "python", "java"];
    const dataMean = {};
    keys.forEach(key => {
        dataMean[key] = Math.round(d3.mean(data, d => d[key]));
    });
    return dataMean;
}

/**
 * Uses the averages from the getAverages function to
 * get averages from each respective key
 * updates webpage with averages for each
 */
function updateAverages() {
    const dataMean = getAverages();
    const resultString = `JavaScript average: ${dataMean.javascript}<br>Python average: ${dataMean.python}<br>Java average: ${dataMean.java}`;
    document.getElementById('average-info').innerHTML = resultString;
}

/**
 * Function to render
 * scatter plot of json data
 *
 * @param margin
 * Dynamically determined (more info in handleResize)
 * @param width
 * Dynamically determined (more info in handleResize)
 * @param height
 * Dynamically determined (more info in handleResize)
 */
function renderScatter(margin, width, height) {
    const searchDataString = localStorage.getItem("searchData");
    if (searchDataString) {
        const searchData = JSON.parse(searchDataString).searchData;

        //This portion is to remove the current iteration of scatter plot on screen, as the handleResize does not
        //do so, if this was not present then multiple plots would be rendered (this is present in each render method)
        d3.select("#scatter-plot svg").remove();

        //Creates "svg" for scatter-plot
        svg = d3.select("#scatter-plot")
            .append("svg")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        //scaleTime operates on date objects, which we are able to receive from localStorage searchData of d.Week
        const xScale = d3.scaleTime()
            .domain(d3.extent(searchData, d => d3.timeParse("%Y-%m-%d")(d.Week)))
            .range([0, width]);

        //yScale only goes from 0 to 110, as shown in mp4 of assignment details
        const yScale = d3.scaleLinear()
            .domain([0, 110])
            .range([height, 0]);

        /**
         * Next three constants
         * create lines at particular locations for each
         * object, python, java, javascript respectively
         * not responsible for displaying, that is within
         * "svg.append"
         */
        const pythonLine = d3.line()
            .x(d => xScale(new Date(d.Week)))
            .y(d => yScale(d.python));

        const javaLine = d3.line()
            .x(d => xScale(new Date(d.Week)))
            .y(d => yScale(d.java));

        const javascriptLine = d3.line()
            .x(d => xScale(new Date(d.Week)))
            .y(d => yScale(d.javascript));

        // Tooltip which is responsible for the on hover effects, which
        // display statistics about the particular point, or even a line
        const tooltip = getTooltip()

        /**
         * Next three "svg.append"
         * are responsible for displaying lines
         * which locations were established before
         * in previous constants
         */
        svg.append("path")
            .datum(searchData)
            .attr("class", "python-line")
            .attr("d", pythonLine)
            .attr("fill", "none")
            .attr("stroke", "#e23e57")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Python")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("position", "absolute");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("path")
            .datum(searchData)
            .attr("class", "java-line")
            .attr("d", javaLine)
            .attr("fill", "none")
            .attr("stroke", "#522546")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Java")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("position", "absolute");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("path")
            .datum(searchData)
            .attr("class", "javascript-line")
            .attr("d", javascriptLine)
            .attr("fill", "none")
            .attr("stroke", "#88304e")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("JavaScript")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("position", "absolute");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        /**
         * Next three select all, are responsible for creating circles
         * on the graph
         */
        svg.selectAll(".python")
            .data(searchData)
            .join("circle")
            .attr("class", "python")
            .attr("cx", d => xScale(new Date(d.Week)))
            .attr("cy", d => yScale(d.python))
            .attr("r", 3)
            .attr("fill", "#e23e57")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Python: " + d.python + "<br>" + "Week " + d.Week)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("position", "absolute");

            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.selectAll(".java")
            .data(searchData)
            .join("circle")
            .attr("class", "java")
            .attr("cx", d => xScale(new Date(d.Week)))
            .attr("cy", d => yScale(d.java))
            .attr("r", 3)
            .attr("fill", "#522546")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Java: " + d.java + "<br>" + "Week " + d.Week)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("position", "absolute");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.selectAll(".javascript")
            .data(searchData)
            .join("circle")
            .attr("class", "javascript")
            .attr("cx", d => xScale(new Date(d.Week)))
            .attr("cy", d => yScale(d.javascript))
            .attr("r", 3)
            .attr("fill", "#88304e")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("JavaScript: " + d.javascript + "<br>" + "Week " + d.Week)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("position", "absolute");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%Y"));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        const yAxis = d3.axisLeft(yScale)
            .tickValues([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110])
            .tickFormat(d3.format("d"));

        svg.append("g")
            .call(yAxis);

        // Title of graph
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "2vw")
            .style("fill", "#FFFFFF")
            .text("Python/Java/JavaScript ScatterPlot");

    } else {
        console.error("No search data found in localStorage.");
    }
}

/**
 * Function which is used to render the pie chart
 *
 * @param margin
 * Dynamically determined (more info in handleResize)
 * @param width
 * Dynamically determined (more info in handleResize)
 * @param height
 * Dynamically determined (more info in handleResize)
 */
function renderPie(margin, width, height) {
    const searchDataString = localStorage.getItem("searchData");
    if (searchDataString) {
        const keys = ["javascript", "python", "java"];

        //Call to method which receives averages as an object
        const meanData = getAverages();


        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        // Creates arc or rather each "ARC" for EACH part of "PIE"" for respective attributes
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(width, height) / 3);

        // Color keys which line up with the previous keys of JavaScript, Python, Java
        const color = d3.scaleOrdinal()
            .domain(keys)
            .range(["#88304e", "#e23e57", "#522546"]);

        //Establishes a tooltip
        const tooltip = getTooltip();

        // Removes pie chart on graph or rather the previous, prevents
        // generations of multiple charts
        d3.select("#pie-chart svg").remove();

        // Established svg
        svg = d3.select("#pie-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Creates slices using previous arc attributes
        // along with color keys
        const slices = svg.selectAll("path")
            .data(pie(keys.map(key => ({key, value: meanData[key]}))))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.key))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                // Displays the tooltip as uppercase python: 68 -> Python: 68
                tooltip.html(`${d.data.key.substring(0, 1).toUpperCase()}${d.data.key.substring(1)}: ${d.data.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("position", "absolute");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        //Creates legend for pie chart, once again
        const legend = svg.selectAll(".legend")
            // Uses .map to effect all items within "keys", uppercase once again
            .data(keys.map(key => key.charAt(0).toUpperCase() + key.slice(1)))
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width / 2 - 100},${i * 20 - height / 2 + 20})`)
            .style("fill", "#B3B3B3");

        legend.append("rect")
            .attr("width", width/50)
            .attr("height", height/20)
            .attr("fill", d => color(d));

        legend.append("text")
            .text(d => d)
            .style("font-size", "1vw")
            .attr("x", 36)
            .attr("y", 12);
    } else {
        console.error("No search data found in localStorage.");
    }
}
/**
 * Function which is used to render the histogram chart
 *
 * @param margin
 * Dynamically determined (more info in handleResize)
 * @param width
 * Dynamically determined (more info in handleResize)
 * @param height
 * Dynamically determined (more info in handleResize)
 */
function renderHistogram(margin, width, height) {
    const searchDataString = localStorage.getItem("searchData");
    if (searchDataString) {
        const keys = ["javascript", "python", "java"];
        const colorScale = d3.scaleOrdinal()
            .domain(keys)
            .range(["#88304e", "#e23e57", "#522546"]);

        // calculate the mean for each key
        const meanData = getAverages();

        // Removes previous chart, implementation same as others previously
        d3.select("#histogram-chart svg").remove();

        // Establishes svg
        svg = d3.select("#histogram-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Gives horizontal position of bars
        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1)
            .domain(keys);

        // Normal scale, linear upwards
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(Object.values(meanData))]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        // Gets tooltip for use
        const tooltip = getTooltip();


        svg.selectAll("rect")
            .data(keys)
            .enter()
            .append("rect")
            .attr("x", d => x(d) + (x.bandwidth() - x.bandwidth() * 0.7) / 2)
            .attr("y", d => y(meanData[d]))
            .attr("width", x.bandwidth() * 0.7)
            .attr("height", d => height - y(meanData[d]))
            .attr("fill", d => colorScale(d))
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                // Capitalizes first python: 68 -> Python: 68
                tooltip.html(`${d.substring(0, 1).toUpperCase()}${d.substring(1)}: ${meanData[d]}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("position", "absolute");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    } else {
        console.error("No search data found in localStorage.");
    }
}

/**
 * Function to re-render each graphic created by d3 library
 *
 * uses .node().getBoundingClientRect() as suggested in assignment details to
 *
 */
function handleResize() {
    const container = d3.select('#scatter-plot');
    const parentWidth = container.node().getBoundingClientRect().width;
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = parentWidth - margin.left - margin.right;
    const parentHeight = container.node().getBoundingClientRect().height;
    const height = parentHeight - margin.top - margin.bottom

    // Update the chart's dimensions and re-render it
    svg.attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Re-render all plots
    renderScatter(margin, width, height);
    renderPie(margin, width * 0.3, height);
    renderHistogram(margin, width * 0.3, height);
}
const margin = { top: 10, right: 30, bottom: 30, left: 60 };
const width = window.innerWidth - margin.left - margin.right;
const height = (window.innerHeight - margin.top - margin.bottom) * 0.4;

try {
    await establishLocalStorage();
    updateAverages();
    renderScatter(margin, width, height);
    renderPie(margin, width, height);
    renderHistogram(margin, width, height);
    handleResize();
} catch (error) {
    console.error(error);
}

// For some reason a particular graph was not rendering correctly
// upon initial start of html, however would resize correctly
// upon load, it will automatically resize...
window.addEventListener('load', handleResize);
document.defaultView.addEventListener("resize", handleResize);

handleResize();


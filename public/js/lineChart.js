/* eslint-disable no-undef */
/**
 * This page is linked to Mood Data 
 */

// Pulls data from the input tag, where values are be defined
let raw = d3.select('input#entryData').attr('value');

// Return data from stringified, back into object
raw = JSON.parse(raw);

// Create a new array to use dates for each datapoint
let newArray = [];
raw.forEach(object => {
  newArray.push({
    date: new Date(object.date),
    value: object.value
  });
});

// Set margins
let margin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 30
};

// Set height and width of the graph
let width = window.innerWidth - 100 - margin.left - margin.right;
let height = 800 - margin.top - margin.bottom;

// Create a scale for the x (date) data. This is used to adjust the scale of the data
const xScale = d3.scaleTime() // Tells d3 that this is a time scale
  .domain(d3.extent(newArray, d => { return d.date; })) //  d3.extent returns [min, max] in a single pass over the input, in this case, the dates.
  .range([0, width]); // Basically size of the graph this data will fill.

// Ditto xScale
const yScale = d3.scaleLinear() // Tells d3 to linearly scale this data (as opposed to power, log, etc.)
  .domain([0, 100]) // Max and min values of the data, in this case, it should be 0 -> 100 as determined by input
  .range([300, 0]); // Basically size of the graph this data will fill.


let svg = d3.select('div.chartContainer').append('svg') // Creates the new svg element inside the div
  .attr('width', width + margin.left + margin.right) // Setting the area of the graph
  .attr('height', height + margin.top + margin.bottom)
  .attr('font-family', 'Comfortaa')
  .append('g') // adds the 'g' element inside the svg
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

svg.append('g') // Adds x axis LABEL
  .attr('transform', 'translate(0,' + (yScale(0)) + ')') // moves xAxis to bottom of graph
  .attr('font-family', 'Comfortaa')
  .call(d3.axisBottom(xScale)); // Adds axis, axisBottom determines label position relative to the axis (NOT graph)

// d3.select('path.domain').attr('stroke', 'none');
// svg.append('g') // Adds y axis label
//   .call(d3.axisLeft(yScale));

let line = d3.line() // Initiates the line by iterating through each data point
  .x((d) => {
    return xScale(d.date);
  }).y((d) => {
    return yScale(parseInt(d.value));

  }).curve(d3.curveBasis);

svg.append('linearGradient')
  .attr('id', 'line-gradient')
  .attr('gradientUnits', 'userSpaceOnUse')
  .attr('x1', 0)
  .attr('y1', yScale(0))
  .attr('x2', 0)
  .attr('y2', yScale(d3.max(newArray, d => { d.value; })))
  .selectAll('stop')
  .data([
    { offset: '0%', color: 'blue' },
    { offset: '100%', color: 'red' }
  ])
  .enter().append('stop')
  .attr('offset', function (d) { return d.offset; })
  .attr('stop-color', function (d) { return d.color; });

svg.append('path') // Adds the d3.line() as a path, feeding newArray into line variable
  .datum(newArray)
  .attr('fill', 'none') // Graph visuals styling
  .attr('stroke', 'url(#line-gradient)')
  .attr('stroke-width', 8)
  .attr('d', line);

svg.append('path') // Adds the d3.line() as a path, feeding newArray into line variable
  .datum(newArray)
  .attr('fill', 'none') // Graph visuals styling
  .attr('stroke', 'white')
  .attr('stroke-width', 2)
  .attr('d', line);

// d3.select('img#mood-graph-scale')
//   .attr('style', `max-height: 300px; max-width: 100px`);


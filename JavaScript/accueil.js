import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fetchInfo } from './data.js';

document.addEventListener("DOMContentLoaded", async function () {
    await init();
    createAllCharts();
});

async function init() {
    const routecClient = "client/" + sessionStorage.getItem("id");
    const responseClient = await fetchInfo(routecClient, "GET", {}, null);
    const nomClient = responseClient["prenom"];
    const titre = document.getElementById("titre");
    titre.innerText = "Bonjour " + nomClient + " !";

    const btnDeco = document.getElementById("btnDeco");
    btnDeco.addEventListener('click', function () {
        window.location.href = "connexion.html";
    });
}

function createAllCharts() {
// ====================
// 📊 Enhanced Vertical Bar Chart (graph1)
// ====================
const barData = [10, 15, 30, 25, 20];
const svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", 320)
    .attr("height", 320);

const marginBar = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 320 - marginBar.left - marginBar.right;
const height = 320 - marginBar.top - marginBar.bottom;

const g = svg1.append("g")
    .attr("transform", `translate(${marginBar.left},${marginBar.top})`);

// Scales
const x = d3.scaleBand()
    .domain(barData.map((_, i) => i))
    .range([0, width])
    .padding(0.2);

const y = d3.scaleLinear()
    .domain([0, d3.max(barData)])
    .range([height, 0]);

// Axes
g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(i => `Cat ${i + 1}`))
    .selectAll("text")
    .style("font-size", "12px");

g.append("g")
    .call(d3.axisLeft(y).ticks(5))
    .selectAll("text")
    .style("font-size", "12px");

// Bars
const bars = g.selectAll(".bar")
    .data(barData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (_, i) => x(i))
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", (d, i) => d3.schemeSet2[i % d3.schemeSet2.length])
    .on("mouseover", function(event, d, i) {
        const index = barData.indexOf(d);
    
        // Smoothly hide the bar
        d3.select(this)
            .transition()
            .duration(300)
            .style("opacity", 0);
    
        // 🧹 Clean up existing lollipops for this index (if any)
        g.selectAll(`.lollipop-line-${index}`).remove();
        g.selectAll(`.lollipop-circle-${index}`).remove();
    
        // Add lollipop line with animation
        g.append("line")
            .attr("class", `lollipop-line-${index}`)
            .attr("x1", x(index) + x.bandwidth() / 2)
            .attr("x2", x(index) + x.bandwidth() / 2)
            .attr("y1", height)
            .attr("y2", height)
            .attr("stroke", "#888")
            .attr("stroke-width", 2)
            .transition()
            .duration(300)
            .attr("y1", y(d));
    
        // Add lollipop circle with animation
        g.append("circle")
            .attr("class", `lollipop-circle-${index}`)
            .attr("cx", x(index) + x.bandwidth() / 2)
            .attr("cy", height)
            .attr("r", 0)
            .attr("fill", "#ff9933")
            .attr("stroke", "black")
            .transition()
            .duration(300)
            .attr("cy", y(d))
            .attr("r", 6);
    
        // Show tooltip
        g.select(`#tooltip-${d}`)
            .transition()
            .duration(200)
            .style("opacity", 1);
    })
    
    .on("mouseout", function(event, d, i) {
        const index = barData.indexOf(d);
    
        // Smoothly bring the bar back
        d3.select(this)
            .transition()
            .duration(300)
            .style("opacity", 1);
    
        // Animate removal of lollipop circle
        g.select(`.lollipop-circle-${index}`)
            .transition()
            .duration(200)
            .attr("r", 0)
            .attr("cy", height)
            .remove();
    
        // Animate removal of lollipop line
        g.select(`.lollipop-line-${index}`)
            .transition()
            .duration(200)
            .attr("y1", height)
            .remove();
    
        // Hide tooltip
        g.select(`#tooltip-${d}`)
            .transition()
            .duration(200)
            .style("opacity", 0);
    })
     
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d))
    .attr("height", d => height - y(d));

// Tooltips (floating numbers above bars)
g.selectAll(".tooltip")
    .data(barData)
    .enter()
    .append("text")
    .attr("id", d => `tooltip-${d}`)
    .text(d => d)
    .attr("x", (_, i) => x(i) + x.bandwidth() / 2)
    .attr("y", d => y(d) - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("opacity", 0);

// ====================
// 🥧 Pie Chart (graph2)
// ====================
const pieData = [1, 2, 3, 4];
const categories = ["Crypto", "Stocks", "Dividends", "Travail"];
const total = d3.sum(pieData);
const pie = d3.pie().sort(null)(pieData);
const arc = d3.arc().innerRadius(0).outerRadius(80);
const arcHover = d3.arc().innerRadius(0).outerRadius(95); // Slightly larger on hover
const color = d3.scaleOrdinal(d3.schemeSet2);

const svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", 360)
    .attr("height", 240);

const pieGroup = svg2.append("g")
    .attr("transform", "translate(155,120)");

// Append group for each slice so we can easily manage slice + label
const slices = pieGroup.selectAll(".slice")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "slice");

// Append the slice path
slices.append("path")
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .attr("d", d3.arc().innerRadius(0).outerRadius(0)) // animate from center
    .each(function(d) { this._current = d; }) // store initial state for transitions
    .on("mouseover", function(event, d) {
        d3.select(this)
            .transition()
            .duration(300)
            .attr("d", arcHover); // expand

        d3.select(this.parentNode).select("text")
            .style("visibility", "visible");
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .transition()
            .duration(300)
            .attr("d", arc); // shrink back

        d3.select(this.parentNode).select("text")
            .style("visibility", "hidden");
    })
    .transition()
    .delay((d, i) => i * 400)
    .duration(800)
    .attrTween("d", function(d) {
        const interpolate = d3.interpolate(
            { startAngle: d.startAngle, endAngle: d.startAngle },
            { startAngle: d.startAngle, endAngle: d.endAngle }
        );
        return t => arc(interpolate(t));
    });

    // Arc used only for label positioning (outside the pie)
const labelArc = d3.arc()
.innerRadius(100)  // push labels out
.outerRadius(100);

slices.append("text")
.text(d => categories[d.index])
.attr("transform", function(d) {
    const [x, y] = labelArc.centroid(d);
    return `translate(${x}, ${y})`;
})
.style("text-anchor", function(d) {
    const midAngle = (d.startAngle + d.endAngle) / 2;
    return midAngle < Math.PI ? "start" : "end"; // dynamic alignment
})
.style("font-size", "13px")
.style("font-weight", "bold")
.style("fill", "#333")
.style("visibility", "hidden")
.style("pointer-events", "none");

    

// ====================
// 📏 Percentage Scale
// ====================
const legendHeight = 160;
const legendWidth = 20;

const gradientScale = svg2.append("g")
    .attr("transform", "translate(300,40)");

const gradient = gradientScale.append("defs")
    .append("linearGradient")
    .attr("id", "legendGradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");

let cumulative = 0;
pieData.forEach((value, i) => {
    const percent = (value / total) * 100;
    const start = cumulative;
    const end = cumulative + percent;
    cumulative += percent;

    gradient.append("stop")
        .attr("offset", `${start}%`)
        .attr("stop-color", color(i));

    gradient.append("stop")
        .attr("offset", `${end}%`)
        .attr("stop-color", color(i));
});

gradientScale.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legendGradient)");

const scale = d3.scaleLinear()
    .domain([0, 100])
    .range([legendHeight, 0]);

const axis = d3.axisRight(scale)
    .ticks(5)
    .tickFormat(d => d + "%");

gradientScale.append("g")
    .attr("transform", `translate(${legendWidth}, 0)`)
    .call(axis)
    .selectAll("text")
    .style("font-size", "11px");


// =====================
// 📈 Redesigned Line Chart (graph3)
// =====================

const lineData = [5, 10, 8, 15, 12, 18];

// Set up the SVG and margins
const svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", 400)  // Increased width
    .attr("height", 350);  // Increased height for more space

const marginLine = { top: 20, right: 20, bottom: 40, left: 50 };  // Adjusted margins
const widthLine = 400 - marginLine.left - marginLine.right;
const heightLine = 350 - marginLine.top - marginLine.bottom;

// Set up scales
const xLine = d3.scaleLinear().domain([0, lineData.length - 1]).range([0, widthLine]);
const yLine = d3.scaleLinear().domain([0, d3.max(lineData)]).range([heightLine, 0]);

// Create a group for the chart's elements
const lineGroup = svg3.append("g")
    .attr("transform", `translate(${marginLine.left},${marginLine.top})`);

// X axis with modern ticks
lineGroup.append("g")
    .attr("transform", `translate(0,${heightLine})`)
    .call(d3.axisBottom(xLine)
        .ticks(lineData.length)
        .tickSizeOuter(0)
        .tickFormat(i => `Pt ${i + 1}`))
    .call(g => g.selectAll(".tick line")
        .attr("stroke", "#ddd")
        .attr("y2", 6))
    .call(g => g.select(".domain")
        .attr("stroke", "#333")
        .attr("stroke-width", 2))
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#333")
    .style("font-weight", "bold");

// Y axis with modern ticks and labels
lineGroup.append("g")
    .call(d3.axisLeft(yLine)
        .ticks(5)
        .tickFormat(d => `${d}k`))
    .call(g => g.selectAll(".tick line")
        .attr("stroke", "#ddd")
        .attr("x2", -6))
    .call(g => g.select(".domain")
        .attr("stroke", "#333")
        .attr("stroke-width", 2))
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#555")
    .style("font-weight", "bold");

// Line with smooth transitions
const line = d3.line()
    .x((d, i) => xLine(i))
    .y(d => yLine(d))
    .curve(d3.curveMonotoneX); // Smoother curve

lineGroup.append("path")
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", "#ff9933")
    .attr("stroke-width", 3)
    .attr("d", line)
    .attr("stroke-dasharray", 1000)
    .attr("stroke-dashoffset", 1000)
    .transition()
    .duration(1500)
    .attr("stroke-dashoffset", 0);

// Circle markers for data points with smooth transitions
lineGroup.selectAll("circle")
    .data(lineData)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => xLine(i))
    .attr("cy", d => yLine(d))
    .attr("r", 0)
    .attr("fill", "#ff9933")
    .transition()
    .delay((d, i) => 1500 + i * 100)
    .duration(300)
    .attr("r", 5);

// Labels for data points with subtle fade-in animation
lineGroup.selectAll("text.label")
    .data(lineData)
    .enter()
    .append("text")
    .attr("class", "label")
    .text(d => d)
    .attr("x", (d, i) => xLine(i))
    .attr("y", d => yLine(d) - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#333")
    .style("opacity", 0)
    .transition()
    .delay((d, i) => 1500 + i * 100 + 300)
    .duration(300)
    .style("opacity", 1);

// Hover interaction with improved design (focus ball and line)
const focusBall = lineGroup.append("circle")
    .attr("r", 6)
    .attr("fill", "#1f77b4")
    .style("display", "none");

const focusLine = lineGroup.append("line")
    .attr("stroke", "#1f77b4")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4 2")
    .style("display", "none");

// Capture mouse hover over the graph area
svg3.append("rect")
    .attr("transform", `translate(${marginLine.left},${marginLine.top})`)
    .attr("width", widthLine)
    .attr("height", heightLine)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseover", () => {
        focusBall.style("display", null);
        focusLine.style("display", null);
    })
    .on("mouseout", () => {
        focusBall.style("display", "none");
        focusLine.style("display", "none");
    })
    .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event, this);
        const mouseDomainX = xLine.invert(mouseX);
        const clampedX = Math.max(0, Math.min(lineData.length - 1, mouseDomainX));

        const i0 = Math.floor(clampedX);
        const i1 = Math.ceil(clampedX);

        const y0 = lineData[i0];
        const y1 = lineData[i1];
        const t = clampedX - i0;
        const interpolatedY = y0 + (y1 - y0) * t;

        const cx = xLine(clampedX);
        const cy = yLine(interpolatedY);

        focusBall.transition().duration(50).ease(d3.easeLinear).attr("cx", cx).attr("cy", cy);
        focusLine.transition().duration(50).ease(d3.easeLinear)
            .attr("x1", cx).attr("y1", 0)
            .attr("x2", cx).attr("y2", heightLine);
    });


}



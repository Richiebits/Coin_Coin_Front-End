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
// 📊 Vertical Bar Chart (graph1)
// ====================
const barData = [10, 15, 30, 25, 20];
const svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", 320)
    .attr("height", 320);

const marginBar = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 320 - marginBar.left - marginBar.right;
const height = 320 - marginBar.top - marginBar.bottom;

const x = d3.scaleBand()
    .domain(barData.map((_, i) => i))
    .range([0, width])
    .padding(0.2);

const y = d3.scaleLinear()
    .domain([0, d3.max(barData)])
    .range([height, 0]);

const g = svg1.append("g")
    .attr("transform", `translate(${marginBar.left},${marginBar.top})`);

// Bars
g.selectAll("rect")
    .data(barData)
    .enter()
    .append("rect")
    .attr("x", (_, i) => x(i))
    .attr("y", height) // start from bottom for animation
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", (d, i) => d3.schemeCategory10[i])
    .on("mouseover", function(event, d, i) {
        const bar = d3.select(this);
        bar.transition()
            .duration(300)
            .attr("y", y(d) + (y(0) - y(d)) / 2) // shrink from center
            .attr("height", (y(0) - y(d)) / 2)
            .attr("fill", "#ff9933");

        g.select(`#lollipop-${i}`)
            .transition()
            .duration(300)
            .style("opacity", 1);
    })
    .on("mouseout", function(event, d, i) {
        const bar = d3.select(this);
        bar.transition()
            .duration(300)
            .attr("y", y(d))
            .attr("height", y(0) - y(d))
            .attr("fill", d3.schemeCategory10[i]);

        g.select(`#lollipop-${i}`)
            .transition()
            .duration(300)
            .style("opacity", 0);
    })
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d))
    .attr("height", d => y(0) - y(d));

// Lollipop circles on top
g.selectAll(".lollipop")
    .data(barData)
    .enter()
    .append("circle")
    .attr("class", "lollipop")
    .attr("id", (_, i) => `lollipop-${i}`)
    .attr("cx", (_, i) => x(i) + x.bandwidth() / 2)
    .attr("cy", d => y(d) - 8)
    .attr("r", 6)
    .attr("fill", "#ff9933")
    .style("opacity", 0);

// Labels above bars
g.selectAll("text")
    .data(barData)
    .enter()
    .append("text")
    .text(d => d)
    .attr("x", (_, i) => x(i) + x.bandwidth() / 2)
    .attr("y", d => y(d) - 14)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .style("font-size", "12px")
    .style("opacity", 0)
    .transition()
    .delay(800)
    .duration(300)
    .style("opacity", 1);

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
    .attr("width", 300)
    .attr("height", 240);

const pieGroup = svg2.append("g")
    .attr("transform", "translate(100,120)");

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

    const labelArc = d3.arc().innerRadius(50).outerRadius(90); // Place labels just outside the pie

    slices.append("text")
        .text(d => categories[d.index])
        .attr("transform", function(d) {
            const [x, y] = labelArc.centroid(d);
            return `translate(${x}, ${y})`;
        })
        .style("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-weight", "bold")
        .style("visibility", "hidden")
        .style("overflow", "visible");
    

// ====================
// 📏 Percentage Scale
// ====================
const legendHeight = 160;
const legendWidth = 20;

const gradientScale = svg2.append("g")
    .attr("transform", "translate(220,40)");

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
    // 📈 Line Chart (graph3)
    // =====================
    const lineData = [5, 10, 8, 15, 12, 18];
    const svg3 = d3.select("#graph3")
        .append("svg")
        .attr("width", 350)
        .attr("height", 320);

    const marginLine = { top: 20, right: 20, bottom: 30, left: 40 };
    const widthLine = 350 - marginLine.left - marginLine.right;
    const heightLine = 300 - marginLine.top - marginLine.bottom;

    const xLine = d3.scaleLinear().domain([0, lineData.length - 1]).range([0, widthLine]);
    const yLine = d3.scaleLinear().domain([0, d3.max(lineData)]).range([height, 0]);

    const lineGroup = svg3.append("g").attr("transform", `translate(${marginLine.left},${marginLine.top})`);

    // X axis
    lineGroup.append("g")
        .attr("transform", `translate(0,${heightLine})`)
        .call(d3.axisBottom(xLine).ticks(lineData.length).tickFormat(i => `Pt ${i + 1}`))
        .selectAll("text")
        .style("font-size", "12px");

    // Y axis
    lineGroup.append("g")
        .call(d3.axisLeft(yLine).ticks(5))
        .selectAll("text")
        .style("font-size", "12px");

    const line = d3.line()
        .x((d, i) => xLine(i))
        .y(d => yLine(d))
        .curve(d3.curveMonotoneX);

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

    // Hover interaction
    const focusBall = lineGroup.append("circle")
        .attr("r", 6)
        .attr("fill", "darkblue")
        .style("display", "none");

    const focusLine = lineGroup.append("line")
        .attr("stroke", "darkblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 2")
        .style("display", "none");

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
        .on("mousemove", function (event) {
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



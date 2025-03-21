import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

document.addEventListener("DOMContentLoaded", function() {
    init();
    window.addEventListener("resize", () => {
        initGraphique();
        });
});

function init() {
    let fileName = location.href;
    if (fileName.includes("graphiques.html")) {
        populateGraphique();
        populateGraphiqueProjet();
        initGraphique();
    }
    if (fileName.includes("projets.html")) {
        populateGraphiqueProjet();
    }
}

// Fonction pour changer le titre lorsqu'un projet est cliqué a partir de la page graphique.html
function populateGraphique() {
    let projets = document.querySelectorAll(".projet");
    let titrePlaceholder = document.querySelector("#titre");
    
    projets.forEach(projet => {
        projet.addEventListener("click", function() {
            titrePlaceholder.textContent = this.textContent;
            highlightSelectedProject();
        });
    });
}


// Fonction pour changer le titre lorsqu'un projet est cliqué
function populateGraphiqueProjet() {
    let titrePlaceholder = document.querySelector("#titre");

    let params = new URLSearchParams(window.location.search);
    
    let title = params.get("titre");

    if (title) {
        titrePlaceholder.textContent = title;
    }    
    highlightSelectedProject();
}

// Fonction pour mettre en surbrillance le projet correspondant au titre
function highlightSelectedProject() {
    let titrePlaceholder = document.querySelector("#titre").textContent;
    let projets = document.querySelectorAll(".projet");
    
    projets.forEach(projet => {
        if (projet.textContent === titrePlaceholder) {
            projet.classList.add("highlight");
        } else {
            projet.classList.remove("highlight");
        }
    });
}

function initGraphique() {
    const container = d3.select(".graphique").node();
    if (!container) {
        console.error("Element with class 'graphique' not found.");
        return;
    }
    
    d3.select(".graphique svg").remove();

    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 0, bottom: 0, left: 0 };

    const data = [
        { day: 0, value: 0 },
        { day: 1, value: 5 },
        { day: 5, value: 30 },
        { day: 10, value: 60 },
        { day: 15, value: 40 },
        { day: 20, value: 42 },
        { day: 25, value: 55 },
        { day: 30, value: 85 }
    ];

    const svg = d3.select(".graphique")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .style("overflow", "visible")
        .style("position", "absolute");

    const xScale = d3.scaleLinear().domain([0, 31]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    const line = d3.line().x(d => xScale(d.day)).y(d => yScale(d.value)).curve(d3.curveMonotoneX);
    
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", line);
    
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.day))
        .attr("cy", d => yScale(d.value))
        .attr("r", 5)
        .attr("fill", "black");

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale).ticks(6));
    svg.append("g").call(d3.axisLeft(yScale));
    /*
    const tooltip = d3.select(".graphique")
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("visibility", "hidden")
        .style("font-size", "14px");

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        
    d3.select(".graphique")    
    .on("mousemove", function (event) {
            const [mouseX, mouseY] = d3.pointer(event);
            const xValue = Math.round(xScale.invert(mouseX));
            const yValue = Math.round(yScale.invert(mouseY));

            tooltip.style("left", `${mouseX + 10}px`)
                   .style("top", `${mouseY - 25}px`)
                   .style("visibility", "visible")
                   .text(`(${xValue},${yValue})`);
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });
        */
}

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fetchInfo } from "./data.js";

document.addEventListener("DOMContentLoaded", function() {
    init();

    window.addEventListener("resize", () => {
        initGraphique();
    });
});

function init() {
    let fileName = location.href;
    if (fileName.includes("graphiques.html")) {
        chargerProjects();
        populateGraphique();
        populateGraphiqueProjet();
        initGraphique();
    }
    if (fileName.includes("projets.html")) {
        chargerProjects();
        gererProjets();
    }
}

function populateGraphique() {
    let projets = document.querySelectorAll(".projet");
    let titrePlaceholder = document.querySelector("#titre");

    projets.forEach(projet => {
        projet.addEventListener("click", function() {
            titrePlaceholder.textContent = this.textContent;

            projets.forEach(p => p.classList.remove("active"));

            this.classList.add("active");

            if (window.location.pathname.includes("graphiques.html")) {
                highlightSelectedProject();
            }
        });
    });
}

function populateGraphiqueProjet() {
    let wigglyElements = document.querySelectorAll(".wiggly");
    let projets = document.querySelectorAll(".projet");

    wigglyElements.forEach(wiggly => {
        wiggly.addEventListener("click", function() {
            let isShaking = projets[0].classList.contains("shake");

            projets.forEach(projet => {
                if (isShaking) {
                    projet.classList.remove("shake");
                } else {
                    projet.classList.add("shake");
                }
            });
        });
    });

    let titrePlaceholder = document.querySelector("#titre");
    let params = new URLSearchParams(window.location.search);
    let title = params.get("titre");

    if (title) {
        titrePlaceholder.textContent = title;
    }
    if (window.location.pathname.includes("graphiques.html")) {
        highlightSelectedProject();
    }
}

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

    const graphPath = svg.append("path")
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

    const tooltip = d3.select(".graphique")
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("visibility", "hidden")
        .style("font-size", "14px");

    const trackingCircle = svg.append("circle")
        .attr("r", 8)
        .attr("fill", "#E8B86D")
        .style("visibility", "hidden");

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent");

    d3.select(".graphique")
        .on("mousemove", function(event) {
            const [mouseX, mouseY] = d3.pointer(event, this);
            const xValue = xScale.invert(mouseX);

            const path = graphPath.node();
            const totalLength = path.getTotalLength();

            let closestPoint = null;
            let minDiff = Infinity;

            for (let i = 0; i < totalLength; i += 1) {
                const point = path.getPointAtLength(i);
                const pointXValue = xScale.invert(point.x);
                const diff = Math.abs(pointXValue - xValue);

                if (diff < minDiff) {
                    minDiff = diff;
                    closestPoint = point;
                }
            }

            if (closestPoint) {
                trackingCircle
                    .attr("cx", closestPoint.x)
                    .attr("cy", closestPoint.y)
                    .style("visibility", "visible");

                tooltip
                    .style("left", `${closestPoint.x - 22}px`)
                    .style("top", `${closestPoint.y - 35}px`)
                    .style("visibility", "visible")
                    .style("white-space", "nowrap")
                    .text(`(${Math.round(xScale.invert(mouseX))}, ${Math.round(yScale.invert(closestPoint.y))})`);
            }
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
            trackingCircle.style("visibility", "hidden");
        });
}

let deleteMode = false;

async function chargerProjects() {
    const clientId = sessionStorage.getItem("id");
    const projets = await fetchInfo(`projet/client/${clientId}`, "GET");

    const isGraphiquesPage = window.location.pathname.includes("graphiques.html");
    const listeProjets = document.getElementById(isGraphiquesPage ? "listeProjets" : "listeProjet");
    listeProjets.innerHTML = "";

    projets.forEach(projet => {
        const projetDiv = document.createElement("div");
        projetDiv.classList.add("projet");
        projetDiv.textContent = projet.nom;

        if (!isGraphiquesPage) {
            const projetImage = document.createElement("img");
            projetImage.src = getProjectImage(projet.nom);
            projetImage.alt = projet.nom;
            projetImage.classList.add("projetImage");
            projetDiv.prepend(projetImage);
        }

        if (!deleteMode) {
            const projetLink = document.createElement("a");
            projetLink.href = `graphiques.html?titre=${encodeURIComponent(projet.nom)}`;
            projetLink.appendChild(projetDiv);
            if (deleteMode) {
                console.log("QWERTHELPHELP")
                projetDiv.classList.add("shake");
            }  
            listeProjets.appendChild(projetLink);
        } else {
            if (deleteMode) {
                console.log("QWERTHELPHELP")
                projetDiv.classList.add("shake");
            }  
            listeProjets.appendChild(projetDiv);
        }
    });  
    if (isGraphiquesPage) {
        setTimeout(highlightSelectedProject, 10);
    }
}

function getProjectImage(nomProjet) {
    if (nomProjet.toLowerCase().includes("auto")) return "ressources/auto.png";
    if (nomProjet.toLowerCase().includes("motoneige")) return "ressources/motoneige.png";
    if (nomProjet.toLowerCase().includes("cle_Tag")) return "ressources/cle_Tag.png";

    if(Math.random() < 0.5){
        return "ressources/dollar.png"; 
    }else{
        return "ressources/graphique.png"; 
    }
}

function gererProjets() {
    const buttonSupprActivite = document.getElementById("suprimActivite");
    if (buttonSupprActivite) {
        buttonSupprActivite.addEventListener("click", () => {
            deleteMode = !deleteMode;
            chargerProjects();
            
            const projets = document.querySelectorAll(".projet");
            projets.forEach(projet => {
                projet.classList.toggle("shake", deleteMode);
            });

            buttonSupprActivite.classList.toggle("deleteMode", deleteMode);
        });
    }

    document.addEventListener("click", async function(event) {
        if (deleteMode) {
            const projetElement = event.target.closest(".projet");
            if (!projetElement) return;

            const projetNom = projetElement.textContent.trim();
            const clientId = sessionStorage.getItem("id");
            const projets = await fetchInfo(`projet/client/${clientId}`, "GET");
            const projet = projets.find(p => p.nom === projetNom);

            if (projet) {
                const confirmDelete = confirm(`Are you sure you want to delete "${projet.nom}"?`);
                if (confirmDelete) {
                    await supprimerProjet(projet.id, clientId);
                    deleteMode = false;
                    buttonSupprActivite.classList.toggle("deleteMode", deleteMode);
                    chargerProjects();
                }
            } else {
                alert("Error: Could not find project ID.");
            }
        }
    });
}


async function supprimerProjet(projetId, clientId) {
    const response = await fetchInfo(`projet/delete/${projetId}/${clientId}`, "DELETE");

    if (response && response.success) {
        alert("Project deleted successfully!");
        chargerProjects(); 
    } else {
        alert("Error deleting project.");
    }
}


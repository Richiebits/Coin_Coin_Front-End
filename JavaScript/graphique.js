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

async function initGraphique() {
    const container = d3.select(".graphique").node();
    if (!container) {
        console.error("Element with class 'graphique' not found.");
        return;
    }

    d3.select(".graphique svg").remove();

    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 0, bottom: 0, left: 0 };

    const params = new URLSearchParams(window.location.search);
    const projectName = params.get("titre");
    const clientId = sessionStorage.getItem("id");

    if (!clientId || !projectName) {
        console.error("Client ID ou Project Name est pas la");
        return;
    }

    try {
        const projects = await fetchInfo(`projet/client/${clientId}`, "GET");
        const projetChoisi = projects.find(p => p.nom === projectName);
        
        if (!projetChoisi) {
            console.error("pas trouver projet");
            return;
        }
        
        const projetId = projetChoisi.id;
        const budgetData = await fetchInfo(`budget/projet/${projetId}`, "GET");
        console.log(budgetData[0].date_fin);
        if (!budgetData || !budgetData[0].date_fin || !budgetData[0].date_debut) {
            console.error("Budget data is missing.");
            return;
        }

        const butEpargne = projetChoisi.but_epargne;
        const dateFin = new Date(budgetData[0].date_fin);
        const dateDebut = new Date(budgetData[0].date_debut);
        const aujourdhui = new Date(Date.now());
        const jourRestant = Math.max(0, Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)));
        const jourAjourdhui = Math.max(0, Math.ceil((aujourdhui - dateDebut) / (1000 * 60 * 60 * 24)));

        //AFFICHER INFO DU PROJET ICI
        const section = document.getElementById("description");
        section.innerHTML = "<div>Date actuelle : " + aujourdhui.getDate() + "/" + aujourdhui.getMonth() + "/" + aujourdhui.getFullYear() + "</div>" +
                            "<div>Montant cible : " + butEpargne +"$</div>" + 
                            "<div>Date cible : " + dateFin.getDate() + "/" + dateFin.getMonth() + "/" + dateFin.getFullYear() + "</div>" + 
                            "<div>Allo</div>"

        const depenses = await fetchInfo(`depense/budget/${budgetData[0].id}`, "GET");
        const revenus = await fetchInfo(`revenu/budget/${budgetData[0].id}`, "GET");

        let transactions = [];

        if (revenus) {
            revenus.forEach(revenu => {
                if (revenu.depot_recurrence) {
                    console.log(`Revenu récurrent: ${revenu.montant}, fréquence: ${revenu.depot_recurrence}`);
            
                    for (let jour = revenu.depot_recurrence; jour <= jourAjourdhui; jour += revenu.depot_recurrence) {
                        transactions.push({
                            day: jour,
                            value: revenu.montant
                        });
                    }
                }
            });
        }

        if (depenses) {
            depenses.forEach(depense => {
                if (depense.retrait_recurrence) {
                    console.log(`Dépense récurrente: ${depense.montant}, fréquence: ${depense.retrait_recurrence}`);
            
                    for (let jour = depense.retrait_recurrence; jour <= jourAjourdhui; jour += depense.retrait_recurrence) {
                        transactions.push({
                            day: jour,
                            value: -depense.montant
                        });
                    }
                }
            });
        }

        let mergedTransactions = transactions.reduce((acc, transaction) => {
            if (!acc[transaction.day]) {
                acc[transaction.day] = { day: transaction.day, value: 0 };
            }
            acc[transaction.day].value += transaction.value;
            return acc;
        }, {});

        transactions = Object.values(mergedTransactions).sort((a, b) => a.day - b.day);

        let cumulativeValue = 0;
        transactions = transactions.map(transaction => {
            cumulativeValue += transaction.value;
            return {
                day: transaction.day,
                value: cumulativeValue
            };
        });

        console.log(transactions);
        console.log(`Jour actuel: ${jourAjourdhui}`);

        cumulativeValue = 0;
        let maxYValue = butEpargne;

        transactions = transactions.sort((a, b) => a.day - b.day).map(transaction => {
            cumulativeValue += transaction.value;
            if (cumulativeValue > maxYValue) maxYValue = cumulativeValue;
            return { day: transaction.day, value: cumulativeValue };
        });
        
        const data = [
            { day: 0, value: 0 },
            ...transactions.filter(t => !isNaN(t.day) && !isNaN(t.value)), 
        ];
        
        const svg = d3.select(".graphique")
            .append("svg")
            .attr("width", "100%")
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .style("position", "absolute");

        const xScale = d3.scaleLinear().domain([0, jourRestant]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, maxYValue]).range([height, 0]);

        const xAxis = d3.axisBottom(xScale).ticks(6);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        svg.append("text")
        .attr("x", width)  
        .attr("y", height + 35)  
        .attr("text-anchor", "end") 
        .style("font-size", "14px")
        .text("Days");

        svg.append("text")
        .attr("x", -45)
        .attr("y", 5)  
        .attr("text-anchor", "end") 
        .style("font-size", "14px")
        .text("$");


        const line = d3.line()
            .x(d => xScale(d.day))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("d", line);

        const graphPath = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.append("line")
            .attr("x1", 0)
            .attr("y1", yScale(butEpargne))
            .attr("x2", width)
            .attr("y2", yScale(butEpargne))
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

            svg.append("text")
            .attr("x", width - 10)
            .attr("y", yScale(butEpargne) - 5)
            .attr("text-anchor", "end")
            .attr("fill", "red")
            .style("font-weight", "bold")
            .style("font-size", "15px")
            .text("But D'épargne");
            

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
            const maxX = xScale(data[data.length - 1].day);
            const clampedMouseX = Math.min(mouseX, maxX); 
            const xValue = xScale.invert(clampedMouseX);
    
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
                    .text(`(${Math.round(xScale.invert(clampedMouseX))}, ${Math.round(yScale.invert(closestPoint.y))})`);
            }
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
            trackingCircle.style("visibility", "hidden");
        });
    
    } catch (error) {
        console.error("Erreur fetching data:", error);
    }
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


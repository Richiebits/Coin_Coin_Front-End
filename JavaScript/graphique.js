document.addEventListener("DOMContentLoaded", function() {
    init();
    window.addEventListener("resize", () => {
        connectPoints();
        drawGraphGrid();
    });
});

function init() {
    let fileName = location.href;
    if (fileName.includes("graphiques.html")) {
        populateGraphique();
        populateGraphiqueProjet();

        connectPoints();
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

function connectPoints() {
    const points = document.querySelectorAll(".graphique .point");
    const lines = document.querySelectorAll(".graphique .line");

    if (points.length < 2 || lines.length < points.length - 1) {
        console.error("Not enough points or lines to create the graph.");
        return;
    }

    for (let i = 0; i < points.length - 1; i++) {
        const point1 = points[i].getBoundingClientRect();
        const point2 = points[i + 1].getBoundingClientRect();
        const line = lines[i];

        const parentRect = document.querySelector(".graphique").getBoundingClientRect();

        const x1 = point1.left + point1.width / 2 - parentRect.left;
        const y1 = point1.top + point1.height / 2 - parentRect.top ;
        const x2 = point2.left + point2.width / 2 - parentRect.left;
        const y2 = point2.top + point2.height / 2 - parentRect.top;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        line.style.width = `${length}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
    }
}




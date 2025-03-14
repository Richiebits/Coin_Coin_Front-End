document.addEventListener("DOMContentLoaded", function() {
    init();
});

function init() {
    let fileName = location.href;
    if (fileName.includes("graphiques.html")) {
        populateGraphique();
        populateGraphiqueProjet();
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
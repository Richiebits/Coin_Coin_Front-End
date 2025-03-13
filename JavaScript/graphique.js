document.addEventListener("DOMContentLoaded", function() {
    init();
});

function init() {
    let fileName = location.href;
    if (fileName.includes("graphiques.html")) {
        populateGraphique();
    }
    if (fileName.includes("projets.html")) {
        populateGraphiqueProjet();
    }
}

// Fonction pour changer le titre lorsqu'un projet est cliqué a partir de la page graphique.html
function populateGraphique() {
    let projets = document.querySelectorAll(".projet");
    let titrePlaceholder = document.querySelector("#contenuProjet .placeholder:first-child");
    
    projets.forEach(projet => {
        projet.addEventListener("click", function() {
            titrePlaceholder.textContent = this.textContent;
        });
    });
}

// Fonction pour changer le titre lorsqu'un projet est cliqué a partir de la page graphique.html
function populateGraphiqueProjet(){

}
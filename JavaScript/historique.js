import { fetchInfo } from './data.js';
document.addEventListener("DOMContentLoaded", function(){
    init();
})

async function init() {
    const idCompte = sessionStorage.getItem("id");
    
    try {
        const historiqueReponse = await fetchInfo("historique/" + idCompte, "GET", {}, null);
        afficherHistorique(historiqueReponse, idCompte);
    } catch (error){
        console.error("Erreur lors de la récupération de l'historique:", error);
    }
}

async function afficherHistorique(listeHistorique, idCompte){
    const main = document.querySelector("main");

    const container = document.createElement("section");
    container.id = "historique-container";

    const titre = document.createElement("h2");
    titre.textContent = "Historique";
    container.appendChild(titre);

    const filterContainer = document.createElement("div");
    filterContainer.id = "filters";

    const typeFilter = document.createElement("select");
    typeFilter.id = "filtre-type";
    const typeOptions = ["tous", "depot", "retrait"];
    typeOptions.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        typeFilter.appendChild(opt);
    });

    const projetFilter = document.createElement("select");
    projetFilter.id = "filtre-projet";

    const projetsResponse = await fetchInfo("projet/client/" + idCompte, "GET", {}, null);
    const nomProjets = [...new Set(projetsResponse.map(p => p.nom))];

    const allProjOption = document.createElement("option");
    allProjOption.value = "tous";
    allProjOption.textContent = "Tous les projets";
    projetFilter.appendChild(allProjOption);

    nomProjets.forEach(nom => {
        const opt = document.createElement("option");
        opt.value = nom;
        opt.textContent = nom;
        projetFilter.appendChild(opt);
    });

    filterContainer.appendChild(typeFilter);
    filterContainer.appendChild(projetFilter);
    container.appendChild(filterContainer);

    const actionsWrapper = document.createElement("div");
    actionsWrapper.id = "actions-wrapper";
    container.appendChild(actionsWrapper);

    function renderHistorique(filtreType, filtreProjet) {
        actionsWrapper.innerHTML = "";

        let filteredList = listeHistorique.filter(el => {
            const matchType = (filtreType === "tous" || el.type === filtreType);
            const matchedProjet = projetsResponse.find(p => p.id == el.projet_id);
            const matchProjet = (filtreProjet === "tous" || (matchedProjet && matchedProjet.nom === filtreProjet));
            return matchType && matchProjet;
        });

        filteredList.forEach(element => {
            const actionDiv = document.createElement("div");
            actionDiv.classList.add("action");

            const type = document.createElement("span");
            type.classList.add("type");
            type.textContent = element.type;

            const date = document.createElement("span");
            date.classList.add("date");
            date.textContent = element.date_histo;

            const amount = document.createElement("span");
            amount.classList.add("amount");
            if (element.type == "depot"){
                amount.textContent = "+" + element.montant + "$";
                amount.classList.add("positive");
            } else if (element.type == "retrait"){
                amount.textContent = "-" + element.montant + "$";
                amount.classList.add("negative");
            } else if (element.type == "création projet"){
                amount.textContent = element.montant + "$";
                amount.classList.add("budget");
            }

            const project = document.createElement("span");
            project.classList.add("project");

            const matched = projetsResponse.find(p => p.id == element.projet_id);
            project.textContent = matched ? matched.nom : "Projet inconnu";

            actionDiv.appendChild(type);
            actionDiv.appendChild(date);
            actionDiv.appendChild(amount);
            actionDiv.appendChild(project);

            actionsWrapper.prepend(actionDiv);
        });
    }
    renderHistorique("tous", "tous");

    typeFilter.addEventListener("change", () => {
        renderHistorique(typeFilter.value, projetFilter.value);
    });

    projetFilter.addEventListener("change", () => {
        renderHistorique(typeFilter.value, projetFilter.value);
    });

    main.appendChild(container);
}
import { fetchInfo } from './data.js';
document.addEventListener("DOMContentLoaded", function(){
    init();
})

async function init() {
    const idCompte = sessionStorage.getItem("id");
    
    try {
        const historiqueReponse = await fetchInfo("historique/" + idCompte, "GET", {}, null);
        afficherHistorique(historiqueReponse);
    } catch (error){
        console.error("Erreur lors de la récupération de l'historique:", error);
    }
}

function afficherHistorique(listeHistorique){
    const main = document.querySelector("main");

    const container = document.createElement("section");
    container.id = "historique-container";

    const titre = document.createElement("h2");
    titre.textContent = "Historique";
    container.appendChild(titre);

    listeHistorique.forEach(element => {
        const actionDiv = document.createElement("div");
        actionDiv.classList.add("action");

        const type = document.createElement("span");
        type.classList.add("type");
        type.textContent = element.type

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
        project.textContent = element.projet_id;

        actionDiv.appendChild(type);
        actionDiv.appendChild(date);
        actionDiv.appendChild(amount);
        actionDiv.appendChild(project);

        container.appendChild(actionDiv);
    });

    main.appendChild(container);
}
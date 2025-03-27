import { fetchInfo } from './data.js';
addEventListener("DOMContentLoaded", function() {
    init();
})

async function init() {
    document.getElementById('choixTemps').addEventListener('change', function () {switchChoix()});
    document.getElementById('choixBudget').addEventListener('change', function() {switchChoix()});
    document.getElementById('btnCreer').addEventListener('click', function() {
        if (document.getElementById('choixTemps').checked)
            creerProjetDate();
        else if (document.getElementById('choixBudget').checked)
            creerProjetBudget();
        else {
            //Afficher erreur
            console.log("Rien de coché")
        }
    });
}

function switchChoix() {
    const choixTemps = document.getElementById('choixTemps');
    const choixBudget = document.getElementById('choixBudget');
    const formProjetDroite = document.getElementById('formProjetDroite');
    const TBDateCible = document.getElementById('TBDateCible');
    const txtDateCible = document.getElementById('txtDateCible');
    if (choixTemps.checked) {
        // Désactive "formProjetDroite" et active "TBDateCible"
        formProjetDroite.style.opacity = '0.5';
        formProjetDroite.style.pointerEvents = 'none';

        TBDateCible.disabled = false;
        TBDateCible.style.opacity = '1';
        txtDateCible.style.opacity = '1';

      } else if (choixBudget.checked) {
        // Active "formProjetDroite" et désactive "TBDateCible"
        formProjetDroite.style.opacity = '1';
        formProjetDroite.style.pointerEvents = 'auto';

        TBDateCible.disabled = true;
        TBDateCible.style.opacity = '0.5';
        txtDateCible.style.opacity = '0.5';
      }
}

async function creerProjetDate() {
    const TBNom = document.getElementById('TBNom').value ;
    const TBMontantCible = document.getElementById('TBMontantCible').value;
    const TBDateCible = document.getElementById('TBDateCible').value;
    const idClient = sessionStorage.getItem("id");
    const dataProjet = { nom:TBNom, but_epargne:TBMontantCible, client_id:idClient };
    const dataBudget = { client_id:idClient, depense_total:null, revenus_total:null, date_fin:TBDateCible};
    
    //Vérifie nom du projet
    const projets = await fetchInfo("projet/client/" + idClient,
                                "GET",
                              {'Content-Type': 'application/json'});
    
    const champNom = document.getElementById("TBNom");
    for(let i = 0; i < projets.length; i++) {
        if (projets[i]['nom'] === TBNom) {
            console.log("Nom déjà utilisé");
            champNom.classList.add("incomplet");
            return;
        }
    }
    champNom.classList.remove("incomplet");
    if (!TBNom || !TBMontantCible || !TBDateCible) {
        //Doit afficher message d'erreur dans page web : manque info
        console.log("MANQUE INFO");
        return;
    }
    try {
        fetchInfo("projet",
            "POST",
            {'Content-Type': 'application/json'},
            dataProjet);
    
        //Fait l'ajout du budget
        fetchInfo("budget",
            "POST",
            {'Content-Type': 'application/json'},
            dataBudget);
    } catch (error) {
        console.error("Création de projet et budget échoué : " + error);
    }
    //retourne vers page projet ou vers son graphique
    window.location.href = "graphiques.html?titre="+ encodeURIComponent(TBNom);
}
function creerProjetBudget() {
    const TBNom = document.getElementById('TBNom').value ;
    const TBMontantCible = document.getElementById('TBMontantCible').value;
    console.log("Budget coché");

    //Doit vérifier qu'il y a au moins un revenu d'entré
    if (!TBNom || !TBMontantCible) {
        //Doit afficher message d'erreur dans page web : manque info
        console.log("MANQUE INFO");
        return;
    }
    
    
}
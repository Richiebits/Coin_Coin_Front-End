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
            const sectionErreur = document.getElementById("errorSection");
            sectionErreur.innerHTML = "<h3>Erreur !<h3> <ul>";
            sectionErreur.innerHTML += "<li>Option invalide : Veuillez sélectionner une option de projet</li>";
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
    const dataProjet = { nomProjet:TBNom, but_epargne:TBMontantCible, client_id:idClient, retraits_total:null, depots_total:null, date_fin:TBDateCible };
    let isNomUnique = true;
    let isComplet = true;
    //Vérifie nom du projet
    const projets = await fetchInfo("projet/client/" + idClient,
                                "GET",
                              {'Content-Type': 'application/json'});
    
    const champNom = document.getElementById("TBNom");
    for(let i = 0; i < projets.length; i++) {
        if (projets[i]['nom'] === TBNom) {
            isNomUnique = false;
        }
    }
    if (!TBNom || !TBMontantCible || !TBDateCible) {
        isComplet = false;
    }
    const sectionErreur = document.getElementById("errorSection");
    if (!isComplet || !isNomUnique) {
        sectionErreur.innerHTML = "<h3>Erreur !<h3> <ul>";
        if (!isComplet) 
            sectionErreur.innerHTML += "<li>Champ vide : Ajouter des informations dans les champs nécessaires</li>";
        if (!isNomUnique) {
            sectionErreur.innerHTML += "<li>Nom du projet: Vous avez déjà un projet portant ce nom</li>";    
            champNom.classList.add("incomplet");
        }
        return;
    } else {
        sectionErreur.innerHTML = "";
        champNom.classList.remove("incomplet");
    }
    
    try {
        console.log("RENTRÉ DANS LE TRY")
        fetchInfo("projet",
            "POST",
            {'Content-Type': 'application/json'},
            dataProjet);
        console.log("FAIT LE FETCH SANS PROBLEME")
    } catch (error) {
        console.error("Création de projet et budget échoué : " + error);
    }
    //retourne vers page projet ou vers son graphique
    window.location.href = "graphiques.html?titre="+ encodeURIComponent(TBNom);
}

async function creerProjetBudget() {
    //Récupération des infos 
    const TBNom = document.getElementById('TBNom').value ;
    const TBMontantCible = document.getElementById('TBMontantCible').value;
    const TBDepot = document.getElementById('TBDepot').value ;
    const TBRetrait = document.getElementById('TBRetrait').value ; 
    const idClient = sessionStorage.getItem("id");

    //Récupération des dépot et retrait
    const TBFrequenceDepot = document.getElementById('frequenceDepot');
    let freqDepot= TBFrequenceDepot.options[TBFrequenceDepot.selectedIndex].value;
    freqDepot = getIndexFrequence(freqDepot);
    const TBFrequenceRetrait = document.getElementById('frequenceRetrait');
    let freqRetrait= TBFrequenceRetrait.options[TBFrequenceRetrait.selectedIndex].value;
    freqRetrait = getIndexFrequence(freqRetrait);

    //Préparation des données à envoyer dans les fetch
    const dataProjet = { nomProjet:TBNom, but_epargne:TBMontantCible, client_id:idClient, 
                         retraits_total:TBRetrait, depots_total:TBDepot, date_fin:null,
                         nomDepot:null, montantDepot:TBDepot, depot_recurrence:freqDepot,
                         nomRetrait:null, montantRetrait:TBRetrait, retrait_recurrence:freqRetrait};

    let isComplet = true;
    let isNomUnique = true;
    const projets = await fetchInfo("projet/client/" + idClient,
                                     "GET",
                                    {'Content-Type': 'application/json'});

    const champNom = document.getElementById("TBNom");
    for(let i = 0; i < projets.length; i++) {
        if (projets[i]['nom'] === TBNom) {
            isNomUnique = false;
        }
    }
    //Doit vérifier qu'il y a au moins un revenu d'entré
    if (!TBNom || !TBMontantCible || !TBDepot || !TBRetrait) {
        isComplet = false;
    }
    const sectionErreur = document.getElementById("errorSection");
    if (!isComplet || !isNomUnique) {
        sectionErreur.innerHTML = "<h3>Erreur !<h3> <ul>";
        if (!isComplet) 
            sectionErreur.innerHTML += "<li>Champ vide : Ajouter des informations dans les champs nécessaires</li>";
        if (!isNomUnique) {
            sectionErreur.innerHTML += "<li>Nom du projet: Vous avez déjà un projet portant ce nom</li>";    
            champNom.classList.add("incomplet");
        }
        return;
    } else {
        sectionErreur.innerHTML = "";
        champNom.classList.remove("incomplet");
    }
    
    try {
        //Fait l'ajout du projet
        fetchInfo("projet",
            "POST",
            {'Content-Type': 'application/json'},
            dataProjet);
        
        alert("Création de projet réussi ! ");
    } catch (error) {
        console.error("Création de projet et budget échoué : " + error);
    }
    //retourne vers son graphique
    window.location.href = "graphiques.html?titre="+ encodeURIComponent(TBNom);
}

function getIndexFrequence(x) {
    let freq;
    switch (x) {
        case "hebdo" :   freq = 7;
                         break;
        case "bihebdo" : freq = 14;
                         break;
        case "mensuel" : freq = 30;
                         break;
        case "annuel" :  freq = 365;
                         break;
    }
    return freq;
}
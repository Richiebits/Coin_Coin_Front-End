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

function creerProjetDate() {
    const TBNom = document.getElementById('TBNom').value ;
    const TBMontantCible = document.getElementById('TBMontantCible').value;
    const TBDateCible = document.getElementById('TBDateCible').value;
    
    console.log("Temps coché");
    
    if (!TBNom || !TBMontantCible || !TBDateCible) {
        //Doit afficher message d'erreur dans page web : manque info
        console.log("MANQUE INFO");
        return;
    }
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
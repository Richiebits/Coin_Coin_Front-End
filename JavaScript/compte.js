import { fetchInfo } from './data.js';
document.addEventListener("DOMContentLoaded", function(){
    init();
})

async function init(){
    //Prendres les variables de sessions
    const idCompte = sessionStorage.getItem("id");
    const emailCompte = sessionStorage.getItem("email");

    //Prendre les éléments HTML du document pour pouvoir intéragir avec
    const formModif = document.getElementById("modification");
    const formMDP = document.getElementById("password");

    const bModifer = document.getElementById("bModifier")
    const bConfirmer = document.getElementById("bConfirmer");
    const bAnnuler = document.getElementById("bAnnuler")

    //Prendre tout les textboxes dans un objet pour pouvoir intéragi avec plus facilement
    const textboxes = { "TBNom": document.getElementById("TBNom"),
                        "TBPrenom": document.getElementById("TBPrenom"),
                        "TBEmail": document.getElementById("TBEmail"),
                        "TBTel": document.getElementById("TBTel"),
                        "TBNewPassword" : document.getElementById("TBNewPassword"),
                        "TBConfirmPassword" : document.getElementById("TBConfirmPassword"),
                        "TBPassword": document.getElementById("TBPassword")
                    }
    
    //Requete Get du client selon le id pour pouvoir insérer les info du client dans les textboxes
    try {
        const routecClient = "client/" + idCompte;
        const responseClient = await fetchInfo(routecClient, "GET", {}, null)

        if (!responseClient || Object.keys(responseClient).length === 0){
            console.error("client vide");
        } else {

            //Mettre dans les textboxes les information courantes du client
            textboxes["TBNom"].value = responseClient["nom"];
            textboxes["TBPrenom"].value = responseClient["prenom"];
            textboxes["TBEmail"].value = responseClient["email"];
            textboxes["TBTel"].value = responseClient["tel"];
        }

    } catch (error){
        console.error("Erreur lors de du get client", error);
    }

    //Evénements du boutton Modifier
    bModifer.addEventListener("click", function(){
        const parametres = {    "nom": textboxes["TBNom"].value,
                                "prenom": textboxes["TBPrenom"].value,
                                "email": textboxes["TBEmail"].value,
                                "tel":textboxes["TBTel"].value,
                                "newMDP":textboxes["TBNewPassword"].value,
                                "ConfirmMDP":textboxes["TBConfirmPassword"].value
        }

        //Variables pour voir si tout les champs sont complets
        let isComplete = false;
        let tel = true;
        let telValid = true;
        let confirmPassword = true;
        let isSafe = true;

        //indicateur de champs incomplets
        for (const tb in textboxes){
            textboxes[tb].classList.remove("incomplet")
            isComplete = true;}

        for (const tb in textboxes){
            if (!textboxes[tb].value && tb != "TBTel" && tb != "TBPassword" && tb != "TBNewPassword" && tb != "TBConfirmPassword"){
                textboxes[tb].classList.add("incomplet")
                isComplete = false;
            }
        }
        if ((textboxes["TBNewPassword"].value || textboxes["TBNewPassword"].value) && textboxes["TBNewPassword"].value != textboxes["TBConfirmPassword"].value)
            confirmPassword = false;

        if (textboxes["TBNewPassword"].value && !textboxes["TBConfirmPassword"].value)
            textboxes["TBConfirmPassword"].classList.add("incomplet")
        else {
            textboxes["TBConfirmPassword"].classList.remove("incomplet")
        }

        //Vérification du téléphone
        if (!parametres["tel"]){
            tel = false;
            telValid = true;
        } else {
            let telValue = parseInt(parametres["tel"]);
            const regexTel = new RegExp("^[0-9\-]+$")
            if (!isNaN(telValue) && regexTel.test(parametres["tel"])) {
                telValid = true;
                textboxes["TBTel"].classList.remove("incomplet");
            } else {
                telValid = false;
                textboxes["TBTel"].classList.add("incomplet");
            }
        }

        //Vérification de mail
        const regexEmail = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        if (!regexEmail.test(parametres["email"])){
            isComplete = false;
            textboxes["TBEmail"].classList.add("incomplet");
        } else {
            textboxes["TBEmail"].classList.remove("incomplet");
        }
        
        //Vérification de mot de passe sécuritaire
        if (textboxes["TBNewPassword"].value != "" || textboxes["TBConfirmPassword"].value != "") {
            const regexMDP = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
            if (!regexMDP.test(textboxes["TBNewPassword"])){
                isSafe = false;
                textboxes["TBNewPassword"].classList.add("incomplet");
            } else {
                textboxes["TBNewPassword"].classList.remove("incomplet");
            }
        } else {
            isSafe = true;
            textboxes["TBNewPassword"].classList.remove("incomplet");
            textboxes["TBConfirmPassword"].classList.remove("incomplet");
        }
        

        //Si tout les champs nécessaire sont complets on cache le form et demande le mot de passe pour confirmer
        if (isComplete && telValid && confirmPassword && isSafe){
            formModif.classList.add("hide");
            formMDP.classList.remove("hide");
            document.getElementById("errorSection").innerHTML = "";
        } else {
            //Messages d'erreurs
            const sectionErreur = document.getElementById("errorSection");
            sectionErreur.innerHTML = "<h3>Erreur !<h3> <ul>";
            if (!isComplete)
                sectionErreur.innerHTML += "<li>Champ vide : Ajouter des informations dans les champs nécessaires</li>";
            if (!telValid)
                sectionErreur.innerHTML += "<li>Téléphone : Le numéro de téléphone est invalide</li>";
            if (!confirmPassword)
                sectionErreur.innerHTML += "<li>Mot de passe : Les deux mots de passe ne correspondent pas</li>";
            if (!isSafe)
                sectionErreur.innerHTML += "<li>Mot de passe : Le mot de passe doit avoir au moins 8 caractères, avec au moins une lettre majuscule, une lettre minuscule, un chiffre et un signe</li>";
            sectionErreur.innerHTML += "</ul>"
        }
    })
    
    //Boutton annuler au cas ou le client change d'avis
    bAnnuler.addEventListener("click", function() {
        formModif.classList.remove("hide");
        formMDP.classList.add("hide");
    })

    //Boutton de confirmation de changements
    bConfirmer.addEventListener("click", async function(){
        const MDP = textboxes["TBPassword"].value;
        const route = "client/connexion";
        const bodyConn = {  "email": emailCompte,
                        "mot_de_passe": MDP};

        //Requête POST qui vérifie si le mot de passe est correct
        try {
            //classe loading pour empêcher le client d'envoyer plusieurs requêtes en même temps
            bConfirmer.classList.add("loading");
            bAnnuler.classList.add("loading");
            const response = await fetchInfo(route, "POST", {}, bodyConn);
            console.log(emailCompte + " " + MDP + " " + response);
            if (!response || Object.keys(response).length === 0) {
                console.error("password incorrect", error);
                bConfirmer.classList.remove("loading");
                bAnnuler.classList.remove("loading");

            } else {

                const routePut = "client/" + idCompte;
                const newEmail = textboxes["TBEmail"].value;
                const newNom = textboxes["TBNom"].value;
                const newPrenom = textboxes["TBPrenom"].value;
                const newTel = textboxes["TBTel"].value;
                const newMDP = textboxes["TBNewPassword"].value != "" ? textboxes["TBNewPassword"].value : MDP;
                console.log(newMDP);
                //Si le mot de passe est correct on fait une autre requête PUT pour insérer dans la BD les nouvelles informations
                try {
                    const bodyMod = {"email": newEmail, "nom":newNom, "prenom":newPrenom, "tel":newTel, "id":idCompte, "mot_de_passe":newMDP};
                    //textboxes["TBPassword"].value = "";
                    const responsePut = await fetchInfo(routePut, "PUT", {}, bodyMod);
                    
                    if (responsePut["success"] == true){
                        sessionStorage.setItem("email", newEmail);
                        formModif.classList.remove("hide");
                        formMDP.classList.add("hide");
                        //On débloque le bouton confirmer une fois terminé
                        bConfirmer.classList.remove("loading");
                        bAnnuler.classList.remove("loading");
                        
                        alert(responsePut["message"]);
                        classList.remove("loading");
                    } else {
                        alert("erreur lors de la modification du compte")
                        formModif.classList.remove("hide");
                        formMDP.classList.add("hide");
                        bConfirmer.classList.remove("loading");
                        bAnnuler.classList.remove("loading");
                    }
                } catch (error){
                    console.error("Erreur de modification", error);
                    bConfirmer.classList.remove("loading");
                    bAnnuler.classList.remove("loading");
                }
            }
            
        } catch (error){
            console.error("Erreur de connexion", error);
            bConfirmer.classList.remove("loading");
            bAnnuler.classList.remove("loading");
        }
    
    });

}
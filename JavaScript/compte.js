import { fetchInfo } from './data.js';
document.addEventListener("DOMContentLoaded", function(){
    init();
})

async function init(){    
    //Prendres les variables de sessions
    const id = sessionStorage.getItem("id");

    try {
        const response = await fetchInfo("client/" + id, "GET", {}, null);
        if (response["is_admin"]){
            afficherComptesAdmin();
        } else {
            const idCompte = sessionStorage.getItem("id");
            const emailCompte = sessionStorage.getItem("email");
            afficherCompteClient(idCompte, false);
        }
        
    } catch (error) {
        console.error("Erreur lors de la récupération du compte:", error);
    }
}

async function afficherComptesAdmin() {
    const formModif = document.getElementById("modification");
    formModif.classList.add("hide");

    try {
        const response = await fetchInfo("client");
        const divAdmin = document.getElementById("adminDiv");
        divAdmin.classList.remove("hide");

        // refresh la page html
        divAdmin.innerHTML = "";

        response.forEach(element => {
            const divClient = document.createElement("div");
            divClient.classList.add("client-card");

            // Afficher information du comte
            const nameTitle = document.createElement("h3");
            nameTitle.textContent = `${element.prenom} ${element.nom}`;

            const email = document.createElement("p");
            email.innerHTML = `<strong>Email:</strong> ${element.email}`;

            // Bouttons
            const btnModify = document.createElement("button");
            btnModify.textContent = "Modifier";
            btnModify.classList.add("btn", "btn-modify");
            btnModify.addEventListener("click", () => {
                
                afficherCompteClient(`${element.id}`, true);
                

            });

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Supprimer";
            btnDelete.classList.add("btn", "btn-delete");
            btnDelete.addEventListener("click", async () => {

                 const MDPADMIN = window.prompt("Entrer le mot de passe pour confirmer la suppression:");
                if (MDPADMIN){
                    const routeADMIN = "client/connexion";
                    const bodyConnADMIN = {  "email": sessionStorage.getItem("email"),
                        "mot_de_passe": MDPADMIN};
                    try {
                        const responseADMIN = await fetchInfo(routeADMIN, "POST", {}, bodyConnADMIN);
                        if (!responseADMIN || Object.keys(responseADMIN).length === 0) {
                            alert("Erreur de mot de passe.");
                        } else {
                            const routeDelete = "client/" + `${element.id}`;
                            const responseDelete = await fetchInfo(routeDelete, "DELETE", null, null);
                            alert("Le compte à été supprimé avec succès");
                        }

                        
                    } catch (error) {
                        console.error("Erreur lors de la suppression du comptes:", error);
                    }
                    
                    await afficherComptesAdmin();
                }
                
                
            });

            // Append everything
            divClient.appendChild(nameTitle);
            divClient.appendChild(email);
            divClient.appendChild(btnModify);
            divClient.appendChild(btnDelete);
            divAdmin.appendChild(divClient);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des comptes:", error);
    }
}


async function afficherCompteClient(idCompte, isAdmin) {
    const divAdmin = document.getElementById("adminDiv");
    divAdmin.classList.add("hide");
    
    
    //Prendre les éléments HTML du document pour pouvoir intéragir avec
    const formModif = document.getElementById("modification");
    formModif.classList.remove("hide");
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
            if (!regexMDP.test(textboxes["TBNewPassword"].value)){
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
            textboxes["TBNewPassword"].value = "";
            textboxes["TBConfirmPassword"].value = "";
            const tvMDP = document.getElementById("tvMDP");
            if (isAdmin){
                tvMDP.innerHTML = "Mot de passe ADMIN"
            } else {
                tvMDP.innerHTML = "Mot de passe"
            }
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
        const bodyConn = {  "email": sessionStorage.getItem("email"),
                        "mot_de_passe": MDP};

        //Requête POST qui vérifie si le mot de passe est correct
        try {
            //classe loading pour empêcher le client d'envoyer plusieurs requêtes en même temps
            bConfirmer.classList.add("loading");
            bAnnuler.classList.add("loading");
            const response = await fetchInfo(route, "POST", {}, bodyConn);
            
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
                //Si le mot de passe est correct on fait une autre requête PUT pour insérer dans la BD les nouvelles informations
                try {
                    let responsePut = {};
                    if (isAdmin){
                        const bodyMod = {"email": newEmail, "nom":newNom, "prenom":newPrenom, "tel":newTel, "id":idCompte};
                        
                        responsePut = await fetchInfo("admin/" + routePut, "PUT", {}, bodyMod);
                    } else {
                        const bodyMod = {"email": newEmail, "nom":newNom, "prenom":newPrenom, "tel":newTel, "id":idCompte, "mot_de_passe":newMDP};
                    
                        responsePut = await fetchInfo(routePut, "PUT", {}, bodyMod);
                    }
                    
                    
                    if (response != null && responsePut["success"] == true){

                        if (sessionStorage.getItem("id") == idCompte){
                            sessionStorage.setItem("email", newEmail);
                        }

                        formModif.classList.remove("hide");
                        formMDP.classList.add("hide");
                        //On débloque le bouton confirmer une fois terminé
                        bConfirmer.classList.remove("loading");
                        bAnnuler.classList.remove("loading");
                        
                        alert(responsePut["message"]);
                        
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
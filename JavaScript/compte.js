import { fetchInfo } from './data.js';
document.addEventListener("DOMContentLoaded", function(){
    init();
})

function init(){
    const idCompte = sessionStorage.getItem("id");
    const emailCompte = sessionStorage.getItem("email");

    console.log(idCompte)
    console.log(emailCompte)

    const formModif = document.getElementById("modification");
    const formMDP = document.getElementById("password");

    const bModifer = document.getElementById("bModifier")
    const bConfirmer = document.getElementById("bConfirmer");
    const bAnnuler = document.getElementById("bAnnuler")

    const textboxes = { "TBNom": document.getElementById("TBNom"),
                        "TBPrenom": document.getElementById("TBPrenom"),
                        "TBEmail": document.getElementById("TBEmail"),
                        "TBTel": document.getElementById("TBTel"),
                        "TBPassword": document.getElementById("TBPassword")
                    }
    bModifer.addEventListener("click", function(){
        const parametres = {    "nom": textboxes["TBNom"].value,
                                "prenom": textboxes["TBPrenom"].value,
                                "email": textboxes["TBEmail"].value,
                                "tel":textboxes["TBTel"].value
        }
        let isComplete = false;
        let tel = true;
        let telValid = true;
        for (const tb in textboxes){
            textboxes[tb].classList.remove("incomplet")
            isComplete = true;}

        for (const tb in textboxes){
            if (!textboxes[tb].value && tb != "TBTel" && tb != "TBPassword"){
                textboxes[tb].classList.add("incomplet")
                isComplete = false;}}

        if (!parametres["tel"]){
            tel = false;
            telValid = true;
        } else {
            let telValue = parseInt(parametres["tel"]);
            
            if (!isNaN(telValue)) {
                telValid = true;
                textboxes["TBTel"].classList.remove("incomplet");
            } else {
                telValid = false;
                textboxes["TBTel"].classList.add("incomplet");
            }
        }
        const regexEmail = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        if (!regexEmail.test(parametres["email"])){
            isComplete = false;
            textboxes["TBEmail"].classList.add("incomplet");
        } else {
            textboxes["TBEmail"].classList.remove("incomplet");
        }

        console.log(isComplete);
        console.log(telValid);
        if (isComplete && telValid){
            formModif.classList.add("hide");
            formMDP.classList.remove("hide");
        }
    })
    
    bAnnuler.addEventListener("click", function() {
        formModif.classList.remove("hide");
        formMDP.classList.add("hide");
    })

    bConfirmer.addEventListener("click", async function(){
        const MDP = textboxes["TBPassword"].value;
        const route = "client/connexion";
        const bodyConn = {  "email": emailCompte,
                        "mot_de_passe": MDP};
        try {
            const response = await fetchInfo(route, "POST", {}, bodyConn);

            if (!response || Object.keys(response).length === 0) {
                console.error("password incorrect", error);

            } else {

                const routePut = "client/" + idCompte;
                const newEmail = textboxes["TBEmail"].value;
                const newNom = textboxes["TBNom"].value;
                const newPrenom = textboxes["TBPrenom"].value;
                const newTel = textboxes["TBTel"].value;

                try {
                    const bodyMod = {"email": newEmail, "nom":newNom, "prenom":newPrenom, "tel":newTel, "id":idCompte, "mot_de_passe":"Secure123!"}
                    textboxes["TBPassword"].value = "";
                    const responsePut = await fetchInfo(routePut, "PUT", {}, bodyMod);
                    
                    if (responsePut["success"] == true){
                        sessionStorage.setItem("email", newEmail);
                        formModif.classList.remove("hide");
                        formMDP.classList.add("hide");
                        
                        alert(responsePut["message"]);
                    } else {
                        alert("erreur lors de la modification du compte")
                        formModif.classList.remove("hide");
                        formMDP.classList.add("hide");
                    }
                } catch (error){
                    console.error("Erreur de modification", error);
                }
            }
            
        } catch (error){
            console.error("Erreur de connexion", error);
        }
    
    });

}
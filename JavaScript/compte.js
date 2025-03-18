import { fetchInfo } from './data.js';
document.addEventListener("DOMContentLoaded", function(){
    init();
})

function init(){
    const idCompte = 1//sessionStorage.getItem("userId");
    const emailCompte = sessionStorage.getItem("email")

    const formModif = document.getElementById("modification");
    const formMDP = document.getElementById("password");

    const bModifer = document.getElementById("bModifier")
    const bConfirmer = document.getElementById("bConfimer");
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

    bModifer.addEventListener("click", async function(){
        const MDP = textboxes["TBPassword"].value;
        const route = "client/connexion";
        const body = emailCompte + MDP;
        try {
            const response = await fetchInfo(route, "POST", {'Content-Type': 'application/json'}, body, null);
            if (response == false) {
                console.error("password incorrect", error);
            } else {
                console.log("temp");
            }

        } catch{

        }
        
        
        
    })

}
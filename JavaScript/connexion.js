import { fetchInfo } from './data.js';
addEventListener("DOMContentLoaded", function() {
    init()
})

function init(){

    const bRegister = document.getElementById("bRegister");
    bRegister.addEventListener("click", async function() {
        //Objet contenant tout les Inputs du formulaire Créer compte
        const textboxes = { "TBNom": document.getElementById("rNom"),
                            "TBPrenom": document.getElementById("rPrenom"),
                            "TBEmail": document.getElementById("rEmail"),
                            "TBTel": document.getElementById("rTel"),
                            "TBMDP1": document.getElementById("rMDP1"),
                            "TBMDP2": document.getElementById("rMDP2")
        }
        //Objet contenant tout les valeurs a l'intérieur des inputs du formulaire
        const parametres = {"nom":textboxes["TBNom"].value,"prenom":textboxes["TBPrenom"].value,
                            "email":textboxes["TBEmail"].value,"tel":textboxes["TBTel"].value,
                            "MDP1":textboxes["TBMDP1"].value,"MDP2":textboxes["TBMDP2"].value};
        //Boolean qui détermine si tout les Input du formulaire nécessaires sont remplis
        let isComplete = false;
        //variable tell car elle est différente
        let tel = true;
        let telValid = true;
        //Changement de couleur des Inputs a leurs couleurs de base
        for (const tb in textboxes){
            textboxes[tb].classList.remove("incomplet")
            isComplete = true;
        }
        //Changement de couleur des Inputs incomplet
        for (const tb in textboxes){
            if (!textboxes[tb].value && tb != "TBTel"){
                textboxes[tb].classList.add("incomplet")
                isComplete = false;
            }            
        }

        //Vérifications avant de faire la demande a l'API
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

        //Vérification courriel
        const regexEmail = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        if (!regexEmail.test(parametres["email"])){
            isComplete = false;
            textboxes["TBEmail"].classList.add("incomplet");
        } else {
            textboxes["TBEmail"].classList.remove("incomplet");
        }

        //Vérification du mail
        let isValid = true;
        try {
            const clients = await fetchInfo("client", "GET", {'Content-Type': 'application/json'});
            console.log(clients);
            clients.forEach(c => {
                if (c["email"] === parametres["email"]) {
                    //Email déjà utilisé donc erreur
                    alert("email déjà utilisé");
                    const email = document.getElementById("rEmail");
                    email.classList.add("incomplet");
                    isValid = false;
                    return;
                }
            })
        } catch (error) {
            console.error("Erreur lors de la récupération des comptes:", error);
        }
        if (!isValid)
            return;
        else {
            const email = document.getElementById("rEmail");
            email.classList.remove("incomplet");
        }
        //Vérification mot de passe (8 char / au moins 1 nbr / au moins 1 / )
        const regexMDP = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
        if (!regexMDP.test(parametres["MDP1"])){
            isComplete = false;
            textboxes["TBMDP1"].classList.add("incomplet");
            textboxes["TBMDP2"].classList.add("incomplet");
        } else {
            textboxes["TBMDP1"].classList.remove("incomplet");
            textboxes["TBMDP2"].classList.remove("incomplet");
        }


        //Vérification final pour API
        if (isComplete && telValid && parametres["MDP1"] == parametres["MDP2"]){
            const data = {
                email:parametres["email"],
                nom:parametres["nom"],
                prenom:parametres["prenom"],
                mot_de_passe:parametres["MDP2"]
            }
            if (tel){
                data.tel = parametres["tel"];
            }
            for (const tb in textboxes){
                textboxes[tb].value = "";
            }
            alert("Le compte a été créer avec succès");
            fetchInfo(  "client", 
                        "POST", 
                        {'Content-Type': 'application/json'}, 
                        data)
        }
        window.location.href = "connexion.html";
    })
    const bLogin = document.getElementById("bLogin");
    let compte = null;
    bLogin.addEventListener("click", async function(){
        //Objet contenant tout les Inputs du formulaire Login
        const Ltextboxes = {    "TBEmail": document.getElementById("lEmail"),
                                "TBMDP": document.getElementById("lMDP")}
        const inputEmail = Ltextboxes["TBEmail"].value;
        const inputMDP = Ltextboxes["TBMDP"].value;
        console.log(inputMDP);
        const routeAPI = "client/connexion";
        const body = {"email": inputEmail, "mot_de_passe": inputMDP};
        
        try {
            bLogin.classList.add("loading");
            const response =  await fetchInfo(routeAPI, "POST", {}, body);
            
            if (!response || Object.keys(response).length === 0) {
                console.error("password incorrect", error);
                Ltextboxes["TBMDP"].value=""
                bLogin.classList.remove("loading");
            } else {
                const id = response["id"];
                sessionStorage.setItem("id", id);
                sessionStorage.setItem("email", inputEmail);
                sessionStorage.setItem("token", response["token"]);
                alert("Connection réussi!");
                bLogin.classList.remove("loading");
                window.location.href = "accueil.html";
                bLogin.classList.remove("loading");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du compte:", error);}
            bLogin.classList.remove("loading");
            Ltextboxes["TBMDP"].value=""
            

    });

}

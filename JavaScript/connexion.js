import { fetchInfo } from './data.js';
addEventListener("DOMContentLoaded", function() {
    init()
})

function init(){

    const bRegister = document.getElementById("bRegister");
    bRegister.addEventListener("click", function() {
        //Objet contenant tout les Inputs du formulaire Créer comte
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
        } else {
            try {
                parametres["tel"] = parseInt(parametres["tel"])
            } catch (error) {
                
            }
        }
        

        //Vérification final pour API
        if (isComplete && parametres["MDP1"] == parametres["MDP2"]){
            const data = {
                email:parametres["email"],
                nom:parametres["nom"],
                prenom:parametres["prenom"],
                mot_de_passe:parametres["MDP2"]
            }
            if (tel){
                data.tel = parametres[tel];
            }
            fetchInfo(  "client", 
                        "POST", 
                        {'Content-Type': 'application/json'}, 
                        null, data)
        }
        
        
       
    })

}

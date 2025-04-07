import { fetchInfo } from './data.js';
document.addEventListener("DOMContentLoaded", function(){
    init();
})

async function init(){
    const routecClient = "client/" + sessionStorage.getItem("id");
    const responseClient = await fetchInfo(routecClient, "GET", {}, null)
    const nomClient = responseClient["prenom"];
    const titre = document.getElementById("titre");
    titre.innerText = "Bonjour " + nomClient + " !";

    const btnDeco = document.getElementById("btnDeco");
    btnDeco.addEventListener( 
        'click', 
        function() {
            window.location.href = "connexion.html";
        }
    );
}
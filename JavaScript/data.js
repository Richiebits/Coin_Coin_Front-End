//GUIDE :: "quelleInfo" est le nom du tableau a rechercher, ex:"/project" ou "/client"
//      :: "type" est le type de la requete, exe:"POST" ou "PUT" ou "GET" ou ...

//Si le header, le body ou le data n'est pas fourni, les mets à null (ou vide)
function fetchInfo(quelleInfo, type, headers = {}, body = null, data = null) {
    let uri = "http://localhost:8000/api/" + quelleInfo;
    const fetchOptions = {
        method: type, 
        headers: {
            'Content-Type': 'application/json', 
            ...headers
        }
    }
    //S'il y a un body, l'ajoute
    if (body !== null) {
        fetchOptions.body = JSON.stringify(body);
    } else if (data && (type === "POST" || type === "PUT")) {
        fetchOptions.body = JSON.stringify(data);
    }
    
    //Retourne le résultat du fetch
    return fetch(uri, fetchOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Le serveur a renvoyé une erreur');
            }
            return response.json();
        })
        .catch(error => {
            console.error("Erreur de chargement des données :", error);
            return null; // Retourne `null` en cas d'erreur
        });
}
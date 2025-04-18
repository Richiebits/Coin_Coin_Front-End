//GUIDE :: "quelleInfo" est le nom du tableau a rechercher, ex:"/project" ou "/client"
//      :: "type" est le type de la requete, exe:"POST" ou "PUT" ou "GET" ou ...

//Si le header, le body ou le data n'est pas fourni, les mets à null (ou vide)
//Export pour que les autres fichiers puissent avoir accès a la fonction
export async function fetchInfo(quelleInfo, type, headers = {}, body = null) {
    let uri = "http://localhost:8000/api/" + quelleInfo;
    const token = sessionStorage.getItem("token");
    const fetchOptions = {
        method: type, 
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': token,
            ...headers
        }
    }
    //S'il y a un body, l'ajoute
    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }
    
    //Retourne le résultat du fetch
    try {
        const response = await fetch(uri, fetchOptions)
        if (response.status === 401) {
            alert("Accès refusé");
        }
        if (!response.ok) {
            throw new Error('Le serveur a renvoyé une erreur');
        }
        return response.json();
    } catch (error) {
        console.error("Erreur de chargement des données :", error);
            return null; // Retourne `null` en cas d'erreur
    }
}
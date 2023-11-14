function displayCardsDynamically(collection) {
    let params = new URL( window.location.href ); //get URL of search bar
    let query = params.searchParams.get( "search" ); //get value for key "search"

    let cardTemplate = document.getElementById("itemCardTemplate");

    let where = query ? 
        db.collection(collection)
        .where('title', '>=', query)
        .where('title', '<=', query+ '\uf8ff') 
        : db.collection(collection);

    where
    .get()
    .then(items => {
        items.forEach(item => {
            console.log(item.data());
            var name = item.data().title;
            var description = item.data().description;
            var imageUrl = item.data().photo; // Assuming 'photo' is the field in your Firestore document for the image URL
            // var bin_color = item.data().bin_color;
            let id = item.id;

            let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card
    
            // Update title, text, and image in the new card
            // newcard.querySelector('.card-header').innerHTML = name;
            // newcard.querySelector('.card-text').innerHTML = description;
            // newcard.querySelector('img').src = imageUrl; // Set the image source
            // newcard.querySelector('.card-body').href = "../detailpage.html?id=" + id;
            // newcard.querySelector('.item-list-button').onclick = ()=>goToDetail(id);

            newcard.querySelector('.item-card-name').innerHTML = name;
            // newcard.querySelector('.card-text').innerHTML = description;
            newcard.querySelector('.item-card-image').src = imageUrl; // Set the image source
            // newcard.querySelector('.card-body').href = "../detailpage.html?id=" + id;
            newcard.querySelector('.item-list-button').onclick = ()=>goToDetail(id);
            newcard.querySelector('.item-card-color-band').style = "background-color: " + getBinColor(item.data().bin) + ";";
            newcard.querySelector('.item-card-likes').style = "color: " + getBinColor(item.data().bin) + ";";
            // this decides if thumbs up or down is filled
            newcard.querySelector('.thumbs-up').style = "font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;";
            newcard.querySelector('.thumbs-down').style = "font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;";
            
            document.getElementById("items-go-here").appendChild(newcard);
        });
    })
    

    if(true) { // if there are no recently searched items
        document.querySelector("#recently-searched-header").remove();
        document.querySelector("#most-frequently-searched-header").remove();
    }
    
}

displayCardsDynamically("waste");  //input param is the name of the collection

function getBinColor(bin) {
    switch (bin) {
        case "Blue bin (Recylable waste)":
            return "#0140ef";
        case "Green bin (Food waste)":
            return "green";
        case "Black bin (General waste)":
            return "black";
        case "Yellow bin (Cans)":
            return "yellow";
        default:
            return "grey";
    }
}

function goToDetail(id) {
    window.location.href = "../detailpage.html?id=" + id;
}
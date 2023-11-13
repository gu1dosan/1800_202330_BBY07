function displayCardsDynamically(collection) {
    let params = new URL( window.location.href ); //get URL of search bar
    let query = params.searchParams.get( "search" ); //get value for key "search"

    let cardTemplate = document.getElementById("itemCardTemplate");

    if(query) {
        db.collection(collection)
        .where('name', '>=', query)
        .where('name', '<=', query+ '\uf8ff')
        .get()
            .then(items=> {
                document.getElementById('searchBar').value = query;
                items.forEach(item => { //iterate thru each doc
                    console.log(item.data())
                    var name = item.data().name;   
                    var description = item.data().description;  
                    // var bin_color = item.data().bin_color;
    
                    let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.
    
                    //update title and text and image
                    newcard.querySelector('.card-header').innerHTML = name;
                    newcard.querySelector('.card-text').innerHTML = description;
                    document.getElementById("items-go-here").appendChild(newcard);
                })
            })
    } else {
        db.collection(collection)
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
                newcard.querySelector('.card-header').innerHTML = name;
                newcard.querySelector('.card-text').innerHTML = description;
                newcard.querySelector('img').src = imageUrl; // Set the image source
                newcard.querySelector('.card-body').href = "../detailpage.html?id=" + id;
        
                document.getElementById("items-go-here").appendChild(newcard);
            });
        })
    }
    
}

displayCardsDynamically("posts");  //input param is the name of the collection

function goToDetail(id) {
    window.location.href = "../detailpage.html?id=" + id;
}
function displayHikeInfo() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "id" ); //get value for key "id"
    // console.log( ID );

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection( "waste" )
        .doc( ID )
        .get()
        .then( doc => {
            item = doc.data();
            itemName = doc.data().title;
            console.log(item)
            
            // only populate title, and image
            // document.querySelector( ".card-header" ).innerHTML = itemName;
            // document.querySelector( ".carousel-img" ).src = item.photo;

            document.querySelector( ".detail-name" ).innerHTML = itemName;
            document.querySelector( ".carousel-img" ).src = item.photo;
            document.querySelector( ".detail-description" ).innerHTML = doc.data().description;
            document.querySelector('body').style = "background-color: " + getBinColor(doc.data().bin) + ";";
        } );
}
displayHikeInfo();

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
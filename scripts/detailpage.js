function displayHikeInfo() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "id" ); //get value for key "id"
    // console.log( ID );

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection( "posts" )
        .doc( ID )
        .get()
        .then( doc => {
            item = doc.data();
            itemName = doc.data().name;
            console.log(item)
            
            // only populate title, and image
            document.querySelector( ".card-header" ).innerHTML = itemName;
            document.querySelector( ".carousel-img" ).src = item.image;
        } );
}
displayHikeInfo();
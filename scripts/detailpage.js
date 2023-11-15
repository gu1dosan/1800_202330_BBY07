function displayItemInfo() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "id" ); //get value for key "id"
    // console.log( ID );

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
            document.querySelector( ".detail-image" ).src = item.photo;
            document.querySelector( ".detail-description" ).innerHTML = doc.data().description;
            document.querySelector('body').style = "background-color: " + getBinColor(doc.data().bin) + ";";
            document.getElementById("likesInput").innerText = doc.data().totalLikes;
            
        } );
}
displayItemInfo();

function getBinColor(bin) {
    switch (bin) {
        case "Blue bin (Recylable waste)":
            return "#0070b8";
        case "Green bin (Organic waste)":
            return "#02a54a";
        case "Black bin (General waste)":
            return "black";
        case "Yellow bin/bag (Mixed paper)":
            return "#ffd350";
            // return "ffc525";
        default:
            return "grey";
    }
}

function goToIndex(){
    window.location.href = "../index.html";
}
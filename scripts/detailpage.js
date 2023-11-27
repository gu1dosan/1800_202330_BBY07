function displayItemInfo() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "id" ); //get value for key "id"
    // console.log( ID );

    db.collection("waste")
        .doc( ID )
        .get()
        .then( doc => {
            let user = firebase.auth().currentUser;
            item = doc.data();
            itemName = doc.data().title;
            console.log(item)
            db.collection("users").doc(item.userID).get().then(userDoc => {
                userName = userDoc.data().userName;
            
            // only populate title, and image
            // document.querySelector( ".card-header" ).innerHTML = itemName;
            // document.querySelector( ".carousel-img" ).src = item.photo;
            document.querySelector(".goToProfileButton").onclick = () => goToProfile(doc.data().userID)
            document.querySelector( ".detail-name" ).innerHTML = itemName;
            document.getElementById( "userName" ).innerHTML = userName + "'s";
            document.querySelector(".DeleteButton").hidden = true;
            document.querySelector( ".detail-image" ).src = item.photo;
            document.querySelector( ".detail-description" ).innerHTML = doc.data().description;
            document.querySelector('body').style = "background-color: " + getBinColor(doc.data().bin) + ";";
            if (user.uid === item.userID){
                document.querySelector(".DeleteButton").onclick = () => deleteThis();
                document.querySelector(".DeleteButton").hidden = false;
                document.querySelector(".goToProfileButton").hidden = true;
                
            } 
            

            
            document.querySelector(".like-icon").style.color = getBinColor(doc.data().bin);
            document.querySelector(".dislike-icon").style.color = getBinColor(doc.data().bin);
            document.querySelector('.item-detail-bin').style.color = getBinColor(doc.data().bin);
            document.querySelector('.item-detail-bin-name').innerHTML = doc.data().bin;
            document.querySelector('.item-detail-bin-name').style.color = getBinColor(doc.data().bin);

            let likesInput = document.getElementById("likesInput");
            let likeIcon = document.querySelector('.like-icon');
            let disLikeIcon = document.querySelector('.dislike-icon');

            likeIcon.addEventListener('click', () => incrementLike(ID));
            disLikeIcon.addEventListener('click', () => incrementDisLike(ID));


            // Reference to Firestore document to listen for real-time updates
            let itemRef = db.collection("waste").doc(ID);

            // Listening for real-time updates on the specific document
            itemRef.onSnapshot((doc) => {
                if (doc.exists) {
                    // Extract the updated data from the document
                    const itemData = doc.data();
                    likesInput.innerHTML = doc.data().totalLikes;
                    // Check if the user has liked or disliked the item
                    let userHasLiked = itemData.whoLiked && itemData.whoLiked.includes(user.uid);
                    let userHasDisLiked = itemData.whoDisLiked && itemData.whoDisLiked.includes(user.uid);
                    likeIcon.style['font-variation-settings'] = userHasLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
                    disLikeIcon.style['font-variation-settings'] = userHasDisLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
                } else {
                    console.log('Document does not exist');
                }
            });
        });
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
            return "#443f39";
        case "Yellow bin/bag (Mixed paper)":
            return "#ffd350";
            // return "ffc525";
        default:
            return "grey";
    }
}

function goToIndex(){
    window.location.href = "../search.html";
}

function deleteThis() {
    let params = new URL(window.location.href);
    let ID = params.searchParams.get("id");
    var docRef = firebase.firestore().collection('waste').doc(ID);
    var user = firebase.auth().currentUser;
     
    console.log(docRef)
    let confirmation = prompt('Are you sure you want to delete this item? (type "yes")').toLowerCase();
    
    if (confirmation === "yes"){
        docRef.get().then((doc) => {
            if (user.uid === doc.data().userID) {
                docRef.delete().then(() => {
                    console.log("Document successfully deleted!");
                    window.location.href = "../deleted.html";
                });
            } 
        });
    }
}

//document.querySelector("#viewPoster").addEventListener('click', function() {     let params = new URL(window.location.href);     let ID = params.searchParams.get("docID");      window.location.assign("profile.html?docID=" + ID) })

function goToProfile(id) {
    window.location.href = "../profile.html?profile=" + id;
}
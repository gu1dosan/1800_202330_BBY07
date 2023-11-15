let postIDS = []; // Global variable to hold post IDs

// Modified displayCardsDynamically to be called within onAuthStateChanged
function displayCardsDynamically(collection) {
    firebase.auth().onAuthStateChanged(function(user) {

        if (user) {
            // User is signed in, proceed with fetching and displaying cards

            let params = new URL(window.location.href); // Get URL of the search bar
            let query = params.searchParams.get("search"); // Get the value for the key "search"

            let cardTemplate = document.getElementById("itemCardTemplate");
            let where = query ? 
                db.collection(collection)
                .where('title', '>=', query)
                .where('title', '<=', query + '\uf8ff')
                : db.collection(collection);

            where.get().then(items => {
                items.forEach(item => {
                    postIDS.push(item.id);
                    console.log(item.data());
                    let userHasLiked = item.data().whoLiked && item.data().whoLiked.includes(user.uid);
                    var name = item.data().title;
                    var imageUrl = item.data().photo; // Assuming 'photo' is the field in your Firestore document for the image URL
                    let id = item.id;

                    let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card
                    newcard.querySelector('.item-card-name').innerHTML = name;
                    newcard.querySelector('.item-card-image').src = imageUrl;
                    newcard.querySelector('.item-card-image').onclick = () => goToDetail(id);
                    newcard.querySelector('.item-card-name').onclick = () => goToDetail(id);
                    newcard.querySelector('.item-card-color-band').style = "background-color: " + getBinColor(item.data().bin) + ";";
                    newcard.querySelector('.item-card-likes').style = "color: " + getBinColor(item.data().bin) + ";";
                    newcard.querySelector('.item-card-likes').onclick = () => incrementLike(id);
                    

                    // Update the like icon based on whether the user has liked the post
                    
                    let likeIcon = newcard.querySelector('.likes');
                    console.log(newcard.querySelector('.likes'));
                    if (likeIcon) {
                        likeIcon.src = userHasLiked ? '../images/thumb_up_liked.png' : '../images/thumb_up_unliked.png';
                    }
                    document.getElementById("items-go-here").appendChild(newcard);
                });
            }).catch(error => {
                console.error("Error fetching items: ", error);
            });

            // Remove recently searched header if applicable
            if(true) { // Replace with your actual condition to check for recently searched items
                document.querySelector("#recently-searched-header")?.remove();
                document.querySelector("#most-frequently-searched-header")?.remove();
            }
        } else {
            // No user is signed in, handle accordingly
            console.log('No user signed in');
        }
    });
}

// Call displayCardsDynamically with the collection name
displayCardsDynamically("waste");




function getBinColor(bin) {
    switch (bin) {
        case "Blue bin (Recylable waste)":
            return "#0070b8";
        case "Green bin (Organic waste)":
            return "#017d47";
        case "Black bin (General waste)":
            return "black";
        case "Yellow bin/bag (Mixed paper)":
            return "#ffc525";
        default:
            return "grey";
    }
}

function goToDetail(id) {
    window.location.href = "../detailpage.html?id=" + id;
}

function incrementLike(id) {
    let docID = id;
    var user = firebase.auth().currentUser;
    console.log(user);
    if (user) {
      // Reference to the document in the 'waste' collection
      const wasteDocRef = db.collection('waste').doc(docID);
  
      // Run a transaction to ensure atomic updates
      return db.runTransaction(transaction => {
        return transaction.get(wasteDocRef).then(wasteDoc => {
          if (!wasteDoc.exists) {
            throw new Error("Document does not exist!");
          }
  
          // Get the current whoLiked string
          const whoLiked = wasteDoc.data().whoLiked || "";
  
          // Check if the user has already liked the post
          if (whoLiked.includes(user.uid)) {
            console.log('User has already liked this post.');
            return; // User has already liked, no need to increment
          }
  
          // Add user to the whoLiked string
          const newWhoLiked = whoLiked ? `${whoLiked},${user.uid}` : user.uid;
          
          // Calculate the new like count based on the number of user IDs in whoLiked
          // If whoLiked was empty, the count is 1; otherwise, it's the number of commas plus 1
          const newLikes = whoLiked ? (whoLiked.match(/,/g) || []).length + 2 : 1;
  
          // Update the document

          transaction.update(wasteDocRef, {
            totalLikes: newLikes,
            whoLiked: newWhoLiked
          });
        });
      }).then(() => {
        console.log('Like incremented successfully!');
      }).catch(error => {
        console.error('Transaction failed: ', error);
      });
    } else {
      console.log('No user is signed in to like the post');
    }
  }
  
  // Usage example
  // incrementLike('document-id');
  
  
  // Usage:
  // incrementLike('documentID');

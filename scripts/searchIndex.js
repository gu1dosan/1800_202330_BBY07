let postIDS = []; // Global variable to hold post IDs

// Modified displayCardsDynamically to be called within onAuthStateChanged
function displayCardsDynamically(collection) {
    firebase.auth().onAuthStateChanged(function(user) {

        if (user) {
            let params = new URL(window.location.href);
            let query = params.searchParams.get("search");

            let cardTemplate = document.getElementById("itemCardTemplate");
            let where = db.collection(collection);
            console.log(query);
            //just made it so that if there is no query it will order by the amount of total likes.
            if (query) {
                where = where.where('title', '>=', query)
                             .where('title', '<=', query + '\uf8ff')
                             .orderBy('totalLikes', 'desc'); //try to use index guido
            } else {
                where = where.orderBy('totalLikes', 'desc');
            }
            where.get().then(items => {
                items.forEach(item => {
                    postIDS.push(item.id);
                    console.log(item.data());
                    
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
                    
                    

                    // Update the like icon based on whether the user has liked the post
                    let userHasLiked = item.data().whoLiked && item.data().whoLiked.includes(user.uid);
                    let userHasDisLiked = item.data().whoDisLiked && item.data().whoDisLiked.includes(user.uid);
                    let likeIcon = newcard.querySelector('.likes');
                    console.log(newcard.querySelector('.likes'));
                    
                    likeIcon.src = userHasLiked ? '../images/thumb_up_liked.png' : '../images/thumb_up_unliked.png';
                    
                    let disLikeIcon = newcard.querySelector('.disLikes');
                    console.log(newcard.querySelector('.disLikes'));
                    
                    disLikeIcon.src = userHasDisLiked ? '../images/thumb_down_active.png' : '../images/thumb_down.png';
                    newcard.querySelector('.likes').onclick = () => incrementLike(id);
                    newcard.querySelector('.disLikes').onclick = () => incrementDisLike(id);
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

function incrementDisLike(id) {
    let newDisLikes = 0; 
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
  
          // Get the current whoDisLiked and whoLiked strings
          const whoDisLiked = wasteDoc.data().whoDisLiked || "";
          let whoLiked = wasteDoc.data().whoLiked || "";
  
          // Check if the user has already disliked the post
          if (whoDisLiked.includes(user.uid)) {
            console.log('User is removing their dislike from this post.');
  
            // Remove the user's ID from the whoDisLiked string
            let newWhoDisLiked = whoDisLiked.split(',').filter(id => id !== user.uid).join(',');
  
            // Decrement the totalLikes count
            let totalLikes = wasteDoc.data().totalLikes;
            let newLikes = totalLikes + 1;
  
            // Update the document with the new values
            transaction.update(wasteDocRef, {
              totalLikes: newLikes,
              whoDisLiked: newWhoDisLiked
            });
  
            return;
          } else if (whoLiked.includes(user.uid)) {
            console.log('User is removing their like and adding dislike from this post.');
  
            // Remove the user's ID from the whoLiked string
            let newWhoLiked = whoLiked.split(',').filter(id => id !== user.uid).join(',');
  
            // Decrement the totalLikes count
            let totalLikes = wasteDoc.data().totalLikes;
            newDisLikes++;
  
            // Update the document with the new values
            transaction.update(wasteDocRef, {
              whoLiked: newWhoLiked
            });
            console.log("updated 1");
          }
  
          // Add user to the whoDisLiked string
          const newWhoDisLiked = whoDisLiked ? `${whoDisLiked},${user.uid}` : user.uid;
  
     
          newDisLikes++;
          console.log("updated 2");
          totalLikes = wasteDoc.data().totalLikes;
          newDisLikes = totalLikes - newDisLikes;
          transaction.update(wasteDocRef, {
            totalLikes: newDisLikes,
            whoDisLiked: newWhoDisLiked
          });

        });
      }).then(() => {
        console.log('DisLike incremented successfully!');
        window.location.reload();
      }).catch(error => {
        console.error('Transaction failed: ', error);
      });
    } else {
      console.log('No user is signed in to dislike the post');
    }
  }


  
  function incrementLike(id) {
    let newLikes = 0;
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
  
          // Get the current whoLiked and whoDisLiked strings
          const whoLiked = wasteDoc.data().whoLiked || "";
          let whoDisLiked = wasteDoc.data().whoDisLiked || "";
  
          // Check if the user has already liked the post
          if (whoLiked.includes(user.uid)) {
            console.log('User is removing their like from this post.');
  
            // Remove the user's ID from the whoLiked string
            let newWhoLiked = whoLiked.split(',').filter(id => id !== user.uid).join(',');
  
            // Decrement the totalLikes count
            let totalLikes = wasteDoc.data().totalLikes;
            let newLikes = totalLikes - 1;
  
            // Update the document with the new values
            transaction.update(wasteDocRef, {
              totalLikes: newLikes,
              whoLiked: newWhoLiked
            });
  
            return;
          } else if (whoDisLiked.includes(user.uid)) {
            console.log('User is removing their like and adding dislike from this post.');
  
            // Remove the user's ID from the whoDisLiked string
            let newWhoDisLiked = whoDisLiked.split(',').filter(id => id !== user.uid).join(',');
  
            // Increment the totalLikes count
            let totalLikes = wasteDoc.data().totalLikes;
            newLikes++;
  
            // Update the document with the new values
            transaction.update(wasteDocRef, {

              whoDisLiked: newWhoDisLiked
            });
            console.log("updated 1");
          }
  
          // Add user to the whoLiked string
          const newWhoLiked = whoLiked ? `${whoLiked},${user.uid}` : user.uid;
  
          // Calculate the new like count based on the number of user IDs in whoLiked

          newLikes++;
          // Update the document
          console.log("updated 2");
          totalLikes = wasteDoc.data().totalLikes;
          newLikes = totalLikes + newLikes;
          transaction.update(wasteDocRef, {
            totalLikes: newLikes,
            whoLiked: newWhoLiked
          });
        });
      }).then(() => {
        console.log('Like incremented successfully!');
        window.location.reload();
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

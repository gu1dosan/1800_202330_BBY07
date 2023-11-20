var DELETEMINIMUM = -3;

function displayCardsDynamically(collection) {
  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          let params = new URL(window.location.href);
          let query = params.searchParams.get("search");

          let cardTemplate = document.getElementById("itemCardTemplate");
          let where = db.collection(collection);
          console.log(query);
          
          if (query) {
              where = where.where('title', '>=', query)
                           .where('title', '<=', query + '\uf8ff')
                           .orderBy('title')
                           .orderBy('totalLikes', 'desc');
          } else {
              where = where.orderBy('totalLikes', 'desc');
          }

          where.get().then(items => {
              items.forEach(item => {
                  if (item.data().totalLikes < DELETEMINIMUM) {
                      db.collection("waste").doc(item.id).delete();
                  } else {
                      console.log(item.data());

                      var name = item.data().title;
                      var imageUrl = item.data().photo;
                      let id = item.id;

                      let newcard = cardTemplate.content.cloneNode(true);
                      newcard.querySelector('.item-card-name').innerHTML = name;
                      newcard.querySelector('.item-card-image').src = imageUrl;
                      newcard.querySelector('.item-card-image').onclick = () => goToDetail(id);
                      newcard.querySelector('.item-card-name').onclick = () => goToDetail(id);
                      // newcard.querySelector('.item-card-color-band').style.backgroundColor = getBinColor(item.data().bin);
                      newcard.querySelector('.item-card-color-band').style.color = getBinColor(item.data().bin);
                      // newcard.querySelector('.item-card-likes').style.color = getBinColor(item.data().bin);
                      newcard.getElementById('likesInput').innerHTML = item.data().totalLikes;

                      let likeIcon = newcard.querySelector('.like-icon');
                      let disLikeIcon = newcard.querySelector('.dislike-icon');

                      likeIcon.addEventListener('click', () => incrementLike(id));
                      disLikeIcon.addEventListener('click', () => incrementDisLike(id));

                      let itemRef = db.collection(collection).doc(item.id);
                      itemRef.onSnapshot((doc) => {
                          if (doc.exists) {
                              const itemData = doc.data();

                              let userHasLiked = itemData.whoLiked && itemData.whoLiked.includes(user.uid);
                              let userHasDisLiked = itemData.whoDisLiked && itemData.whoDisLiked.includes(user.uid);

                              likeIcon.style['font-variation-settings'] = userHasLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
                              disLikeIcon.style['font-variation-settings'] = userHasDisLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
                          } else {
                              console.log('Document does not exist');
                          }
                      });

                      document.getElementById("items-go-here").appendChild(newcard);
                  }
              });
          }).catch(error => {
              console.error("Error fetching items: ", error);
          });

          if (true) { // if there are no recent searches show only the most frequently searched and no headers
              document.querySelector("#recently-searched-header")?.remove();
              document.querySelector("#most-frequently-searched-header")?.remove();
          }
      } else {
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
            return "#443f39";
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
    //newDisLikes exists as a bug fix.
    //Without this variable it's going to not subtract from the total likes twice
    //if user is already liked and presses dislike.
    //Something to do with firebase being too slow if you want to edit the code keep this.
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
  
            // Remove the user's ID from the whoLiked string
            let newWhoLiked = whoLiked.split(',').filter(id => id !== user.uid).join(',');
  
          
            let totalLikes = wasteDoc.data().totalLikes;
            //Here it used to be in the update to just subtract 1 from total likes.
            //but it couldn't do it twice. So we are just adding to newDisLikes to only update once.
            newDisLikes++;
  
            // Update the document with the new values
            transaction.update(wasteDocRef, {
              whoLiked: newWhoLiked
            });
          }
  
          // Add user to the whoDisLiked string
          const newWhoDisLiked = whoDisLiked ? `${whoDisLiked},${user.uid}` : user.uid;
  
          //add 1 to new dislikes and update right after.
          newDisLikes++;
          totalLikes = wasteDoc.data().totalLikes;
          newDisLikes = totalLikes - newDisLikes;
          transaction.update(wasteDocRef, {
            totalLikes: newDisLikes,
            whoDisLiked: newWhoDisLiked
          });

        });
      }).then(() => {
        // window.location.reload();
      }).catch(error => {
        console.error('Transaction failed: ', error);
      });
    } else {
      console.log('No user is signed in to dislike the post');
    }
  }


  
  function incrementLike(id) {
    //newLikes is a bug fix, look at the incrementDisLike function
    //for it's counterpart, and why it exists.
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
  
            // Again, look at the incrementDisLike.
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
  
            // Increment the totalLikes count and then update only 1 time in the function.
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
        // window.location.reload();
      }).catch(error => {
        console.error('Transaction failed: ', error);
      });
    } else {
      console.log('No user is signed in to like the post');
    }
  }


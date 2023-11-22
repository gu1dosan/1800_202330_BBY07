// let params = new URL( window.location.href ); 
// let query = params.searchParams.get( "search" ); 
// if (query && document.getElementById('searchBar')) {
//     console.log(query);
//     document.getElementById('searchBar').value = query;
// }

// document.getElementById("searchButton").onclick = function () {
//     location.href = "../search.html";
// }
// document.getElementById("photo").onclick = function () {
//     $("#selectedPicture").click();
//     location.href = "../TakePhoto.html";
// }

function goToProfile(){
    window.location.href = "../profile.html";
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


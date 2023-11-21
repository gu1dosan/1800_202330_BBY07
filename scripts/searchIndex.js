
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
            db.collection("waste")
            .get()
            .then(querySnapshot => {
              document.getElementById("queryOrNot").innerHTML = "Sorted by your search";
                querySnapshot.forEach(doc => {
                    const title = doc.data().title;
                    var item = doc;
                    if (title) {
                        // Check if the title contains the query (case-insensitive)
                        if (title.toLowerCase().includes(query.toLowerCase())) {
                          if (item.data().totalLikes < DELETEMINIMUM) {
                            db.collection("waste").doc(item.id).delete();
                        } else {
                          
                          console.log(item);
                            console.log(item.data());
      
                            var name = item.data().title;
                            var imageUrl = item.data().photo;
                            let id = item.id;
      
                            let newcard = cardTemplate.content.cloneNode(true);
                            
                            newcard.querySelector('.item-card-name').innerHTML = name;
                            newcard.querySelector('.item-card-image').src = imageUrl;
                            newcard.querySelector('.item-card-image').onclick = () => goToDetail(id);
                            newcard.querySelector('.item-card-name').onclick = () => goToDetail(id);
                            newcard.querySelector('.item-card-see-more').onclick = () => goToDetail(id);
                            // newcard.querySelector('.item-card-color-band').style.backgroundColor = getBinColor(item.data().bin);
                            newcard.querySelector('.item-card-color-band').style.color = getBinColor(item.data().bin);
                            // newcard.querySelector('.item-card-likes').style.color = getBinColor(item.data().bin);
                            let likeInput = newcard.getElementById('likesInput');
      
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
      
                                    likeIcon.style['font-variation-settings'] = userHasLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
                                    disLikeIcon.style['font-variation-settings'] = userHasDisLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
                                } else {
                                    console.log('Document does not exist');
                                }
                                console.log(likeInput);
                                likeInput.innerHTML = item.data().totalLikes;
                            });
      
                            document.getElementById("items-go-here").appendChild(newcard);
                            if (true) { // if there are no recent searches show only the most frequently searched and no headers
                              document.querySelector("#recently-searched-header")?.remove();
                              document.querySelector("#most-frequently-searched-header")?.remove();
                          }
                        }
                    }
                  }
                });
                }).catch(error => {
                    console.error("Error fetching items: ", error);
                });
          } else {
              where = where.orderBy('totalLikes', 'desc');
          
          document.getElementById("queryOrNot").innerHTML = "Sorted by most helpful";
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
                      newcard.querySelector('.item-card-see-more').onclick = () => goToDetail(id);
                      // newcard.querySelector('.item-card-color-band').style.backgroundColor = getBinColor(item.data().bin);
                      newcard.querySelector('.item-card-color-band').style.color = getBinColor(item.data().bin);
                      newcard.querySelector('.item-card-color-band').onclick = () => goToDetail(id);
                      // newcard.querySelector('.item-card-likes').style.color = getBinColor(item.data().bin);

                      let likeIcon = newcard.querySelector('.like-icon');
                      let disLikeIcon = newcard.querySelector('.dislike-icon');
                      let likesInput = newcard.getElementById('likesInput');

                      likeIcon.addEventListener('click', () => {
                        incrementLike(id).then(() => {
                            
                        });
                    });
                    disLikeIcon.addEventListener('click', () => {
                        incrementDisLike(id).then(() => {
                            
                        });
                    });
                      let itemRef = db.collection(collection).doc(item.id);
                      itemRef.onSnapshot((doc) => {
                          if (doc.exists) {
                              const itemData = doc.data();
                              let userHasLiked = itemData.whoLiked && itemData.whoLiked.includes(user.uid);
                              let userHasDisLiked = itemData.whoDisLiked && itemData.whoDisLiked.includes(user.uid);
                              likesInput.innerHTML = doc.data().totalLikes;
                              likeIcon.style['font-variation-settings'] = userHasLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
                              disLikeIcon.style['font-variation-settings'] = userHasDisLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
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
      } 
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




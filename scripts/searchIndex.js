
const DELETEMINIMUM = -3;

function displayCardsDynamically(collection) {
    document.querySelector("#recently-searched-header").innerHTML = "Searching...";

  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          const params = new URL(window.location.href);
          const query = params.searchParams.get("search");

          const cardTemplate = document.getElementById("itemCardTemplate");
          let where = db.collection(collection);
        //   console.log(query);
          
        if (query) {
            db.collection("waste")
            .get()
            .then(querySnapshot => {
              document.getElementById("queryOrNot").innerHTML = "Sorted by your search";
              document.querySelector("#recently-searched-header").innerHTML = "We don't have this item! But you can contribute and add it!";
              document.querySelector("#searchingText").innerHTML = '(Click the "Contribute item" button in the footer)';
                querySnapshot.forEach(doc => {
                    const title = doc.data().title;
                    var item = doc;
                    if (title) {
                        // Check if the title contains the query (case-insensitive)
                        if (title.toLowerCase().includes(query.toLowerCase())) {
                            if (item.data().totalLikes < DELETEMINIMUM) {
                            db.collection("waste").doc(item.id).delete();
                        } else {
                            document.querySelector("#searchingText").hidden = true;
                            document.querySelector("#recently-searched-header").hidden = true;
        
                            let newcard = cardTemplate.content.cloneNode(true);

                            populateItem(newcard, item, user);
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
                        let newcard = cardTemplate.content.cloneNode(true);
                        
                        populateItem(newcard, item, user) ;
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

let populateItem = (newcard, item, user) => {
    newcard.querySelector('.item-card').onclick = () => goToDetail(item.id);
    newcard.querySelector('.item-card-name').innerHTML = item.data().title;
    newcard.querySelector('.item-card-image').src = item.data().photo;
    // newcard.querySelector('.item-card-image').onclick = () => goToDetail(id);
    // newcard.querySelector('.item-card-name').onclick = () => goToDetail(id);
    // newcard.querySelector('.item-card-see-more').onclick = () => goToDetail(id);
    // newcard.querySelector('.item-card-colored-bin').style.backgroundColor = getBinColor(item.data().bin);
    newcard.querySelector('.item-card-colored-bin').style.color = getBinColor(item.data().bin);
    newcard.querySelector('.item-card-colored-bin .bin-icon').innerHTML = getBinIcon(item.data().bin);;
    newcard.querySelector('.item-card-colored-bin .bin-icon').style['font-variation-settings'] = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";

    // newcard.querySelector('.item-card-colored-bin').onclick = () => goToDetail(id);
    // newcard.querySelector('.item-card-likes').style.color = getBinColor(item.data().bin);
    let likeInput = newcard.getElementById('likesInput');
    let likeIcon = newcard.querySelector('.like-icon');
    let disLikeIcon = newcard.querySelector('.dislike-icon');

    likeIcon.addEventListener('click', e => {
        e.stopPropagation()
        incrementLike(item.id)
    });
    disLikeIcon.addEventListener('click', e => {
        e.stopPropagation()
        incrementDisLike(item.id)
    });

    let itemRef = db.collection("waste").doc(item.id);
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
        likeInput.innerHTML = doc.data().totalLikes;
    });

    document.getElementById("items-go-here").appendChild(newcard);
}



// Call displayCardsDynamically with the collection name
displayCardsDynamically("waste");


//use const
//let better than var


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
function getBinIcon(bin) {
    switch (bin) {
        case "Blue bin (Recylable waste)":
            return "recycling";
        case "Green bin (Organic waste)":
            return "nutrition";
        case "Black bin (General waste)":
            return "delete";
        case "Yellow bin/bag (Mixed paper)":
            return "description";
        default:
            return "grey";
    }
}

function goToDetail(id) {
    window.location.href = "../detailpage.html?id=" + id;
}

var currentUser;               //points to the document of the user who is logged in
function populateUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
        // Check if user is signed in:
        let params = new URL(window.location.href);
        let query = params.searchParams.get("profile");
        
        if (query != null){
            currentUserID = query;
            currentUser = db.collection("users").doc(query);
        } else {
            currentUserID = user.uid;
            currentUser = db.collection("users").doc(currentUserID);
        }
        db.collection("users").doc(currentUserID).get().then(userDoc => {
            
   
        
            //go to the correct user document by referencing to the user uid
            
            //get the document for current user.
            if (user.uid === currentUserID){

                document.querySelector(".profileNoHide").hidden = true;
                //get the data fields of the user
                let userName = userDoc.data().userName;
                var nameOfUser = userDoc.data().name;
                var userCity = userDoc.data().city;
                var userEmail = userDoc.data().email;
                var userLikes = userDoc.data().likes;
                var userNumOfPost = userDoc.data().numOfPost;
                
                document.getElementById("userOrNot2").innerHTML = "Your";
                document.getElementById("userOrNot1").hidden = true;
                //if the data fields are not empty, then write them in to the form.
                if (nameOfUser != null) {
                    document.getElementById("nameInput").value = nameOfUser;
                }
                if (userName != null) {
                    document.getElementById("userName").value = userName;
                }
                if (userCity != null) {
                    document.getElementById("cityInput").value = userCity;
                }
                if (userEmail) {
                    document.getElementById("emailInput").value = userEmail;
                }
                document.getElementById("emailInput").innerText = userEmail;
                
            } else {
                document.querySelector(".profileHide").hidden = true;
                document.querySelector(".logOutButtonHide").hidden = true;
                
                document.getElementById("userOrNot1").innerHTML = userDoc.data().userName;
                document.getElementById("userOrNot2").innerHTML = userDoc.data().userName + "'s";
            }
            let numOfPosts = 0;
                let numOfLikes = 0;
                db.collection("waste").get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        
                        
                        if (doc.data().userID === currentUserID) {
                            numOfPosts++;
                            numOfLikes += doc.data().totalLikes;
                        }
                        console.log(doc.id, " => ", doc.data());
                    });
                    currentUser.update({
                        numOfPost: numOfPosts,
                        numOfLikes: numOfLikes
                    }).then(() => {
                        
                        document.getElementById("likesInput").innerText = numOfLikes;
                        document.getElementById("numOfPostInput").innerText = numOfPosts;
                        progressBar("likes", numOfLikes);
                        progressBar("posts", numOfPosts);
                    })
                    
                })
                displayCardsDynamically1("waste", currentUserID);
            
            });

        } else {
            // No user is signed in.
            console.log("No user is signed in");
        }
     
    });
}

//call the function to run it 
populateUserInfo();

function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}

function saveUserInfo() {
    nameOfUser = document.getElementById('nameInput').value;       //get the value of the field with id="nameInput"
    userCity = document.getElementById('cityInput').value;       //get the value of the field with id="cityInput"
    userName = document.getElementById("userName").value;
    currentUser.update({
        name: nameOfUser,
        city: userCity,
        userName: userName
    }).then(() => {
        
    })

    document.getElementById('personalInfoFields').disabled = true;
}


function displayCardsDynamically1(collection, currentUser) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            user = currentUser;
            let cardTemplate = document.getElementById("itemCardTemplate");
            let where = db.collection(collection);

            
            db.collection("waste")
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        if (doc.data().userID.includes(user)) {
                            var item = doc;
                            let newcard = cardTemplate.content.cloneNode(true);
                            populateItem(newcard, item, user);
                        }
                    })
                })
        }

    })
};

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

function progressBar(id, num) {
    const bars = ["info", "warning", "danger"];
    const MUL_FACTOR = 5;
    let achivementNum = 1;

    let ele = document.getElementById(id)
    let progress = ele.getElementsByClassName("progress-bar");
    let badge = ele.querySelectorAll("span.badge");

    for (let i = 0; i < progress.length; i++) {
        let percent = Math.round(num / achivementNum * 100);
        percent = (percent < 0) ? 0 : percent;
        percent = Math.min(percent, 100);

        progress[i].innerText = percent + "%";
        progress[i].setAttribute("class", progress[i].getAttribute("class") + "");
        progress[i].setAttribute("style", "width: " + percent + "%");

        if (percent >= 100) {
            let newAttr = badge[i].getAttribute("class").replace("secondary", bars[i]);
            badge[i].setAttribute("class", newAttr);
        }
        achivementNum *= MUL_FACTOR;
    }
}


function goToDetail(id) {
    window.location.href = "../detailpage.html?id=" + id;
}


let populateItem = (newcard, item, Caruser) => {
    firebase.auth().onAuthStateChanged(user => {
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
        } 
        likeInput.innerHTML = doc.data().totalLikes;
    });

    document.getElementById("items-go-here").appendChild(newcard);
});
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
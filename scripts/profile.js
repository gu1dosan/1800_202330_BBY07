var currentUser;               //points to the document of the user who is logged in
function populateUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if user is signed in:
        if (user) {
            //go to the correct user document by referencing to the user uid
            currentUser = db.collection("users").doc(user.uid)
            //get the document for current user.
            currentUser.get().then(userDoc => {
                //get the data fields of the user
                var userName = userDoc.data().name;
                var userCity = userDoc.data().city;
                var userEmail = userDoc.data().email;
                var userLikes = userDoc.data().likes;
                var userNumOfPost = userDoc.data().numOfPost;

                //if the data fields are not empty, then write them in to the form.
                if (userName != null) {
                    document.getElementById("nameInput").value = userName;
                }
                if (userCity != null) {
                    document.getElementById("cityInput").value = userCity;
                }
                if (userEmail) {
                    document.getElementById("emailInput").value = userEmail;
                }
                document.getElementById("emailInput").innerText = userEmail;
                let numOfPosts = 0;
                let numOfLikes = 0;

                db.collection("waste").get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if (doc.data().userID === user.uid) {
                            numOfPosts++;
                            numOfLikes += doc.data().totalLikes;
                        }
                        console.log(doc.id, " => ", doc.data());
                    });
                    currentUser.update({
                        numOfPost: numOfPosts,
                        numOfLikes: numOfLikes
                    }).then(() => {
                        console.log('User collection successfully updated with new number of posts and likes.');
                        document.getElementById("likesInput").innerText = numOfLikes;
                        document.getElementById("numOfPostInput").innerText = numOfPosts;
                        progressBar("likes", numOfLikes);
                        progressBar("posts", numOfPosts);
                    })

                })
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
    userName = document.getElementById('nameInput').value;       //get the value of the field with id="nameInput"
    userCity = document.getElementById('cityInput').value;       //get the value of the field with id="cityInput"

    currentUser.update({
        name: userName,
        city: userCity
    }).then(() => {
        console.log("Document successfully updated!");
    })

    document.getElementById('personalInfoFields').disabled = true;
}


function displayCardsDynamically(collection) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            let cardTemplate = document.getElementById("itemCardTemplate");
            let where = db.collection(collection);


            db.collection("waste")
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        if (doc.data().userID.includes(user.uid)) {
                            const title = doc.data().title;
                            var item = doc;
                            var name = item.data().title;
                            var imageUrl = item.data().photo;
                            let id = item.id;

                            let newcard = cardTemplate.content.cloneNode(true);
                            newcard.querySelector('.item-card-name').innerHTML = name;
                            newcard.querySelector('.item-card-image').src = imageUrl;
                            newcard.querySelector('.item-card-image').onclick = () => goToDetail(id);
                            newcard.querySelector('.item-card-name').onclick = () => goToDetail(id);
                            newcard.querySelector('.item-card-see-more').onclick = () => goToDetail(id);
                            // newcard.querySelector('.item-card-colored-bin').style.backgroundColor = getBinColor(item.data().bin);
                            newcard.querySelector('.item-card-colored-bin').style.color = getBinColor(item.data().bin);
                            newcard.querySelector('.item-card-colored-bin').onclick = () => goToDetail(id);
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
                    })
                })
        }

    })
};
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


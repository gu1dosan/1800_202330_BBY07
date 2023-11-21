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
                        if (doc.data().userID === user.uid){
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
firebase.auth().onAuthStateChanged(function(user) {
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
                            // newcard.querySelector('.item-card-likes').style.color = getBinColor(item.data().bin);
                            newcard.querySelector('.item-card-color-band').style.color = getBinColor(item.data().bin);
                            newcard.querySelector(".deleteButton").onclick = () => deleteThis(doc.ref);
    
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

function deleteThis(docRef) {
    docRef.delete().then(() => {
        console.log("Document successfully deleted!");
        window.location.reload();
    })
}


// // progressBar("likes", 25);
// function progressBar(id, num) {
//     const bars = ["info", "warning", "danger"];
//     const MUL_FACTOR = 5;
//     let achivementNum = 1;

//     for(let i = 0; i < bars.length; i++) {
//         let ele = document.getElementById(id)
//         ele = ele.getElementsByClassName("progress-bar");
//         ele[i].setAttribute("class", ele[i].getAttribute("class") + "");
        
//         // ele[i].setAttribute("style", "width: " parseInt(achivementNum, 10))


//         achivementNum
//         console.log(ele[i].getAttribute("class"));
//     }
// }
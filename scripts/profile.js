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
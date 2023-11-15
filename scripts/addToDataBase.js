var ImageFile;      //global variable to store the File Object reference

function chooseFileListener(){
    const fileInput = document.getElementById("garbagePhoto");   // pointer #1
    const image = document.getElementById("mypic-goes-here");   // pointer #2

    //attach listener to input file
    //when this file changes, do something
    fileInput.addEventListener('change', function(e){

        //the change event returns a file "e.target.files[0]"
        ImageFile = e.target.files[0];
        var blob = URL.createObjectURL(ImageFile);

        //change the DOM img element source to point to this file
        image.src = blob;    //assign the "src" property of the "img" tag
    }
  )}


chooseFileListener();


  function writeReview() {
    console.log("inside write review");
    let garbageTitle = document.getElementById("title").value;
    let bin = document.getElementById("bin").value;
    let description = document.getElementById("description").value;
    var user = firebase.auth().currentUser;

    if (user) {
        var storageRef = firebase.storage().ref(ImageFile.name);

        // Asynch call to put File Object (global variable ImageFile) onto Cloud
        storageRef.put(ImageFile, { contentType: ImageFile.type })
            .then(function () {
                console.log('Uploaded to Cloud Storage.');



                // Asynch call to get URL from Cloud
                storageRef.getDownloadURL().then(function (url) {
                    console.log("Got the download URL.");

                    // Get the document for the current user.
                    db.collection("waste").add({
                        userID: user.uid,
                        title: garbageTitle,
                        photo: url, // Use the URL obtained from Cloud Storage
                        bin: bin,
                        description: description,
                        whoLiked: "",
                        totalLikes: 0,
                        whoDisLiked: "",
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        window.location.href = "thanks.html"; // Redirect to the thanks page
                    }).catch((error) => {
                        console.error("Error adding document: ", error);
                    });
                }).catch(function (error) {
                    console.error("Error getting download URL: ", error);
                });
            }).catch(function (error) {
                console.error("Error uploading to Cloud Storage: ", error);
            });
    } else {
        console.log("No user is signed in");
        window.location.href = 'index.html';
    }
}


function goToIndex(){
    window.location.href = "../search.html";
}
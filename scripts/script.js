function sayHello() {
}

// let params = new URL( window.location.href ); 
// let query = params.searchParams.get( "search" ); 
// if (query && document.getElementById('searchBar')) {
//     console.log(query);
//     document.getElementById('searchBar').value = query;
// }

document.getElementById("searchButton").onclick = function () {
    location.href = "../main.html";
}
document.getElementById("photo").onclick = function () {
    $("#selectedPicture").click();
    location.href = "../TakePhoto.html";
}
document.getElementById("searchButtonNav").onclick = function () {
    var query = document.getElementById('searchBar').value;
    console.log("query= " + query)
    if(query){
        console.log("query= " + query)
        location.href = "../main.html?search=" + query;
    } else {
        location.href = "../main.html";
    }
    
}

function goToDetail() {
    
    window.location.href = "../detailpage.html";
    
}

function takePhoto() {
    window.location.href = "../TakePhoto.html";

}


var photo = ""

document.getElementById(takePhoto()).src = photo;

// Assuming 'firebase' is already initialized and 'storage' is your Firebase Storage reference

// Function to get image URL from Firebase Storage
function getImageUrl(imagePath) {
    // Create a reference to the file we want to download
    var storageRef = firebase.storage().ref();
    var imageRef = storageRef.child(imagePath);

    // Get the download URL
    imageRef.getDownloadURL().then(function(url) {
        // This can now be downloaded directly
        var img = document.querySelector('img'); // Replace with a more specific selector as needed
        img.src = url; // Set the image src to the download URL
    }).catch(function(error) {
        // Handle any errors
        console.error("Error fetching image from Firebase Storage", error);
    });
}

// For each item in your Firebase Database, call this function with the appropriate image path
getImageUrl('path/to/your/image.jpg');


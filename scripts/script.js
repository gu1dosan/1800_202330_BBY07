function sayHello() {
}

// let params = new URL( window.location.href ); 
// let query = params.searchParams.get( "search" ); 
// if (query && document.getElementById('searchBar')) {
//     console.log(query);
//     document.getElementById('searchBar').value = query;
// }

document.getElementById("searchButton").onclick = function () {
    location.href = "../index.html";
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
        location.href = "../index.html?search=" + query;
    } else {
        location.href = "../index.html";
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

function goToProfile(){
    window.location.href = "../profile.html";
}




/*
 * User Handling function
 */
function displayUserName() {

}

function logout() {

}
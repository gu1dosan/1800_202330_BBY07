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



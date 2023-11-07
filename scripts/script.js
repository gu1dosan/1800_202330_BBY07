function sayHello() {
}



document.getElementById("searchButton").onclick = function () {
    location.href = "../searchIndex.html";
}
document.getElementById("photo").onclick = function () {
    $("#selectedPicture").click();
    location.href = "../TakePhoto.html";
}
document.getElementById("searchButtonNav").onclick = function () {
    
    location.href = "../itemlist.html";
    
}

function takePhoto() {
    window.location.href = "../TakePhoto.html";

}


var photo = ""

document.getElementById(takePhoto()).src = photo;



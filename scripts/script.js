function sayHello() {
}

function takePicture() {
    $("#selectedPicture").click();
 }
document.getElementById("searchButton").onclick = function () {
    location.href = "../searchIndex.html";
}
document.getElementById("photo").onclick = function () {
    location.href = "../confirmPhoto.html";
}
document.getElementById("searchButtonNav").onclick = function () {
    location.href = "../itemlist.html";
}
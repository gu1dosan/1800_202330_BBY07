function redirectToPage(event) {
  // Prevent the default form action
  event.preventDefault();
  // Replace with the URL you want to redirect to
  window.location.href = '../addToDataBase.html';
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
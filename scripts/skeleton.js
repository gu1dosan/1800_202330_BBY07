//---------------------------------------------------
// This function loads the parts of your skeleton 
// (navbar, footer, and other things) into html doc. 
//---------------------------------------------------
function loadSkeleton() {
    console.log($('#navbarPlaceholder').load('./components/nav_before_login.html'));
    console.log($('#nav_with_searchPlaceholder').load('./components/nav_with_search.html'));
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {                   //if the pointer to "user" object is not null, then someone is logged in
            // User is signed in.
            // Do something for the user here.
            console.log($('#offcanvasPlaceholder').load('./components/offcanvas_after_login.html'));
        } else {
            // No user is signed in.
            console.log($('#offcanvasPlaceholder').load('./components/offcanvas_before_login.html'));
        }
    });
}
loadSkeleton(); //invoke the function
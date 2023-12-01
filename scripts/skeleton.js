function loadSkeleton() {
	$('#nav_with_searchPlaceholder').load('./components/nav_with_search.html');

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) { 
			$('#footerPlaceholder').load('./components/footer_after_login.html');
		} else {
			$('#footerPlaceholder').load('./components/footer_before_login.html');
		}
	});
}

loadSkeleton(); 
function logout() {
	firebase.auth().signOut().then(() => {
		console.log("logging out successsfully");
		location.href = "/index.html";
	}).catch((err) => {
		console.log(err);
	});
}
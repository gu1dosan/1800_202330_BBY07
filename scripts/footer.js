
const currentUrl = window.location.href;

const menuItems = document.querySelector('footer.fixed-bottom').querySelectorAll('a');

menuItems.forEach(menuItem => {

	const menuItemUrl = menuItem.getAttribute('href');
	
	if (currentUrl.includes(menuItemUrl.slice(1))) {
		menuItem.style.backgroundColor = '#f2f2f2';
		menuItem.style.fontWeight = '700';

	}
});

/**
 * This function loads the profile picture of the user using firebase.
 */
function loadProfilePhoto() {
	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			db.collection("users").doc(user.uid).get().then(userDoc => {
				let proPic = userDoc.data().profilePic;
				let img = document.querySelector(".profilePic");
				if (proPic) {

					img.src = proPic;
				} else {
					img.src = "../images/material-icon-account.svg";
				}
				img.style.borderRadius = '50%';
				img.style.width = '40px';
				img.style.height = '40px';
			})
		}
	})
}

loadProfilePhoto();

closeAddItemAlert = () => {
	document.querySelector(".footer-add-item-alert").style.display = "none";
	// sessionStorage.setItem("footerAddItemAlertClosed", true);
}
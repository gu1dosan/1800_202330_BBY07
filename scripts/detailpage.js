/**
 * displayItemInfo uses htmls <template> to display a users posts
 *      from firebase.
 * To get to this page they must click on a specific document. The code below
 *      gets that doc id and displays all info about it that it can from
 *      the firebase.
 */
function displayItemInfo() {
    //Gets the doc id.	
	let params = new URL(window.location.href);
	let ID = params.searchParams.get("id");

	db.collection("waste")
		.doc(ID)
		.get()
		.then(doc => {
			let user = firebase.auth().currentUser;
			item = doc.data();
			itemName = doc.data().title;

			db.collection("users").doc(item.userID).get().then(userDoc => {
				userName = userDoc.data().userName;
				displayInnerHTML(item, document, doc);

				if (userDoc.data().profilePic){
					document.getElementById("contributor-profile-pic").src = userDoc.data().profilePic;
				} else {
					document.getElementById("contributor-profile-pic").src = "../images/material-icon-account.svg";
				}
				
                //Lets the user delete the item if they are the poster. If not this button gets hidden
                //  and turned off.
				if (user.uid === item.userID) {
					document.querySelector(".DeleteButton").hidden = false;
				}
				likeButtonTotalLikes(user, document, ID);
			});
		});
}
displayItemInfo();

/**
 * This is a helper method for displayItemInfo.
 * It decides what the background color, and icon colors are
 * depending on the bin.
 * @param {String} bin bin is the firebase data stored for that specific doc id.
 * @returns the color for the icons and background.
 */
function getBinColor(bin) {
	switch (bin) {
		case "Blue bin (Recylable waste)":
			return "#0070b8";
		case "Green bin (Organic waste)":
			return "#02a54a";
		case "Black bin (General waste)":
			return "#443f39";
		case "Yellow bin/bag (Mixed paper)":
			return "#ffd350";

		default:
			return "grey";
	}
}

/**
 * Simple redirection function.
 */
function goToIndex() {
	window.location.href = "../search.html";
}

/**
 * Lets the user delete their own post.
 */
function deleteThis() {
	let params = new URL(window.location.href);
	let ID = params.searchParams.get("id");
	let docRef = db.collection('waste').doc(ID);
	let user = firebase.auth().currentUser;

	docRef.get().then((doc) => {
		if (user.uid === doc.data().userID) {
			docRef.delete().then(() => {

				window.location.href = "../deleted.html";
			});
		}
	});
}

/**
 * Simple redirection function that gets a specific 
 * profile id to go to someone elses profile.
 * @param {string} id id is the posters id that we send over to the next page to know whose 
 * information we want to display.
 */
function goToProfile(id) {
	window.location.href = "../profile.html?profile=" + id;
}

/**
 * Sets up the functionality for like and dislike buttons and updates their display based on real-time data.
 * This function adds event listeners to the like and dislike buttons to handle click events, 
 * and listens to changes in the Firestore document to update the like count and the visual state of the buttons.
 * The visual state of the buttons changes based on whether the user has liked or disliked the item.
 *
 * @param {Object} user - The currently authenticated user's object.
 * @param {Document} document - The global document object representing the DOM.
 * @param {string} ID - The ID of the document in Firestore.
 */
function likeButtonTotalLikes(user, document, ID){
	let likesInput = document.getElementById("likesInput");
	let likeIcon = document.querySelector('.like-icon');
	let disLikeIcon = document.querySelector('.dislike-icon');

	likeIcon.addEventListener('click', () => incrementLike(ID));
	disLikeIcon.addEventListener('click', () => incrementDisLike(ID));


	let itemRef = db.collection("waste").doc(ID);


	itemRef.onSnapshot((doc) => {
		if (doc.exists) {
			const itemData = doc.data();
			likesInput.innerHTML = doc.data().totalLikes;

			let userHasLiked = itemData.whoLiked && itemData.whoLiked.includes(user.uid);
			let userHasDisLiked = itemData.whoDisLiked && itemData.whoDisLiked.includes(user.uid);
			likeIcon.style['font-variation-settings'] = userHasLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
			disLikeIcon.style['font-variation-settings'] = userHasDisLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
		} 
	});
}

/**
 * Updates the inner HTML of various elements on a detail page based on the provided item and document data.
 * This function sets the content and style of elements like the profile button, item name, contributor's name, 
 * item image, and item description. It also adjusts styles based on the item's bin type.
 *
 * @param {Object} item - The item object containing data such as the photo URL.
 * @param {Document} document - The global document object representing the DOM.
 * @param {DocumentSnapshot} doc - The Firebase document snapshot containing the item's detailed data.
 */
function displayInnerHTML(item, document, doc){
	document.querySelector(".goToProfileButton").onclick = () => goToProfile(doc.data().userID)

	document.querySelector(".detail-name").innerHTML = itemName;
	document.getElementById("userName").innerHTML = userName;
	document.querySelector(".detail-image").src = item.photo;
	document.querySelector(".detail-description").innerHTML = doc.data().description;

	document.querySelector(".DeleteButton").hidden = true;

	document.querySelector('body').style = "background-color: " + getBinColor(doc.data().bin) + ";";
	document.querySelector(".like-icon").style.color = getBinColor(doc.data().bin);
	document.querySelector(".dislike-icon").style.color = getBinColor(doc.data().bin);
	document.querySelector('.item-detail-bin').style.color = getBinColor(doc.data().bin);
	document.querySelector('.item-detail-bin-name').innerHTML = doc.data().bin;
	document.querySelector('.item-detail-bin-name').style.color = getBinColor(doc.data().bin);
};

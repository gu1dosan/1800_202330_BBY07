/**
 * Automatically delets a post if the post reaches less total likes than this constant.
 */
const DELETEMINIMUM = -3;

/**
 * Dynamically displays cards with posts from the Firebase database in a user interface.
 * It shows items based on a search query or, if no query is made, sorts the posts by total likes.
 * Posts with total likes below the defined minimum (DELETEMINIMUM) are automatically deleted.
 *
 * @param {string} collection - The name of the collection in Firebase to query for posts.
 */
function displayCardsDynamically(collection) {
    //Informs user the function is still searching.
	document.querySelector("#recently-searched-header").innerHTML = `<div class="spinner-border" style="margin-right:8px" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>Searching...`;

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
            //Gets the users query.
			const params = new URL(window.location.href);
			const query = params.searchParams.get("search");

			const cardTemplate = document.getElementById("itemCardTemplate");
			let where = db.collection(collection);
            //If the user made a query we have to populate the template appropriatly.
			if (query) {
				document.querySelector("#search-bar-input").placeholder = query;
				db.collection("waste")
					.get()
					.then(querySnapshot => {
						displaySearchingText(querySnapshot, document, user);
                        //Displays the item.
						querySnapshot.forEach(doc => {

							displayEachDoc(doc, query, user, cardTemplate);

						});
					})
            //If no search was made.
			} else {
                //Orders by total likes.
				where = where.orderBy('totalLikes', 'desc');

				document.getElementById("queryOrNot").innerHTML = "Sorted by most helpful";
                
                //Displays item.
				where.get().then(items => {
					items.forEach(item => {
						if (item.data().totalLikes < DELETEMINIMUM) {
							db.collection("waste").doc(item.id).delete();
						} else {
							let newcard = cardTemplate.content.cloneNode(true);
							populateItem(newcard, item, user);
						}
					});
                document.querySelector("#searchingText").style.display = 'none';
				})

                //Removes the "havent found item?".
                document.querySelector("#recently-searched-header")?.remove();
                document.querySelector("#most-frequently-searched-header")?.remove();
            
			}
		}
	});
}

/**
 * Populates a card template with data from a Firebase document.
 * Sets up the card's click events, text content, image source, and styles.
 * Adds event listeners for like and dislike interactions.
 *
 * @param {HTMLElement} newcard - The card template to populate with data.
 * @param {DocumentSnapshot} item - The Firebase document containing the post data.
 * @param {Object} user - The currently authenticated user's object.
 */
let populateItem = (newcard, item, user) => {
	newcard.querySelector('.item-card').onclick = () => goToDetail(item.id);
	newcard.querySelector('.item-card-name').innerHTML = item.data().title;
	newcard.querySelector('.item-card-image').src = item.data().photo;
	newcard.querySelector('.item-card-colored-bin').style.color = getBinColor(item.data().bin);
	newcard.querySelector('.item-card-colored-bin .bin-icon').innerHTML = getBinIcon(item.data().bin);;
	newcard.querySelector('.item-card-colored-bin .bin-icon').style['font-variation-settings'] = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";

	let likeInput = newcard.getElementById('likesInput');
	let likeIcon = newcard.querySelector('.like-icon');
	let disLikeIcon = newcard.querySelector('.dislike-icon');

	likeIcon.addEventListener('click', e => {
		e.stopPropagation()
		incrementLike(item.id)
	});
	disLikeIcon.addEventListener('click', e => {
		e.stopPropagation()
		incrementDisLike(item.id)
	});

	let itemRef = db.collection("waste").doc(item.id);
	itemRef.onSnapshot((doc) => {
		if (doc.exists) {
			const itemData = doc.data();

			let userHasLiked = itemData.whoLiked && itemData.whoLiked.includes(user.uid);
			let userHasDisLiked = itemData.whoDisLiked && itemData.whoDisLiked.includes(user.uid);

			likeIcon.style['font-variation-settings'] = userHasLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
			disLikeIcon.style['font-variation-settings'] = userHasDisLiked ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
		} else {
		}
		likeInput.innerHTML = doc.data().totalLikes;
	});

	document.getElementById("items-go-here").appendChild(newcard);
}

displayCardsDynamically("waste");

/**
 * Determines the color associated with a specific type of bin.
 * Used to set the color of UI elements based on the bin type.
 *
 * @param {string} bin - The type of bin (e.g., "Blue bin (Recyclable waste)").
 * @returns {string} The color corresponding to the given bin type.
 */
function getBinColor(bin) {
	switch (bin) {
		case "Blue bin (Recylable waste)":
			return "#0070b8";
		case "Green bin (Organic waste)":
			return "#017d47";
		case "Black bin (General waste)":
			return "#443f39";
		case "Yellow bin/bag (Mixed paper)":
			return "#ffc525";
		default:
			return "grey";
	}
}

/**
 * Determines the icon associated with a specific type of bin.
 * Used to set the icon of UI elements based on the bin type.
 *
 * @param {string} bin - The type of bin (e.g., "Blue bin (Recyclable waste)").
 * @returns {string} The icon corresponding to the given bin type.
 */
function getBinIcon(bin) {
	switch (bin) {
		case "Blue bin (Recylable waste)":
			return "recycling";
		case "Green bin (Organic waste)":
			return "nutrition";
		case "Black bin (General waste)":
			return "delete";
		case "Yellow bin/bag (Mixed paper)":
			return "description";
		default:
			return "grey";
	}
}

/**
 * Redirects the user to the detail page of a specific item.
 * The item is identified by its document ID in Firebase.
 *
 * @param {string} id - The document ID of the item to display in detail.
 */
function goToDetail(id) {
	window.location.href = "../detailpage.html?id=" + id;
}

/**
 * Displays a pop-up message on the page.
 * Used to inform users about the status of their search or to provide additional options.
 *
 * @param {Document} document - The global document object representing the DOM.
 */
function displayPopUp(document){
	document.querySelector("#searchingText").style.display = 'none';
	document.querySelector("#recently-searched-header").style.display = 'none';
	if (!sessionStorage.getItem("footerAddItemAlertClosed")) {
		document.querySelector(".footer-add-item-alert").style.display = "block";
	}
	document.querySelector(".search-header").style.display = "block";
}

/**
 * Processes each document from a Firebase query and displays it if it meets certain criteria.
 * This function checks if the title or description of a document contains a specific query string.
 * If the document meets the criteria and has total likes above a defined minimum, it will display the document.
 * Otherwise, if total likes are below the minimum, the document is deleted from the database.
 *
 * @param {DocumentSnapshot} doc - The Firebase document to be processed.
 * @param {string} query - The search query string to match against the document's title and description.
 * @param {Object} user - The currently authenticated user's object.
 * @param {HTMLTemplateElement} cardTemplate - The HTML template for displaying an individual document.
 */
function displayEachDoc(doc, query, user, cardTemplate){
	const title = doc.data().title;
	const description = doc.data().description;
	let item = doc;
	if (title) {
		if (title.toLowerCase().includes(query.toLowerCase()) || (description && description.toLowerCase().includes(query.toLowerCase()))) {
			if (item.data().totalLikes < DELETEMINIMUM) {
				db.collection("waste").doc(item.id).delete();
			} else {
				document.querySelector("#searchingText").style.display = 'none';
				document.querySelector("#recently-searched-header").style.display = 'none';
				// if (!sessionStorage.getItem("footerAddItemAlertClosed")) {
					document.querySelector(".footer-add-item-alert").style.display = "block";
				// }
				document.querySelector(".search-header").style.display = "block";
				let newcard = cardTemplate.content.cloneNode(true);

				populateItem(newcard, item, user);
			}
		}
	}
}

/**
 * Displays search-related messages on the UI based on the results of the query.
 * If no items matching the query are found, it shows a message indicating the item is not available,
 * and prompts the user to contribute the item. It also updates elements to reflect that the results
 * are sorted based on the user's search query.
 *
 * @param {QuerySnapshot} querySnapshot - The Firebase query snapshot containing the search results.
 * @param {Document} document - The global document object representing the DOM.
 * @param {Object} user - The currently authenticated user's object. (Unused in the current implementation, but may be needed for future enhancements).
 */
function displaySearchingText(querySnapshot, document, user){
	document.getElementById("queryOrNot").innerHTML = "Sorted by your search";
	//This gets hidden if a post is found.
	//stays if zero posts were found to inform the user nothing came up.
	document.querySelector("#recently-searched-header").innerHTML = "We don't have this item! But you can contribute and add it!";
	document.querySelector("#searchingText").innerHTML = '(Click the "Contribute item" button in the footer)';

	//Alerts the user that despite us finding an item including query.
	//They can add more items if they did not find the one they were searching for.
	document.querySelector(".footer-add-item-alert").style.display = "none";
	document.querySelector(".search-header").style.display = "none";
}
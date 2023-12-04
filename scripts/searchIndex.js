/**
 * Automatically delets a post if the post reaches less total likes than this constant.
 */
const DELETEMINIMUM = -3;
/**
 * displayCardsDynamically uses htmls <template> to display different users posts
 *      from firebase.
 * It displays these items based on the search (query). If no query was made
 *      it will sort the posts by the totalLikes field in firebase (helpfulness).
 *      If a query was made it searches through every document and gets the title
 *      if query string is in the title it will display it. If query string is not
 *      in the title it doesnt display the item.
 * @param collection collection is the name of the collection in firebase.
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
						document.getElementById("queryOrNot").innerHTML = "Sorted by your search";

                        //This gets hidden if a post is found.
                        //stays if zero posts were found to inform the user nothing came up.
						document.querySelector("#recently-searched-header").innerHTML = "We don't have this item! But you can contribute and add it!";
						document.querySelector("#searchingText").innerHTML = '(Click the "Contribute item" button in the footer)';

                        //Alerts the user that despite us finding an item including query.
                        //They can add more items if they did not find the one they were searching for.
						document.querySelector(".footer-add-item-alert").style.display = "none";
						document.querySelector(".search-header").style.display = "none";

                        //Displays the item.
						querySnapshot.forEach(doc => {
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

						});
					}).catch(error => {
						console.error("Error fetching items: ", error);
					});
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
				}).catch(error => {
					console.error("Error fetching items: ", error);
				});

                //Removes the "havent found item?".
                document.querySelector("#recently-searched-header")?.remove();
                document.querySelector("#most-frequently-searched-header")?.remove();
            
			}
		}
	});
}

/**
 * Uses HTML <template> to display items into the page.
 * @param {*} newcard the HTML template selector.
 * @param {*} item The doc id to display.
 * @param {*} user The user of the post.
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
 * This is a helper method for populateItem.
 * It decides what the background color, and icon colors are
 * depending on the bin.
 * @param {*} bin bin is the firebase data stored for that specific doc id.
 * @returns the color for the icons and background.
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
 * This is a helper method for populateItem.
 * It decides what the background color, and icon colors are
 * depending on the bin.
 * @param {*} bin bin is the firebase data stored for that specific doc id.
 * @returns the color for the icons and background.
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
 * Goes to the detail page of a specific doc id.
 * @param {} id the document id clicked on by the user.
 */
function goToDetail(id) {
	window.location.href = "../detailpage.html?id=" + id;
}
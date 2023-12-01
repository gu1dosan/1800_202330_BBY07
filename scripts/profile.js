let currentUser; 

/**
 * Displays only the users post based on the profile id.
 * This is done so that users can see other users profiles
 *      and their posts.
 */
function populateUserInfo() {
	firebase.auth().onAuthStateChanged(user => {
        
        //Makes sure the user is logged in.
		if (user) {

            //Gets the id of whose profile we should display.
			let params = new URL(window.location.href);
			let query = params.searchParams.get("profile");

            //Bug catcher incase there is no profile id.
            //sets it to just the current users id, thats also
            //  why we check if the user is logged in.
			if (query != null) {
				currentUserID = query;
				currentUser = db.collection("users").doc(query);
			} else {
				currentUserID = user.uid;
				currentUser = db.collection("users").doc(currentUserID);
			}

			db.collection("users").doc(currentUserID).get().then(userDoc => {

                //If we are at the current users profile page.
				if (user.uid === currentUserID) {

					document.querySelector(".profileNoHide").hidden = true;

					//get the data fields of the user
					let userName = userDoc.data().userName;
					let nameOfUser = userDoc.data().name;
					let userCity = userDoc.data().city;
					let userEmail = userDoc.data().email;
					let userLikes = userDoc.data().likes;
					let userNumOfPost = userDoc.data().numOfPost;
					let picUrl = userDoc.data().profilePic;

                    //Hides stuff that would appear if you were at someone elses profile page.
                    //And shows stuff that should appear that wouldn't if you were at someone
                    //  elses profile page.
					document.getElementById("userOrNot2").innerHTML = "Your";
					document.getElementById("userOrNot1").hidden = true;
					if (nameOfUser != null) {
						document.getElementById("nameInput").value = nameOfUser;
					}
					if (userName != null) {
						document.getElementById("userName").value = userName;
					}
					if (userCity != null) {
						document.getElementById("cityInput").value = userCity;
					}
					if (userEmail) {
						document.getElementById("emailInput").value = userEmail;
					}
					if (picUrl != null) {
						console.log(picUrl);
						$("#mypic-goes-here").attr("src", picUrl);
						document.querySelector("#mypic-goes-here").style.borderRadius = "50%";
					}
					document.getElementById("emailInput").innerText = userEmail;

                //If not at your own profile page.
				} else {
                    
                    //Hides stuff we don't want to let the user see.
					document.querySelector(".profileHide").hidden = true;
					document.querySelector(".logOutButtonHide").hidden = true;
					let proPic = userDoc.data().profilePic;
					console.log(proPic);
					if (proPic) {
						console.log(document.querySelector("#SEprofilePic"))
						let img = document.querySelector("#SEprofilePic")
						img.src = userDoc.data().profilePic;
						img.style.borderRadius = "50%";
						img.style.width = "70px";
						img.style.height = "70px";
					} else {
						document.querySelector("#SEprofilePic").src = "../images/material-icon-account.svg";
					}

					document.getElementById("userOrNot1").innerHTML = userDoc.data().userName;
					document.getElementById("userOrNot2").innerHTML = userDoc.data().userName + "'s";
				}
				let numOfPosts = 0;
				let numOfLikes = 0;

				db.collection("waste").get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {


						if (doc.data().userID === currentUserID) {
							numOfPosts++;
							numOfLikes += doc.data().totalLikes;
						}
						console.log(doc.id, " => ", doc.data());
					});
					currentUser.update({
						numOfPost: numOfPosts,
						numOfLikes: numOfLikes
					}).then(() => {

						document.getElementById("likesInput").innerText = numOfLikes;
						document.getElementById("numOfPostInput").innerText = numOfPosts;
						progressBar("likes", numOfLikes);
						progressBar("posts", numOfPosts);
						giveAchivement("likes", numOfLikes);
						giveAchivement("posts", numOfPosts);
					})

				})
				displayCardsDynamically1("waste", currentUserID);

			});

		} else {

		}

	});
}

//call the function to run it 
populateUserInfo();

/**
 * Lets the user edit their firebase information.
 */
function editUserInfo() {

	document.getElementById('personalInfoFields').disabled = false;
}

/**
 * Saves the edited profile picture if there is one.
 * And calls the next method with different paramaters depending
 *   on if the profile picture was saved or not.
 */
function saveUserInfo() {
	firebase.auth().onAuthStateChanged(function(user) {
		let storageRef = storage.ref("images/" + user.uid + ".jpg");
		if (ImageFile) {
			
			storageRef.put(ImageFile)
				.then(function() {
					console.log('Uploaded to Cloud Storage.');

					
					storageRef.getDownloadURL()

						.then(function(url) { 

							console.log("Got the download URL.");
							saveUserTextInfo(user, url)
						})
				})
		} else {
			saveUserTextInfo(user)
		}

	})
}

/**
 * Depending on how it was called saves the profile picture
 *  and additional information.
 * Or just saves text information and not the profile picture
 *  because no new profile picture was added.
 * This is done as there was a bug where if you saved your profile
 *  without uploading a profile picture the firebase would think you saved
 *  a profile picture and then displays a null photo.
 */
saveUserTextInfo = (user, url) => {
	nameOfUser = document.getElementById('nameInput').value;
	userCity = document.getElementById('cityInput').value;
	userName = document.getElementById("userName").value;

	
	db.collection("users").doc(user.uid).update({
			...{
				name: nameOfUser,
				city: userCity,
				userName: userName,
			},
			...(url) && {
				profilePic: url
			}
		})
		.then(function() {
			console.log('Saved use profile info');
			document.getElementById('personalInfoFields').disabled = true;
		})
}

/**
 * Displays only the users posts.
 * @param {*} collection Collection is the name of the collection in firebase.
 * @param {*} currentUser currentUser is whose information to display. Depending on whose profile page
 *      we are on.
 */
function displayCardsDynamically1(collection, currentUser) {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			user = currentUser;
			let cardTemplate = document.getElementById("itemCardTemplate");
			let where = db.collection(collection);


			db.collection("waste")
				.get()
				.then(querySnapshot => {
					querySnapshot.forEach(doc => {
						if (doc.data().userID.includes(user)) {
							let item = doc;
							let newcard = cardTemplate.content.cloneNode(true);
							populateItem(newcard, item, user);
						}
					})
				})
		}

	})
};

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
 * 
 * @param {*} id 
 * @param {*} num 
 * @returns 
 */
function progressBar(id, num) {
	const bars = ["info", "warning", "danger"];
	const MUL_FACTOR = 5;
	let achivementNum = 1;

	let ele = document.getElementById(id)
	let progress = ele.getElementsByClassName("progress-bar");
	let badge = ele.querySelectorAll("span.badge");

	for (let i = 0; i < progress.length; i++) {
		let percent = Math.round(num / achivementNum * 100);
		percent = (percent < 0) ? 0 : percent;
		percent = Math.min(percent, 100);

		progress[i].innerText = percent + "%";
		progress[i].setAttribute("class", progress[i].getAttribute("class") + "");
		progress[i].setAttribute("style", "width: " + percent + "%");

		if (percent >= 100) {
			let newAttr = badge[i].getAttribute("class").replace("secondary", bars[i]);
			badge[i].setAttribute("class", newAttr);
		} else {
			return;
		}
		achivementNum *= MUL_FACTOR;
	}
}

/**
 * 
 * @param {*} className 
 * @param {*} num 
 * @returns 
 */
function giveAchivement(className, num) {
	
	const MUL_FACTOR = 5;
	let achivementNum = 1;

	let trophies = document.querySelectorAll("div.trophy." + className + " img");

	for (let i = 0; i < trophies.length; i++) {
		let achievedGoal = num / achivementNum;
		achievedGoal = (achievedGoal < 0) ? 0 : achievedGoal;

		if (achievedGoal >= 1) {
			trophies[i].style.filter = "grayscale(0)";
			trophies[i].style.opacity = "1";
		} else {
			return;
		}

		achivementNum *= MUL_FACTOR;
	}
}

function goToDetail(id) {
	window.location.href = "../detailpage.html?id=" + id;
}

/**
 * Displays only the users posts.
 * @param {*} newcard the HTML tag of the template
 * @param {*} item The docID to display
 * @param {*} Caruser CurrentUser is the id of the poster.
 */
let populateItem = (newcard, item, Caruser) => {
	firebase.auth().onAuthStateChanged(user => {
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
			}
			likeInput.innerHTML = doc.data().totalLikes;
		});

		document.getElementById("items-go-here").appendChild(newcard);
	});
}

/**
 * Helper method that lets the populateItem method know which 
 * 	bin icon to use.
 * @param {*} bin The firebase bin icon field.
 * @returns the icon id.
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

let ImageFile; 
/**
 * Shows the users profile picture, and lets them upload a photo to then display it.
 */
function chooseFileListener() {
	const fileInput = document.getElementById("mypic-input"); 
	const image = document.getElementById("mypic-goes-here");

	fileInput.addEventListener('change', function(e) {

		
		ImageFile = e.target.files[0];
		let blob = URL.createObjectURL(ImageFile);

		
		image.src = blob; 
		image.style.borderRadius = '50%';
	})
}
chooseFileListener();
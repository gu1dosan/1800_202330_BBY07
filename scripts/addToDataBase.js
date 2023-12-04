/**
 * ChooseFIleListener lets the user upload a profile picture and 
 * changes the displayed photo to whichever photo they uploaded.
 */
let ImageFile;
function chooseFileListener() {
	const fileInput = document.getElementById("garbagePhoto");
	const image = document.getElementById("mypic-goes-here");


	fileInput.addEventListener('change', function(e) {


		ImageFile = e.target.files[0];
		let blob = URL.createObjectURL(ImageFile);

		image.src = blob;
	})
}

chooseFileListener();


/**
 * Handles the process of adding an item to the database. It retrieves user input from the DOM,
 * checks for user authentication, and calls 'savePost' to save the data in the Firebase database.
 * Displays an alert if not all required fields are filled or if there's an error during the save process.
 */
function writeReview() {
	let garbageTitle = document.getElementById("title").value;
	let bin = document.getElementById("bin").value;
	let description = document.getElementById("description").value;
	let user = firebase.auth().currentUser;

	if (user) {
		try {
			savePost(user, garbageTitle, bin, description);
		} catch (error) {
			document.getElementById("add-submit-button").disabled = false
			alert("Not all required feilds were filled!");
		};
	}
}

/**
 * Redirects the user to the index (search) page.
 */
function goToIndex() {
	window.location.href = "../search.html";
}

/**
 * Saves a post to the Firebase database. It uploads the selected image to Firebase storage,
 * then adds a new document to the 'waste' collection in the database with the post details.
 * Redirects to a thank-you page upon successful completion.
 * 
 * @param {Object} user - The current authenticated user object.
 * @param {string} garbageTitle - Title of the garbage item.
 * @param {string} bin - The type of bin to be used for the garbage.
 * @param {string} description - Description of the garbage item.
 */
function savePost(user, garbageTitle, bin, description){
	if (user && description && bin && garbageTitle) {
		let storageRef = firebase.storage().ref(crypto.randomUUID());
		document.getElementById("add-submit-button").disabled = true

		storageRef.put(ImageFile, {
				contentType: ImageFile.type
			})
			.then(function() {
				storageRef.getDownloadURL().then(function(url) {
					db.collection("waste").add({
						userID: user.uid,
						title: garbageTitle,
						photo: url,
						bin: bin,
						description: description,
						whoLiked: "",
						totalLikes: 0,
						whoDisLiked: "",
						timestamp: firebase.firestore.FieldValue.serverTimestamp()
					}).then(() => {
						window.location.href = "thanks.html";
					})
					
				})
				
			})
	} else {
		document.getElementById("add-submit-button").disabled = false
		alert("Not all required feilds were filled!");
	}
}
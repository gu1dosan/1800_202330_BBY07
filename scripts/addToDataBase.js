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
 * writeReview lets the user add an item to the firebase database.
 */
function writeReview() {

	let garbageTitle = document.getElementById("title").value;
	let bin = document.getElementById("bin").value;
	let description = document.getElementById("description").value;
	let user = firebase.auth().currentUser;

	if (user) {
		try {
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
							}).catch((error) => {
								console.error("Error adding document: ", error);
							});
						}).catch(function(error) {
							console.error("Error getting download URL: ", error);
						});
					}).catch(function(error) {
						console.error("Error uploading to Cloud Storage: ", error);
					});
			} else {
				document.getElementById("add-submit-button").disabled = false
				alert("Not all required feilds were filled!");
			}

		} catch (error) {
			document.getElementById("add-submit-button").disabled = false
			alert("Not all required feilds were filled!");
		};
	}
}


function goToIndex() {
	window.location.href = "../search.html";
}
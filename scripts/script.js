/**
 * Simple redirect function to profile page that gets loaded into the footer.
 * It does not need an id like the detail goToProfile() because this will always
 * 	redirect to your own profile page. This case is handled in the profile page javascript.
 */
function goToProfile() {
	window.location.href = "../profile.html";
}

/**
 * Increments the dislike count for a specific document in the 'waste' collection of Firestore.
 * This function handles the transactional update of the dislike count and user's dislike status for the document.
 * It checks if the current user has already disliked or liked the document and updates the count accordingly.
 * If the user has already disliked the document, their dislike is removed (increasing the total likes count).
 * If the user has liked the document, their like is removed, and a dislike is added (decreasing the total likes count).
 * If the user has neither liked nor disliked, a new dislike is added (decreasing the total likes count).
 *
 * @param {string} id - The ID of the document in the Firestore 'waste' collection to be updated.
 * @returns {Promise} A promise that resolves when the transaction is complete or rejects if an error occurs.
 */
function incrementDisLike(id) {
	
	let newDisLikes = 0;
	let docID = id;
	let user = firebase.auth().currentUser;
	if (user) {
		const wasteDocRef = db.collection('waste').doc(docID);

		return db.runTransaction(transaction => {
			return transaction.get(wasteDocRef).then(wasteDoc => {
				if (!wasteDoc.exists) {
					throw new Error("Document does not exist!");
				}

				const whoDisLiked = wasteDoc.data().whoDisLiked || "";
				let whoLiked = wasteDoc.data().whoLiked || "";

				if (whoDisLiked.includes(user.uid)) {

					let newWhoDisLiked = whoDisLiked.split(',').filter(id => id !== user.uid).join(',');
        
					let totalLikes = wasteDoc.data().totalLikes;
					let newLikes = totalLikes + 1;

					transaction.update(wasteDocRef, {
						totalLikes: newLikes,
						whoDisLiked: newWhoDisLiked
					});

					return;
				} else if (whoLiked.includes(user.uid)) {

					let newWhoLiked = whoLiked.split(',').filter(id => id !== user.uid).join(',');


					let totalLikes = wasteDoc.data().totalLikes;
					newDisLikes++;

					transaction.update(wasteDocRef, {
						whoLiked: newWhoLiked
					});
				}

				const newWhoDisLiked = whoDisLiked ? `${whoDisLiked},${user.uid}` : user.uid;

				newDisLikes++;
				totalLikes = wasteDoc.data().totalLikes;
				newDisLikes = totalLikes - newDisLikes;
				transaction.update(wasteDocRef, {
					totalLikes: newDisLikes,
					whoDisLiked: newWhoDisLiked
				});

			});
		}).then(() => {

		}).catch(error => {
			console.error('Transaction failed: ', error);
		});
	} else {
	}
}


/**
 * Increments the like count for a specific document in Firestore.
 * This function handles the update of the like count and user's like status for the document.
 * It checks if the current user has already liked or disliked the document and updates the count accordingly.
 * If the user has already liked the document, their like is removed (decrementing the count).
 * If the user has disliked the document, their dislike is removed, and a like is added.
 * If the user has neither liked or disliked, a new like is added.
 *
 * @param {string} id - The ID of the document in the Firestore 'waste' collection to be updated.
 * @returns either returns due to an error or confirmation of the function.
 */
function incrementLike(id) {
	let newLikes = 0;
	let docID = id;
	let user = firebase.auth().currentUser;
	if (user) {
		const wasteDocRef = db.collection('waste').doc(docID);

		return db.runTransaction(transaction => {
			return transaction.get(wasteDocRef).then(wasteDoc => {
				if (!wasteDoc.exists) {
					throw new Error("Document does not exist!");
				}

				const whoLiked = wasteDoc.data().whoLiked;
				let whoDisLiked = wasteDoc.data().whoDisLiked;

				if (whoLiked.includes(user.uid)) {

					let newWhoLiked = whoLiked.split(',').filter(id => id !== user.uid).join(',');

					let totalLikes = wasteDoc.data().totalLikes;
					let newLikes = totalLikes - 1;

					transaction.update(wasteDocRef, {
						totalLikes: newLikes,
						whoLiked: newWhoLiked
					});

					return;
				} else if (whoDisLiked.includes(user.uid)) {

					let newWhoDisLiked = whoDisLiked.split(',').filter(id => id !== user.uid).join(',');

					let totalLikes = wasteDoc.data().totalLikes;
					newLikes++;

					transaction.update(wasteDocRef, {
						whoDisLiked: newWhoDisLiked
					});
				}

				const newWhoLiked = whoLiked ? `${whoLiked},${user.uid}` : user.uid;


				newLikes++;
				totalLikes = wasteDoc.data().totalLikes;
				newLikes = totalLikes + newLikes;
				transaction.update(wasteDocRef, {
					totalLikes: newLikes,
					whoLiked: newWhoLiked
				});
			});
		}).then(() => {
		}).catch(error => {
			console.error('Transaction failed: ', error);
		});
	} else {
	}
}
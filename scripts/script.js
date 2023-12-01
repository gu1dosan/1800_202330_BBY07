
function goToProfile() {
	window.location.href = "../profile.html";
}

/**
 * Increments the dislike field in firebase.
 * @param {*} id The id of the post that was disliked.
 * @returns either due to an error or as a confirmation of completion
 */
function incrementDisLike(id) {
	
	let newDisLikes = 0;
	let docID = id;
	let user = firebase.auth().currentUser;
	console.log(user);
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
		console.log('No user is signed in to dislike the post');
	}
}


/**
 * Increments the like field in firebase.
 * @param {*} id The id of the post that was liked.
 * @returns either due to an error or as a confirmation of completion.5
 */
function incrementLike(id) {
	let newLikes = 0;
	let docID = id;
	let user = firebase.auth().currentUser;
	console.log(user);
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
					console.log('User is removing their like from this post.');

					let newWhoLiked = whoLiked.split(',').filter(id => id !== user.uid).join(',');

					let totalLikes = wasteDoc.data().totalLikes;
					let newLikes = totalLikes - 1;

					transaction.update(wasteDocRef, {
						totalLikes: newLikes,
						whoLiked: newWhoLiked
					});

					return;
				} else if (whoDisLiked.includes(user.uid)) {
					console.log('User is removing their like and adding dislike from this post.');

					let newWhoDisLiked = whoDisLiked.split(',').filter(id => id !== user.uid).join(',');

					let totalLikes = wasteDoc.data().totalLikes;
					newLikes++;

					transaction.update(wasteDocRef, {
						whoDisLiked: newWhoDisLiked
					});
					console.log("updated 1");
				}

				const newWhoLiked = whoLiked ? `${whoLiked},${user.uid}` : user.uid;


				newLikes++;
				console.log("updated 2");
				totalLikes = wasteDoc.data().totalLikes;
				newLikes = totalLikes + newLikes;
				transaction.update(wasteDocRef, {
					totalLikes: newLikes,
					whoLiked: newWhoLiked
				});
			});
		}).then(() => {
			console.log('Like incremented successfully!');
		}).catch(error => {
			console.error('Transaction failed: ', error);
		});
	} else {
		console.log('No user is signed in to like the post');
	}
}
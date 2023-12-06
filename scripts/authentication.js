let ui = new firebaseui.auth.AuthUI(firebase.auth());

/**
 * Configures and initializes the Firebase Authentication UI.
 * This setup includes specifying the authentication flow, the UI callbacks, and the authentication providers.
 * - The `signInSuccessWithAuthResult` callback handles the user sign-in process. It checks if the user is new and adds their information to Firestore.
 * - The `uiShown` callback hides the loader once the UI is displayed.
 * The configuration also specifies the sign-in flow type ('popup'), success URL, and links to the terms of service and privacy policy.
 * 
 * Finally, this script starts the Firebase authentication UI in the specified container.
 */
let uiConfig = {
	callbacks: {
		signInSuccessWithAuthResult: function(authResult, redirectUrl) {

			let user = authResult.user;
			if (authResult.additionalUserInfo.isNewUser) {
				db.collection("users").doc(user.uid).set({
					name: user.displayName,
					email: user.email,
					city: "",
					likes: 0,
					numOfPost: 0,
					userName: user.displayName

				}).then(function() {
					console.log("New user added to firestore");
					window.location.assign("search.html");
				}).catch(function(error) {
					console.log("Error adding new user: " + error);
				});
			} else {
				return true;
			}
			return false;
		},
		uiShown: function() {

			document.getElementById('loader').style.display = 'none';
		}
	},

	signInFlow: 'popup',
	signInSuccessUrl: "search.html",
	signInOptions: [

		firebase.auth.EmailAuthProvider.PROVIDER_ID,

	],

	tosUrl: '<your-tos-url>',

	privacyPolicyUrl: '<your-privacy-policy-url>'
};

ui.start('#firebaseui-auth-container', uiConfig);
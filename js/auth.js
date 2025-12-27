const auth = firebase.auth();
const firestore = firebase.firestore();

async function login(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    state.user = userCredential.user;
    syncLocalData(); // Start syncing local data to Firestore
    return userCredential;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function signup(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    state.user = userCredential.user;
    // Create a default farm document in Firestore
    await firestore.collection('farms').doc(state.user.uid).set({
      name: 'My Farm',
      manager: '',
      location: '',
      currency: 'USD',
      livestock: state.livestock,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return userCredential;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

function logout() {
  return auth.signOut();
}

// Auth state observer
auth.onAuthStateChanged((user) => {
  state.user = user;
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

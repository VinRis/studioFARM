// Firebase Authentication Manager
class FarmAuth {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.authListeners = [];
        
        // Initialize only if Firebase is available
        if (typeof firebase !== 'undefined' && firebase.auth) {
            this.auth = firebase.auth();
            
            // Set up auth state listener
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.notifyAuthChange(user);
            });
        } else {
            console.warn('Firebase auth not available - running in offline mode');
        }
    }
    
    // ... rest of the class remains the same, but add this check to each method:
    
    async signIn(email, password) {
        if (!this.auth) {
            console.warn('Firebase auth not available');
            // For demo purposes, create a mock user
            this.currentUser = { email: email, uid: 'offline-user' };
            this.notifyAuthChange(this.currentUser);
            return this.currentUser;
        }
        
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }
    
    // ... update other methods similarly with the check
// Firebase Authentication Manager
class FarmAuth {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.authListeners = [];
    }

    init(firebaseAuth) {
        this.auth = firebaseAuth;
        
        // Set up auth state listener
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.notifyAuthChange(user);
        });
    }

    async signUp(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Create user profile in Firestore
            await this.createUserProfile(userCredential.user);
            
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async createUserProfile(user) {
        if (!window.firebase) return;
        
        const userProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            settings: {
                farmName: '',
                currency: 'KES',
                theme: 'light'
            }
        };

        try {
            await firebase.firestore().collection('users').doc(user.uid).set(userProfile);
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    async updateUserProfile(updates) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        try {
            // Update in Firebase Auth
            if (updates.displayName || updates.photoURL) {
                await this.currentUser.updateProfile({
                    displayName: updates.displayName,
                    photoURL: updates.photoURL
                });
            }

            // Update in Firestore
            if (window.firebase) {
                await firebase.firestore()
                    .collection('users')
                    .doc(this.currentUser.uid)
                    .update({
                        ...updates,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
            }

            return this.currentUser;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return true;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async updateEmail(newEmail) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        try {
            await this.currentUser.updateEmail(newEmail);
            
            // Update in Firestore
            if (window.firebase) {
                await firebase.firestore()
                    .collection('users')
                    .doc(this.currentUser.uid)
                    .update({
                        email: newEmail,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
            }

            return true;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async updatePassword(newPassword) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        try {
            await this.currentUser.updatePassword(newPassword);
            return true;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    onAuthStateChanged(callback) {
        this.authListeners.push(callback);
        
        // Immediately call with current state
        if (this.currentUser !== undefined) {
            callback(this.currentUser);
        }
        
        // Return unsubscribe function
        return () => {
            this.authListeners = this.authListeners.filter(cb => cb !== callback);
        };
    }

    notifyAuthChange(user) {
        this.authListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }

    handleAuthError(error) {
        let message = 'An error occurred during authentication';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email is already registered';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/operation-not-allowed':
                message = 'Email/password accounts are not enabled';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled';
                break;
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later';
                break;
            case 'auth/requires-recent-login':
                message = 'Please sign in again to perform this action';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Please check your connection';
                break;
            default:
                message = error.message || message;
        }
        
        return new Error(message);
    }

    async getUserProfile() {
        if (!this.currentUser || !window.firebase) {
            return null;
        }

        try {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();

            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    async updateUserSettings(settings) {
        if (!this.currentUser || !window.firebase) {
            throw new Error('No user logged in');
        }

        try {
            await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .update({
                    'settings': settings,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            return true;
        } catch (error) {
            console.error('Error updating user settings:', error);
            throw this.handleAuthError(error);
        }
    }

    async deleteAccount() {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        try {
            // Delete from Firestore first
            if (window.firebase) {
                await firebase.firestore()
                    .collection('users')
                    .doc(this.currentUser.uid)
                    .delete();
            }

            // Delete from Firebase Auth
            await this.currentUser.delete();

            return true;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Helper method to get auth token for API calls
    async getAuthToken() {
        if (!this.currentUser) {
            return null;
        }

        try {
            return await this.currentUser.getIdToken();
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    // Check if user has verified email
    isEmailVerified() {
        return this.currentUser ? this.currentUser.emailVerified : false;
    }

    // Send email verification
    async sendEmailVerification() {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        try {
            await this.currentUser.sendEmailVerification();
            return true;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }
}

// Create singleton instance
const auth = new FarmAuth();

// Initialize when firebase is available
if (typeof firebase !== 'undefined' && firebase.auth) {
    auth.init(firebase.auth());
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = auth;
}

import firebase from "firebase";

const initializeAuth = new Promise(resolve => {
  // this adds a hook for the initial auth-change event
  firebase.auth().onAuthStateChanged(user => {
    authService.setUser(user);
    resolve(user);
  });
});

const authService = {
  user: null,

  authenticated() {
    return initializeAuth.then(user => {
      return user && !user.isAnonymous;
    });
  },

  setUser(user) {
    this.user = user;
  }
};

export default authService;

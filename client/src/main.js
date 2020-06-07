import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import firebase from "firebase";
import vuetify from "./plugins/vuetify";
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import store from "./store";

firebase.initializeApp({
  apiKey: "AIzaSyA1aeOY8fPJ0IF6YdZLJijGdWUfaWioqsY",
  authDomain: "todo-bee37.firebaseapp.com",
  databaseURL: "https://todo-bee37.firebaseio.com",
  projectId: "todo-bee37",
  storageBucket: "todo-bee37.appspot.com",
  messagingSenderId: "393639047112",
  appId: "1:393639047112:web:985968e4ee26133d80dafd",
  measurementId: "G-JFTV8CWSPY"
});

Vue.config.productionTip = false;

let app = ''
/* eslint-disable */
const ignoreWarnMessage = 'The .native modifier for v-on is only valid on components but it was used on <div>.';
Vue.config.warnHandler = function (msg, vm, trace) {
  // `trace` is the component hierarchy trace
  if (msg === ignoreWarnMessage) {
    msg = null;
    vm = null;
    trace = null;
  }
}

firebase.auth().onAuthStateChanged((user) => {
  if (!app) {
    if (user) {
      store.user = user;
    }
    app = new Vue({
      router,
      vuetify,
      render: h => h(App)
    }).$mount("#app");
  }
})

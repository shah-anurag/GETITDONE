<template>
  <nav>
    <v-snackbar v-model="snackbar" :timeout="4000" top color="success">
      <span>Awesome! New task added!</span>
      <v-btn color="white" @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-app-bar color="deep-purple" dark app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-uppercase">
        <router-link :to="{name : 'Dashboard'}" class="white--text">
          <span class="font-weight-light">Getit</span>
          <span>Done</span>
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <div v-if="loggedin===true" class="mx-2">
        <v-avatar :key="user" color="purple accent-2" class="mr-4">
          <router-link :to="{name: 'Profile'}">
            <span class="white--text headline">{{getInitials}}</span>
          </router-link>
        </v-avatar>
        <v-btn outlined @click="signOut">
          <span>Sign Out</span>
          <v-icon right>exit_to_app</v-icon>
        </v-btn>
      </div>
    </v-app-bar>
    <v-navigation-drawer
      temporary
      app
      color="primary"
      v-model="drawer"
      dark
      class="deep-purple accent-4"
    >
      <v-col align="center" v-if="loggedin===true">
        <v-flex class="mt-5">
          <v-avatar size="100">
            <img :src="getAvatar" alt="Avatar" />
          </v-avatar>
          <p class="white--text subheading mt-2">{{user.displayName}}</p>
        </v-flex>
      </v-col>
      <v-list>
        <v-list-item v-for="item in items" :key="item.title" router :to="item.route">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import firebase from "firebase";
import store from "@/store";

export default {
  data() {
    return {
      drawer: false,
      snackbar: false,
      items: [
        { icon: "dashboard", title: "Dashboard", route: "/" },
        { icon: "date_range", title: "Calendar", route: "/calendar" },
        { icon: "account_box", title: "Account", route: "/profile" },
        { icon: "question_answer", title: "About", route: "/about" }
      ],
      loggedin: false,
      user: store.user
    };
  },
  methods: {
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          store.user = null;
          this.user = null;
          this.loggedin = false;
          this.$router.push({ name: "Login" });
        })
        .catch(err => {
          console.log("Error while signing out: ", err);
        });
    },
    isLoggedIn() {
      if (firebase.auth().currentUser) {
        this.loggedin = true;
        this.user = store.user;
      } else {
        this.loggedin = false;
      }
    }
  },
  watch: {},
  computed: {
    getInitials() {
      if(!this.user) return null;
      const name = this.user.displayName;
      if (name) {
        const nameArray = name.split(" ");
        let initials = "";
        nameArray.forEach(element => {
          if (element && element.length) {
            initials += element[0];
          }
        });
        return initials;
      } else {
        return "NA";
      }
    },
    getAvatar() {
      if(!this.user) return '';
      if (this.user.photoURL) return this.user.photoURL;
      return "/kakashi1.jpg";
    }
  },

  mounted() {
    this.isLoggedIn();
    this.$root.$on("Loggedin", () => {
      console.log("Navbar", this.isLoggedIn());
    });
    this.$root.$on("updatedProfile", user => {
      this.user = user;
    });
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
</style>
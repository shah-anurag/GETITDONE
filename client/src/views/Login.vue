<template>
  <div class="login">
    <v-container class="my-5">
      <v-alert v-if="error" type="error">{{error}}</v-alert>
      <v-card flat max-width="500px" class="mx-auto">
        <v-tabs
          v-model="tab"
          background-color="primary"
          class="elevation-0"
          centered
          grow
          dark
        >
          <v-tabs-slider></v-tabs-slider>
          <v-tab href="#login">Login</v-tab>
          <v-tab href="#signup">Signup</v-tab>
          <v-tab-item value="login">
            <v-card class="pa-5">
              <v-card-title>
                <h2>Login</h2>
              </v-card-title>
              <v-card-text>
                <v-form ref="login">
                  <v-text-field
                    v-model="email"
                    color="deep-purple accent-4"
                    :rules="emailRules"
                    label="E-mail"
                    prepend-icon="email"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    color="deep-purple accent-4"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min]"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-1"
                    label="Password"
                    prepend-icon="vpn_key"
                    counter
                    required
                    @click:append="show1 = !show1"
                  ></v-text-field>
                  <v-btn
                    color="success"
                    class="mr-4 mt-4"
                    :loading="loading_login"
                    @click="signin"
                  >Login</v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item value="signup">
            <v-card class="pa-5">
              <v-card-title>
                <h2>Signup</h2>
              </v-card-title>
              <v-card-text>
                <v-form ref="signup">
                  <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    color="deep-purple accent-4"
                    label="E-mail"
                    prepend-icon="email"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min]"
                    :type="show1 ? 'text' : 'password'"
                    color="deep-purple accent-4"
                    name="input-10-1"
                    label="Password"
                    prepend-icon="vpn_key"
                    counter
                    required
                    @click:append="show1 = !show1"
                  ></v-text-field>
                  <v-text-field
                    v-model="password_reenter"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min, password === password_reenter]"
                    :type="show1 ? 'text' : 'password'"
                    color="deep-purple accent-4"
                    name="input-10-1"
                    label="Reenter Password"
                    prepend-icon="vpn_key"
                    counter
                    required
                    @click:append="show1 = !show1"
                  ></v-text-field>
                  <v-btn
                    color="success"
                    class="mr-4 mt-4"
                    :loading="loading_signup"
                    @click="signup"
                  >Signup</v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-container>
  </div>
</template>

<script>
// import axios from "axios";
import firebase from "firebase";
import store from "@/store";

export default {
  data() {
    return {
      tab: null,
      show1: false,
      password: "",
      password_reenter: "",
      email: "",
      loading_login: false,
      loading_signup: false,
      error: "",
      rules: {
        required: value => !!value || "Required.",
        min: v => v.length >= 6 || "Min 6 characters"
      },
      emailRules: [
        v => !!v || "Required",
        v => /.+@.+\..+/.test(v) || "Invalid E-mail"
      ]
    };
  },
  methods: {
    reset() {
      this.error = "";
    },
    signin() {
      this.loading_login = true;
      if (this.$refs.login.validate()) {
        firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
          .then(res => {
            this.loading_login = false;
            store.user = res.user;
            this.$root.$emit("Loggedin", res.user);
            this.$router.replace({ name: "Dashboard" });
          })
          .catch(err => {
            console.log("Error", err);
            this.error = err.message;
            this.loading_login = false;
          });
      } else {
        this.loading_login = false;
      }
    },
    signup() {
      this.loading_signup = true;
      if (this.$refs.login.validate()) {
        firebase
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password)
          .then(res => {
            store.user = res.user;
            this.$root.$emit("Loggedin", res.user);
            this.$router.replace({ name: "Dashboard" });
          })
          .catch(error => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Signup error", errorCode, errorMessage);
          })
          .finally(() => {
            this.loading_signup = false;
          });
      } else {
        this.loading_signup = false;
      }
    }
  }
};
</script>

<style scoped>
a.v-tab:hover {
  text-decoration: none;
}
</style>

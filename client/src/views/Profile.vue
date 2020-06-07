<template>
  <v-container class="my-5">
    <v-snackbar top v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
      <v-btn dark text @click="snackbar.show = false">Close</v-btn>
    </v-snackbar>
    <v-card max-width="600" class="mx-auto my-4" :loading="loading">
      <v-img :src="getAvatar" height="200px"></v-img>
      <v-tabs
        v-model="tab"
        background-color="primary"
        class="elevation-2"
        centered
        grow
        dark
      >
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#progress">Progress</v-tab>
        <v-tab href="#profile">Profile</v-tab>
        <v-tab-item value="progress">
          <v-card-title>
            Rank:
            <span :class="color + '--text'" class="mx-2">{{ level }}</span>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-icon color="primary" dark v-on="on"
                    >mdi-help-circle-outline</v-icon
                  >
                </v-btn>
              </template>
              <span>Add and complete more tasks to climb up the rank!</span>
            </v-tooltip>
          </v-card-title>
          <v-row>
            <v-col xs="12" lg="4">
              <v-card-text class="mx-3">
                <v-row v-for="label in labels" :key="label.id" class="my-2">
                  <div>
                    <span class=".body-1 grey--text mr-2"
                      >{{ label.text }}:</span
                    >
                    <br />
                    {{ label.value }}
                    <span v-if="label.text !== 'Total Tasks'"
                      >({{
                        total ? ((label.value * 100) / total).toFixed(1) : 0
                      }}%)</span
                    >
                  </div>
                </v-row>
              </v-card-text>
            </v-col>
            <v-col xs="12" lg="8">
              <p class="text-center subtitle-1">Ranks</p>
              <v-timeline>
                <v-timeline-item
                  v-for="rank in ranks"
                  :key="rank.level"
                  :color="rank.color"
                  right
                >
                  <span slot="opposite" :class="rank.color + '--text'">{{
                    rank.level
                  }}</span>
                  <v-card class="elevation-2 mr-2" :color="rank.color">
                    <v-card-text class="black--text">
                      <ul
                        v-if="rank.tasklimit"
                        style="color:white; margin-left: -1em; margin-bottom: -0.5em;"
                      >
                        <li>Total Tasks > {{ rank.tasklimit }}</li>
                        <li>Completed Tasks > {{ rank.completed }}</li>
                      </ul>
                      <ul
                        v-else
                        style="color:white; margin-left: -1em; margin-bottom: -0.5em;"
                      >
                        <li>Total Tasks &lt; 10</li>
                        <li>Completed Tasks &lt; 50%</li>
                      </ul>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item value="profile">
          <v-card-title>My Profile</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="form.displayName"
              label="Display Name"
            ></v-text-field>
            <!-- <v-text-field v-model="form.lastName" label="Last Name"></v-text-field> -->
            <v-text-field
              v-model="form.phoneNumber"
              :rules="
                [
                  v =>
                    (v.length ? v[0] === '+' : true) ||
                    'Example phone number +911234567890',
                  v => v.length % 13 === 0
                ] || 'Should be empty or 13 characters long'
              "
              label="Phone Number"
            ></v-text-field>
            <v-text-field
              v-model="form.email"
              readonly
              label="Email Address"
            ></v-text-field>
            <v-text-field
              v-model="form.photoURL"
              label="Photo Url"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" :loading="update_loading" @click="update">
              <v-icon left dark>check</v-icon>Save Changes
            </v-btn>
          </v-card-actions>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import store from "@/store";
import firebase from "firebase";

const client = axios.create({
  baseURL: "/",
  json: true
});

export default {
  pageTitle: "My Profile",
  components: {},
  data() {
    return {
      loading: false,
      form: store.user,
      showAvatarPicker: false,
      update_loading: false,
      snackbar: {
        show: false,
        message: "",
        color: "success"
      },
      labels: [
        { text: "Total Tasks", value: 0 },
        { text: "New Tasks", value: 0 },
        { text: "Ongoing Tasks", value: 0 },
        { text: "Completed Tasks", value: 0 },
        { text: "Overdue Tasks", value: 0 }
      ],
      ranks: [
        {
          level: "GrandMaster",
          color: "red",
          tasklimit: 40,
          completed: "80%"
        },
        { level: "Master", color: "orange", tasklimit: 30, completed: "70%" },
        { level: "Pro", color: "blue", tasklimit: 20, completed: "60%" },
        { level: "Expert", color: "cyan", tasklimit: 10, completed: "50%" },
        { level: "Newbie", color: "grey", tasklimit: null, completed: null }
      ],
      total: 0,
      tasks: [],
      level: "",
      color: "grey"
    };
  },
  methods: {
    openAvatarPicker() {
      this.showAvatarPicker = true;
    },
    selectAvatar(avatar) {
      this.form.avatar = avatar;
    },
    getUserInfo() {
      const user = {
        displayName: this.form.displayName,
        phoneNumber: this.form.phoneNumber,
        email: this.form.email,
        photoURL: this.form.photoURL
      };
      return user;
    },
    setsnackBar(show, message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = show;
    },
    update() {
      this.update_loading = true;
      const user = this.getUserInfo();
      if (firebase.auth().currentUser) {
        firebase
          .auth()
          .currentUser.getIdToken(true)
          .then(idToken => {
            client({
              method: "put",
              url: "/user",
              headers: {
                AuthToken: idToken
              },
              data: user
            })
              .then(() => {
                this.update_loading = false;
                this.setsnackBar(true, "Sucessfully Updated", "success");
                this.$root.$emit("updatedProfile", store.user);
              })
              .catch(err => {
                this.setsnackBar(true, "Some error Occurred", "error");
                console.log("Error", err);
              })
              .finally(() => {
                this.update_loading = false;
              });
          })
          .catch(() => {
            this.$router.push({ name: "Login" });
            this.update_loading = false;
          });
      }
    },
    getData() {
      if (store.tasks) {
        this.tasks = store.tasks;
        this.updateProgress();
      } else {
        this.loading = true;
        const user = firebase.auth().currentUser;
        if (user) {
          user
            .getIdToken(true)
            .then(idToken => {
              client({
                method: "get",
                url: "/tasks",
                headers: {
                  AuthToken: idToken
                }
              })
                .then(res => {
                  res.data.forEach((element, index) => {
                    res.data[index].show = false;
                    res.data[index].load_delete = false;
                  });
                  store.tasks = res.data;
                  this.tasks = store.tasks;
                  this.updateProgress();
                })
                .catch(error => {
                  console.log("Error while loading data: ", error);
                })
                .finally(() => {
                  this.loading = false;
                });
            })
            .catch(error => {
              console.log("Error getting auth token " + error.message);
              this.loading = false;
            });
        } else {
          this.loading = false;
          console.log("user is not logged in");
        }
      }
    },
    updateProgress() {
      let _total = 0,
        _new = 0,
        _complete = 0,
        _ongoing = 0,
        _overdue = 0;

      for (const index in this.tasks) {
        const status = this.tasks[index].status;
        _total += 1;
        if (status.toLowerCase() === "complete") {
          _complete += 1;
        } else if (status.toLowerCase() === "ongoing") {
          _ongoing += 1;
        } else if (status.toLowerCase() === "overdue") {
          _overdue += 1;
        } else if (status.toLowerCase() === "new") {
          _new += 1;
        }
      }
      this.labels[0].value = _total;
      this.labels[1].value = _new;
      this.labels[2].value = _ongoing;
      this.labels[3].value = _complete;
      this.labels[4].value = _overdue;
      this.total = _total;
      this.getLevel(_total, _complete);
    },
    getLevel(_total, _complete) {
      if (_total <= 10 || _complete * 100 <= _total * 50) {
        this.level = "Newbie";
        this.color = "grey";
      } else if (_total <= 20 || _complete * 100 <= _total * 60) {
        this.level = "Expert";
        this.color = "cyan";
      } else if (_total <= 30 || _complete * 100 <= _total * 70) {
        this.level = "Pro";
        this.color = "blue";
      } else if (_total <= 40 || _complete * 100 <= _total * 80) {
        this.level = "Master";
        this.color = "orange";
      } else {
        this.level = "GrandMaster";
        this.color = "red";
      }
    }
  },
  computed: {
    getAvatar() {
      if (!this.form) return "";
      if (this.form.photoURL) return this.form.photoURL;
      return "/kakashi1.jpg";
    }
  },
  mounted() {
    this.$root.$on("Loggedin", () => {
      this.user = store.user;
    });
    this.getData();
  }
};
</script>

<style scoped>
a.v-tab:hover {
  text-decoration: none;
}
</style>

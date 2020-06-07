<template>
  <v-dialog max-width="600px" v-model="dialog">
    <template v-slot:activator="{ on }">
      <v-btn color="primary" rounded small dark v-on="on">
        <v-icon dark small left>mdi-plus</v-icon>Create New Task
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <h2>Create New Task</h2>
      </v-card-title>
      <v-card-text>
        <v-form class="px-3" ref="form">
          <v-text-field
            v-model="title"
            :rules="inputRules"
            color="deep-purple"
            label="Title"
            prepend-icon="folder"
          ></v-text-field>

          <v-textarea
            v-model="description"
            auto-grow
            color="deep-purple"
            label="Description"
            prepend-icon="edit"
          ></v-textarea>

          <v-select
            :items="labels"
            v-model="label"
            label="Label"
            dense
            class="my-3"
            prepend-icon="mdi-label"
          ></v-select>

          <v-select
            :items="status_list"
            v-model="status"
            label="Status"
            dense
            class="my-3"
            prepend-icon="mdi-tag"
          ></v-select>

          <v-menu v-model="menu_create_date" :close-on-content-click="false">
            <template v-slot:activator="{ on }">
              <v-text-field
                v-on="on"
                :value="formattedDate(create_date)"
                :rules="[v => v.length > 0 || 'Start date is required']"
                readonly
                label="Start date"
                prepend-icon="date_range"
                color="deep-purple"
                :close-on-content-click="false"
                @click="create_date = null"
              ></v-text-field>
            </template>
            <v-date-picker v-model="create_date" scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu_create_date = false"
                >Ok</v-btn
              >
            </v-date-picker>
          </v-menu>

          <v-menu v-model="menu_due_date" :close-on-content-click="false">
            <template v-slot:activator="{ on }">
              <v-text-field
                v-on="on"
                :value="formattedDate(due_date)"
                :rules="[v => v.length > 0 || 'Due date is required']"
                readonly
                label="Due date"
                prepend-icon="date_range"
                color="deep-purple"
                :close-on-content-click="false"
                @click="due_date = null"
              ></v-text-field>
            </template>
            <v-date-picker v-model="due_date" scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu_due_date = false"
                >Ok</v-btn
              >
            </v-date-picker>
          </v-menu>

          <v-spacer></v-spacer>

          <v-btn @click="submit" class="success mr-4 mt-3" :loading="loading"
            >Add Task</v-btn
          >
          <!-- <v-spacer /> -->
          <v-btn right @click="dialog = false" class="primary mx-0 mt-3"
            >Cancel</v-btn
          >
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { format, parseISO } from "date-fns";
import firebase from "firebase";

const client = axios.create({
  baseURL: "/",
  json: true
});

export default {
  data() {
    return {
      title: "",
      description: "",
      label: "Personal",
      status: "New",
      due_date: null,
      create_date: null,
      menu_due_date: false,
      menu_create_date: false,
      loading: false,
      dialog: false,
      labels: ["Personal", "Work", "Shopping", "Others"],
      status_list: ["New", "Ongoing", "Complete", "Overdue"],
      inputRules: [v => v.length >= 3 || "Minimum length is 3 letters"]
    };
  },
  methods: {
    reset() {
      this.loading = false;
      this.title = "";
      this.description = "";
      this.due_date = null;
      this.create_date = null;
      this.label = "Personal";
      this.status = "New";
      this.dialog = false;
    },
    getTask() {
      return {
        title: this.title,
        description: this.description,
        due_date: this.due_date,
        create_date: this.create_date,
        label: this.label,
        status: this.status
      };
    },
    postData() {
      let task = this.getTask();
      this.loading = true;
      const user = firebase.auth().currentUser;
      if (user) {
        user
          .getIdToken(true)
          .then(idToken => {
            client({
              method: "post",
              url: "/tasks",
              headers: {
                AuthToken: idToken
              },
              data: task
            })
              .then(res => {
                res.data.show = false;
                res.data.load_delete = false;
                this.$emit("addTask", res.data);
                this.reset();
              })
              .catch(error => {
                console.log(error);
              })
              .finally(() => {});
          })
          .catch(error => {
            console.log("Error getting auth token " + error.message);
          });
      } else {
        console.log("Not logged in!");
      }
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.postData(); // due_date is string e.g. 2020-05-28 'string'
      }
    },
    formattedDate(date) {
      const formatted_date = date ? format(parseISO(date), "do MMM yyyy") : "";
      return formatted_date;
    }
  },
  computed: {}
};
</script>

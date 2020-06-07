<template>
  <v-container>
    <v-row class="fill-height">
      <v-col>
        <v-sheet height="64">
          <v-toolbar flat color="white">
            <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">Today</v-btn>
            <v-btn fab text small color="grey darken-2" @click="prev">
              <v-icon small>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="next">
              <v-icon small>mdi-chevron-right</v-icon>
            </v-btn>
            <v-toolbar-title>{{ title }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <div class="filter mx-2">
              <v-menu v-model="filter_menu" :close-on-content-click="false" offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn small color="primary" rounded dark v-on="on">
                    <v-icon small left>mdi-filter</v-icon>Filter
                  </v-btn>
                </template>
                <v-card class="mx-auto" max-width="500">
                  <v-toolbar dense flat color="deep-purple accent-4" dark>
                    <v-btn icon @click="filter_menu = false">
                      <v-icon small>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title small>Filter</v-toolbar-title>
                  </v-toolbar>
                  <span v-for="filter in filters" :key="filter.name">
                    <div v-if="filter.name !== 'due_date' && filter.name !== 'create_date'">
                      <v-card-text dense>
                        <h2 class="title" small capitalize>{{filter.text}}</h2>
                        <v-chip-group
                          v-model="filter.chosen"
                          column
                          multiple
                          active-class="primary--text"
                          dense
                        >
                          <v-chip
                            filter
                            outlined
                            v-for="(value, i) in filter.values"
                            :key="i"
                          >{{value}}</v-chip>
                        </v-chip-group>
                      </v-card-text>
                    </div>
                    <div v-else>
                      <v-card-text dense>
                        <h2 class="title" small capitalize>{{filter.text}}</h2>
                      </v-card-text>
                      <div class="mx-3">
                        <v-menu
                          ref="menu"
                          :close-on-content-click="true"
                          transition="scale-transition"
                          offset-y
                          max-width="290px"
                          min-width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="filter.dates[0]"
                              label="From"
                              prepend-icon="event"
                              readonly
                              clearable
                              v-on="on"
                              dense
                              @click:clear="filter.dates[0] = null"
                            ></v-text-field>
                          </template>
                          <v-date-picker color="primary" v-model="filter.dates[0]"></v-date-picker>
                        </v-menu>
                        <v-menu
                          ref="menu"
                          :close-on-content-click="true"
                          transition="scale-transition"
                          offset-y
                          max-width="290px"
                          min-width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="filter.dates[1]"
                              label="To"
                              prepend-icon="event"
                              readonly
                              clearable
                              dense
                              v-on="on"
                              @click:clear="filter.dates[1] = null"
                            ></v-text-field>
                          </template>
                          <v-date-picker color="primary" v-model="filter.dates[1]"></v-date-picker>
                        </v-menu>
                      </div>
                    </div>
                  </span>
                </v-card>
              </v-menu>
            </div>
            <v-menu bottom right>
              <template v-slot:activator="{ on }">
                <v-btn outlined color="grey darken-2" v-on="on">
                  <span>{{ typeToLabel[type] }}</span>
                  <v-icon right>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="type = 'day'">
                  <v-list-item-title>Day</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'week'">
                  <v-list-item-title>Week</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'month'">
                  <v-list-item-title>Month</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = '4day'">
                  <v-list-item-title>4 days</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-progress-linear
              :active="loading"
              :indeterminate="loading"
              absolute
              bottom
              color="deep-purple accent-4"
            ></v-progress-linear>
          </v-toolbar>
        </v-sheet>
        <v-sheet height="600">
          <v-calendar
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="getEvents"
            :event-color="getEventColor"
            :now="today"
            :type="type"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            @change="updateRange"
          ></v-calendar>
          <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
            offset-x
          >
            <v-card color="grey lighten-4" max-width="500px" flat>
              <v-toolbar :color="getEventColor(selectedEvent)" dark>
                <EditTask
                  :item="selectedEvent"
                  @edittedData="editTask(selectedEvent, ...arguments)"
                ></EditTask>
                <v-btn icon :loading="selectedEvent.load_delete" @click="deleteTask(selectedEvent)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-row class="mb-2 mx-2">
                  <div>
                    <v-chip
                      small
                      dark
                      :color="getEventColor(selectedEvent)"
                      class="mr-2"
                    >{{getStatus(selectedEvent)}}</v-chip>
                    <v-chip
                      small
                      dark
                      :color="getEventColor(selectedEvent)"
                      class="mr-2"
                    >{{getLabel(selectedEvent)}}</v-chip>
                  </div>
                </v-row>
                <v-row class="mx-2">
                  <span v-html="getDescription(selectedEvent)"></span>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn text color="secondary" @click="selectedOpen = false">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from "firebase";
import axios from "axios";
import EditTask from "./EditTaskPopUp";
import store from "@/store";

const client = axios.create({
  baseURL: "/",
  json: true
});

export default {
  components: {
    EditTask
  },
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    focus: new Date().toISOString().substr(0, 10),
    type: "week",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days"
    },
    // tasks: [],
    details: null,
    start: null,
    end: null,
    colors: {
      Complete: "#4caf50",
      Ongoing: "orange",
      Overdue: "red",
      New: "#1976d2"
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    filters: [
      {
        name: "label",
        text: "Label",
        values: ["Personal", "Work", "Shopping", "Others"],
        chosen: [0, 1, 2, 3]
      },
      {
        name: "status",
        text: "Status",
        values: ["New", "Ongoing", "Complete", "Overdue"],
        chosen: [0, 1, 2, 3]
      },
      { name: "create_date", text: "Create Date", dates: [null, null] },
      { name: "due_date", text: "Due Date", dates: [null, null] }
    ],
    filter_menu: false,
    loading: false
  }),
  mounted() {
    this.getData();
    this.$refs.calendar.checkChange();
  },
  methods: {
    getData() {
      
      if (store.tasks) {
        this.events = store.tasks;
        this.events.forEach(event => {
          event["name"] = event["title"];
          event["start"] = event["create_date"];
          event["end"] = event["due_date"];
        });
        return;
      }
      
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
                let events = [];
                res.data.forEach(element => {
                  let event = element;
                  event["name"] = event["title"];
                  event["start"] = event["create_date"];
                  event["end"] = event["due_date"];
                  events.push(event);
                });
                store.tasks = events;
                this.events = events;
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
    },
    editTask(task, updtask) {
      for (const property in updtask) {
        task[property] = updtask[property];
      }
      if (updtask["title"]) {
        task["name"] = updtask["title"];
      }
      if (updtask["create_date"]) {
        task["start"] = updtask["create_date"];
      }
      if (updtask["due_date"]) {
        task["end"] = updtask["due_date"];
      }
    },
    deleteTask(task) {
      const user = firebase.auth().currentUser;
      if (!user) {
        this.$router.push({ name: "Login" });
        return;
      }
      task.load_delete = true;
      user
        .getIdToken(true)
        .then(idToken => {
          client({
            method: "delete",
            url: "/tasks/" + task.id,
            headers: {
              AuthToken: idToken
            }
          })
            .then(() => {
              this.events.splice(this.events.indexOf(task), 1);
              this.selectedOpen = false;
            })
            .catch(error => {
              console.error("Error while deleting item", error.message);
            });
        })
        .catch(error => {
          console.error("Error getting auth token", error.message);
        })
        .finally(() => {
          task.load_delete = false;
        });
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return this.colors[event.status];
    },
    getDescription(event) {
      return event.description;
    },
    getStatus(event) {
      return event.status;
    },
    getLabel(event) {
      return event.label;
    },
    setToday() {
      this.focus = this.today;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        console.log("SelectedEvent", this.selectedEvent);
        console.log("SelectedElement", this.selectedElement);
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    updateRange({ start, end }) {
      this.start = start;
      this.end = end;
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    formatDate(a, withTime) {
      return withTime
        ? `${a.getFullYear()}-${a.getMonth() +
            1}-${a.getDate()} ${a.getHours()}:${a.getMinutes()}`
        : `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()}`;
    },
    checkLabel(label) {
      const filter_label = this.filters[0];
      const index = filter_label.values.indexOf(label);
      return filter_label.chosen.includes(index);
    },
    checkStatus(status) {
      const filter_status = this.filters[1];
      const index = filter_status.values.indexOf(status);
      return filter_status.chosen.includes(index);
    },
    checkCreateDate(create_date) {
      const filter_date = this.filters[2];
      if (filter_date.dates) {
        const from_date = filter_date.dates[0];
        const to_date = filter_date.dates[1];
        if (from_date && to_date)
          return from_date <= create_date && create_date <= to_date;
        else if (from_date) return from_date <= create_date;
        else if (to_date) return create_date <= to_date;
      }
      return true;
    },
    checkDueDate(due_date) {
      const filter_date = this.filters[3];
      if (filter_date.dates) {
        const from_date = filter_date.dates[0];
        const to_date = filter_date.dates[1];
        if (from_date && to_date)
          return from_date <= due_date && due_date <= to_date;
        else if (from_date) return from_date <= due_date;
        else if (to_date) return due_date <= to_date;
      }
      return true;
    }
  },
  computed: {
    title() {
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }

      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);
      const suffixMonth = startMonth === endMonth ? "" : endMonth;

      const startYear = start.year;
      const endYear = end.year;
      const suffixYear = startYear === endYear ? "" : endYear;

      const startDay = start.day + this.nth(start.day);
      const endDay = end.day + this.nth(end.day);

      switch (this.type) {
        case "month":
          return `${startMonth} ${startYear}`;
        case "week":
        case "4day":
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`;
        case "day":
          return `${startMonth} ${startDay} ${startYear}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    },
    getEvents() {
      return this.events.filter(item => {
        if (
          this.checkLabel(item.label) &&
          this.checkStatus(item.status) &&
          this.checkCreateDate(item.create_date) &&
          this.checkDueDate(item.due_date)
        ) {
          return true;
        }
        return false;
      });
    }
  }
};
</script>
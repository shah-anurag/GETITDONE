<template>
  <div class="dashboard">
    <v-container class="my-5">
      <div class="my-3">
        <v-row>
          <span class="display-1 mx-2">Dashboard</span>
          <v-spacer />
          <v-btn-toggle v-model="view" color="primary" dense rounded mandatory>
            <v-btn small value="list">
              <v-icon small dark left>mdi-view-list</v-icon>List
            </v-btn>
            <v-btn small value="grid">
              <v-icon small dark left>mdi-view-grid</v-icon>Grid
            </v-btn>
          </v-btn-toggle>
        </v-row>
      </div>
      <div class="header">
        <v-row class="mb-3 pl-3">
          <Popup @addTask="addTask"></Popup>
          <v-spacer />
          <div class="search mx-2">
            <v-text-field
              v-model="searchtext"
              color="purple darken-2"
              clearable
              flat
              dense
              label="Search Task"
              hide-details="true"
              prepend-inner-icon="search"
              @click:clear="searchtext=''"
            ></v-text-field>
          </div>
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
        </v-row>
        <v-row class="mb-3 pl-3">
          <v-icon class="mr-2">sort</v-icon>
          <v-tooltip top v-for="option in sort_by_options" :key="option.id">
            <template v-slot:activator="{ on }">
              <v-btn
                small
                rounded
                color="grey lighten-4"
                @click="sortBy(option.prop)"
                class="mr-2"
                v-on="on"
              >
                <v-icon left small>{{option.icon}}</v-icon>
                <span class="caption text-lowercase">{{option.text}}</span>
                <v-icon
                  v-show="option.prop === sortby"
                  small
                  right
                >{{ sort_in_inc ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </template>
            <span>{{option.hint}}</span>
          </v-tooltip>
        </v-row>
      </div>
      <transition name="fade" mode="out-in">
        <div class="list" v-if="view==='list'" key="list">
          <v-skeleton-loader :loading="loading" transition="scale-transition" type="table-tbody">
            <v-card v-if="tasks.length === 0">
              <v-alert
                type="info"
              >You have no todo tasks. Click on 'Create new Task' for adding new tasks.</v-alert>
            </v-card>
            <draggable
              v-else
              v-bind="dragOptions"
              @start="drag=true"
              @end="drag=false"
              v-model="tasks"
            >
              <transition-group :name="!drag ? 'flip-list' : null">
                <v-card v-for="task in getTasks" :key="task.id" :class="`pa-2 task ${task.status}`">
                  <v-row wrap>
                    <v-col cols="12" xs="12" md="2" lg="2">
                      <div class="caption grey--text">Title</div>
                      <div>{{task.title}}</div>
                    </v-col>
                    <v-col xs="3" md="2" lg="2">
                      <div class="caption grey--text">Start date</div>
                      <div>{{ getDate(task.create_date) }}</div>
                    </v-col>
                    <v-col xs="3" md="2" lg="2">
                      <div class="caption grey--text">Due date</div>
                      <div>{{ getDate(task.due_date) }}</div>
                    </v-col>
                    <v-col xs="2" md="2" lg="2">
                      <div class="caption grey--text">Label</div>
                      <div class="text-capitalize">{{task.label}}</div>
                    </v-col>
                    <v-col xs="2" md="2" lg="2">
                      <div class="right">
                        <v-chip small :class="`${task.status} white--text caption my-2`">
                          {{task.status}}
                          <v-icon
                            dark
                            small
                            v-if="task.status.toLowerCase() === 'new'"
                            right
                          >mdi-star</v-icon>
                          <v-icon
                            dark
                            small
                            v-else-if="task.status.toLowerCase() === 'complete'"
                            right
                          >mdi-checkbox-marked-circle</v-icon>
                          <v-icon
                            dark
                            small
                            v-else-if="task.status.toLowerCase() === 'overdue'"
                            right
                          >mdi-exclamation</v-icon>
                          <v-icon
                            dark
                            small
                            v-else-if="task.status.toLowerCase() === 'ongoing'"
                            right
                          >mdi-checkbox-blank-circle-outline</v-icon>
                        </v-chip>
                      </div>
                    </v-col>
                    <v-col xs="1" md="1" lg="1">
                      <v-btn icon @click="task.show = !task.show">
                        <v-icon>{{ task.show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                      </v-btn>
                    </v-col>
                    <v-col xs="1" md="1" lg="1">
                      <EditTask :item="task" @edittedData="editTask(task, ...arguments)"></EditTask>
                      <v-btn icon :loading="task.load_delete" @click="deleteTask(task)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-expand-transition>
                    <div v-show="task.show">
                      <v-divider></v-divider>
                      <v-card-text>{{task.description}}</v-card-text>
                    </div>
                  </v-expand-transition>
                </v-card>
              </transition-group>
            </draggable>
          </v-skeleton-loader>
        </div>
        <div class="grid" v-else-if="view==='grid'" key="grid">
          <v-row no-gutters>
            <v-col v-for="label in labels" :key="label">
              <v-card class="py-2" outlined>
                <v-card-title>{{label}}</v-card-title>
                <v-card-text>
                  <draggable
                    v-bind="dragOptions"
                    @start="drag=true"
                    @end="drag=false"
                    v-model="tasks"
                  >
                    <transition-group :name="!drag ? 'flip-list' : null">
                      <div v-for="task in getTasks" :key="task.id">
                        <v-card :class="`pa-4 task ${task.status}`" v-if="task.status === label">
                          <v-row>
                            <div class="caption grey--text mr-2">Title:</div>
                            <div>{{task.title}}</div>
                          </v-row>
                          <v-row>
                            <div class="caption grey--text mr-2">Create date:</div>
                            <div>{{ getDate(task.create_date) }}</div>
                          </v-row>
                          <v-row>
                            <div class="caption grey--text mr-2">Due date:</div>
                            <div>{{ getDate(task.due_date) }}</div>
                          </v-row>
                          <v-row>
                            <div class="caption grey--text mr-2">Label:</div>
                            <div class="text-capitalize">{{task.label}}</div>
                          </v-row>
                          <v-row>
                            <v-btn icon @click="task.show = !task.show">
                              <v-icon>{{ task.show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                            </v-btn>
                            <v-spacer />
                            <EditTask :item="task" @edittedData="editTask(task, ...arguments)"></EditTask>
                            <v-btn icon :loading="task.load_delete" @click="deleteTask(task)">
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </v-row>
                          <v-expand-transition>
                            <div v-show="task.show">
                              <v-divider></v-divider>
                              <v-card-text>{{task.description}}</v-card-text>
                            </div>
                          </v-expand-transition>
                        </v-card>
                      </div>
                    </transition-group>
                  </draggable>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </transition>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import firebase from "firebase";
import store from "@/store";
import { format, parseISO } from "date-fns";
import Popup from "../components/Popup";
import EditTask from "../components/EditTaskPopUp";
import draggable from "vuedraggable";

/* eslint-disable */

const client = axios.create({
  baseURL: "/",
  json: true
});

export default {
  name: "Dashboard",
  components: {
    Popup,
    EditTask,
    draggable
  },
  data() {
    return {
      tasks: [],
      sort_by_options: [
        {
          prop: "title",
          icon: "sort_by_alpha",
          text: "Title",
          hint: "Sort by Title"
        },
        {
          prop: "create_date",
          icon: "calendar_today",
          text: "Start date",
          hint: "Sort by Created Date"
        },
        {
          prop: "due_date",
          icon: "calendar_today",
          text: "Due Date",
          hint: "Sort by Date"
        },
        {
          prop: "status",
          icon: "check_box",
          text: "Status",
          hint: "Sort by Status"
        },
        {
          prop: "label",
          icon: "label",
          text: "Label",
          hint: "Sort by Label"
        }
      ],
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
        { name: "create_date", text: "Start Date", dates: [null, null] },
        { name: "due_date", text: "Due Date", dates: [null, null] }
      ],
      labels: ["New", "Ongoing", "Overdue", "Complete"],
      filter_menu: false,
      loading: false,
      searchtext: "",
      sortby: "",
      sort_in_inc: true,
      view: "list",
      drag: false
    };
  },
  methods: {
    sortBy(prop) {
      if (this.sortby === prop) {
        if (this.sort_in_inc) {
          this.sort_in_inc = false;
          return this.tasks.sort((a, b) => (a[prop] > b[prop] ? -1 : 1));
        } else {
          this.sort_in_inc = true;
          return this.tasks.sort((a, b) => (a[prop] < b[prop] ? -1 : 1));
        }
      } else {
        this.sortby = prop;
        this.sort_in_inc = true;
        return this.tasks.sort((a, b) => (a[prop] < b[prop] ? -1 : 1));
      }
    },
    getDate(date) {
      date = date.slice(0, 10);
      const formatteddate = date ? format(parseISO(date), "do MMM yyyy") : "";
      return formatteddate;
    },
    addTask(task) {
      this.tasks.unshift(task);
    },
    getData() {
      if (store.tasks) {
        this.tasks = store.tasks;
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
                store.tasks = res.data;
                this.tasks = res.data;
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
    },
    similarity(data) {
      if (data.i1 == -1 || data.i2 == -1) {
        return 0;
      }
      if (data.dp[data.i1][data.i2] != -1) return data.dp[data.i1][data.i2];

      data.i1 = data.i1 - 1;
      let v1 = this.similarity(data); // i1-1, i2

      data.i2 = data.i2 - 1;
      let v2 = this.similarity(data); // i1-1, i2-1
      if (data.s1[data.i1 + 1] === data.s2[data.i2 + 1]) {
        v2 = v2 + 1;
      }

      data.i1 += 1; // i1, i2-1
      let v3 = this.similarity(data);

      data.i2 += 1; // i1, i2

      data.dp[data.i1][data.i2] = Math.max(v1, v2, v3);

      return data.dp[data.i1][data.i2];
    },
    advancedMatchSearchText(title) {
      const n1 = this.searchtext.length;
      const n2 = title.length;

      if (!n1) return true;

      let dp = new Array(n1);

      for (let i = 0; i < n1; i++) {
        dp[i] = new Array(n2);
      }

      for (let i = 0; i < n1; i++) {
        for (let j = 0; j < n2; j++) {
          dp[i][j] = -1;
        }
      }

      let data = {
        i1: n1 - 1,
        i2: n2 - 1,
        s1: this.searchtext.toLowerCase(),
        s2: title.toLowerCase(),
        dp: dp
      };

      const result = this.similarity(data);

      if (100 * result >= 70 * Math.min(n1, n2)) {
        return true;
      }
      return false;
    },
    matchesSearchText(title) {
      if (this.searchtext) {
        return (
          title.toLowerCase().indexOf(this.searchtext.toLowerCase()) !== -1
        );
      } else {
        return true;
      }
    },
    editTask(task, updtask) {
      for (const property in updtask) {
        task[property] = updtask[property];
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
            .then(res => {
              this.tasks.splice(this.tasks.indexOf(task), 1);
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
    move(evt) {
      const i1 = this.tasks.indexOf(
        evt.draggedContext.element,
        evt.draggedContext.index
      );
      const i2 = this.tasks.indexOf(
        evt.relatedContext.element,
        evt.relatedContext.index
      );
      return true;
    },
    onAdd(evt) {
      console.log("add", evt);
    },
    onRemove(evt) {
      console.log("Rem", evt);
    },
    onUpdate(evt) {
      console.log("Upd", evt);
    },
    OnUnchoose(evt) {
      console.log("Unc", evt);
    },
    onChange(evt) {
      console.log("chng", evt);
    }
  },
  computed: {
    getTasks() {
      return this.tasks.filter(item => {
        if (
          this.checkLabel(item.label) &&
          this.checkStatus(item.status) &&
          this.checkCreateDate(item.create_date) &&
          this.checkDueDate(item.due_date) &&
          this.matchesSearchText(item.title)
        ) {
          return true;
        }
        return false;
      });
    },
    dragOptions() {
      return {
        animation: 200,
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  mounted: function() {
    if (this.tasks.length === 0) {
      this.getData();
    }
  }
};
</script>


<style scoped>
.ghost {
  opacity: 0.5;
  background: #e0e0e0;
}

.task.Complete {
  border-left: 4px solid #4caf50;
}
.task.Ongoing {
  border-left: 4px solid orange;
}
.task.Overdue {
  border-left: 4px solid tomato;
}
.task.New {
  border-left: 4px solid #1976d2;
}
.v-chip.Complete {
  background: #4caf50;
}
.v-chip.Ongoing {
  background: orange;
}
.v-chip.Overdue {
  background: tomato;
}
.v-chip.New {
  background: #1976d2;
}

.flip-list-move {
  transition: transform 0.5s;
}
.flip-list-enter-active {
  transition: all 0.5s;
}
.flip-list-leave-active {
  transition: all 0.5s;
  position: absolute;
}
.flip-list-enter {
  opacity: 0;
  transform: translateX(30px);
}
.flip-list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
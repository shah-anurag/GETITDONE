import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "../views/Dashboard.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/profile",
    name: "Profile",
    component: () =>
      import(/* webpackChunkName: "profile" */ "../views/Profile.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/calendar",
    name: "CalendarView",
    component: () =>
      import(/* webpackChunkName: "calendar" */ "../views/CalendarView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue"),
    meta: { requiresUnAuth: true }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const user = store.user;
    if (user) {
      next();
    }
    else {
      next({
        path: "/login",
        query: { redirect: to.fullPath }
      });
    }
  }
  else {
    console.log("no auth meta tag defined");
    next();
  }
});


export default router;

import Vue from "vue";
import Router from "vue-router";
import mm from "./router/test.vue";
Vue.use(Router);
export default new Router({
  routes: [{
    path: "/test",
    name: "home",
    component: mm
  }]
})
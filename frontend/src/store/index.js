import Vue from "vue";
import Vuex from "vuex";

import { account } from "./account-module.js";
import { alert } from "./alert";
import { seminars } from "./seminars";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: { account, alert, seminars }
});

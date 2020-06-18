import { userService } from "../services";
import { router } from "../router";

const user = JSON.parse(localStorage.getItem("user"));
const state = user
  ? { status: { loggedIn: true }, user }
  : { status: {}, user: null };

const actions = {
  login({ dispatch, commit }, { username, password }) {
    console.log(username, password);
    commit("loginRequest", { username });

    userService.login(username, password).then(
      user => {
        commit("loginSuccess", user);
        //router.push("/");
      },
      error => {
        commit("loginFailure", error);
        dispatch("alert/error", error, { root: true });
      }
    );
  },
  enter2Fa({ dispatch, commit }, { token }) {
    console.log(token);
    userService.totp(token).then(
      user => {
        commit("_2faSuccess", user);
        router.push("/");
      },
      error => {
        commit("loginFailure", error);
        dispatch("alert/error", error, { root: true });
      }
    );
  },
  logout({ commit }) {
    userService.logout();
    commit("logout");
  },
  register({ dispatch, commit }, { username, password }) {
    commit("registerRequest", { username });

    userService.register(username, password).then(
      user => {
        commit("registerSuccess", user);
        //router.push("/login");
        setTimeout(() => {
          // display success message after route change completes
          dispatch("alert/success", "Registration successful", { root: true });
        });
      },
      error => {
        commit("registerFailure", error);
        dispatch("alert/error", error, { root: true });
      }
    );
  }
};

const mutations = {
  loginRequest(state, user) {
    state.status = { loggingIn: true };
    state.user = user;
  },
  loginSuccess(state, user) {
    state.status = { _2faNeeded: true };
    state.user = user;
  },
  _2faSuccess(state, user) {
    state.status = { loggedIn: true };
    state.user = user;
  },
  loginFailure(state) {
    state.status = {};
    state.user = null;
  },
  logout(state) {
    state.status = {};
    state.user = null;
  },
  registerRequest(state) {
    state.status = { registering: true };
  },
  registerSuccess(state, user) {
    state.status = { showInfos: true };
    state.user = user;
  },
  registerFailure(state) {
    state.status = {};
  }
};

export const account = {
  namespaced: true,
  state,
  actions,
  mutations
};

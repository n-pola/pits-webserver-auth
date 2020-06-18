import { userService } from "../services";

const state = {
  all: {}
};

const actions = {
  getAll({ commit }) {
    commit("getAllRequest");

    userService.getAll().then(
      seminars => commit("getAllSuccess", seminars),
      error => commit("getAllFailure", error)
    );
  }
};

const mutations = {
  getAllRequest(state) {
    state.all = { loading: true };
  },
  getAllSuccess(state, users) {
    state.all = { items: users };
  },
  getAllFailure(state, error) {
    state.all = { error };
  }
};

export const seminars = {
  namespaced: true,
  state,
  actions,
  mutations
};

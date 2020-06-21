import { userService } from "../services";

const state = {
  all: {},
  booking: {}
};

const actions = {
  getAll({ dispatch, commit }) {
    commit("getAllRequest");

    userService.getAll().then(
      seminars => commit("getAllSuccess", seminars),
      error => {
        commit("getAllFailure", error);
        dispatch("alert/error", error, { root: true });
      }
    );
  },
  bookSeminar({dispatch, commit}, {user, id, token}) {
    commit("bookSeminarRequest")
    userService.bookSeminar(id, token).then(
      seminar => {
        commit("bookSeminarSuccess");
        dispatch("account/addSeminar", {user, seminar}, {root: true});
        dispatch("alert/success", seminar.message, { root: true });
      },
      error => {
        commit("bookSeminarFailure", error)
      }
    )
  },
  bookSeminarModal({commit}) {
    commit("bookSeminarModal");
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
  },
  bookSeminarRequest(state) {
    state.booking = { loading: true, modal: true };
  },
  bookSeminarSuccess(state) {
    state.booking = { success: true, modal: false };
  },
  bookSeminarFailure(state, error) {
    state.booking = { failure: true, error, type: "alert-danger", modal: true };
  },
  bookSeminarModal(state) {
    let newState = !state.booking.modal
    state.booking = {modal: newState}
  }
};

export const seminars = {
  namespaced: true,
  state,
  actions,
  mutations
};

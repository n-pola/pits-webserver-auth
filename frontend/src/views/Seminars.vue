<template>
  <div>
    <h1>Hi {{ account.user.name }}!</h1>
    <h3>Aktuelle Seminare:</h3>
    <em v-if="seminars.loading">Loading users...</em>
    <span v-if="seminars.error" class="text-danger"
      >ERROR: {{ users.error }}</span
    >
    <div v-if="seminars.items">
      <b-card no-body v-for="seminar in seminars.items" :key="seminar._id">
        <b-card-body>
          <b-card-title>{{ seminar.title }}</b-card-title>
          <b-card-text>
            <p>{{ seminar.description }}</p></b-card-text
          >
          <span
            :id="`tooltip-target-` + seminar._id"
            class="d-inline-block"
            tabindex="0"
          >
            <b-button
              :disabled="account.user.seminars.includes(seminar._id)"
              href="#"
              variant="primary"
              :data-vue-id="seminar._id"
              @click="
                bookSeminarModal();
                seminarID = seminar._id;
              "
              >Buchen</b-button
            >
          </span>
          <b-tooltip
            v-if="account.user.seminars.includes(seminar._id)"
            :target="`tooltip-target-` + seminar._id"
            triggers="hover"
          >
            Seminar bereits gebucht!
          </b-tooltip>
        </b-card-body>
      </b-card>
    </div>
    <b-modal hide-footer v-model="booking.modal" title="Seminar buchen">
      <div v-if="booking.failure" :class="`alert ${booking.type}`">
        {{ booking.error }}
      </div>
      <form @submit.prevent="bookSeminarComponent">
        <div class="form-group">
          <label for="tan">Your tan</label>
          <input
            type="text"
            v-model="tan"
            name="tan"
            class="form-control"
            :class="{ 'is-invalid': submitted && !tan }"
          />
          <div v-show="submitted && !tan" class="invalid-feedback">
            Your tan is required
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary">
            Book
          </button>
        </div>
      </form>
    </b-modal>
    <b-button @click="logoutAction" variant="danger">Logout</b-button>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { router } from "../router";

export default {
  data() {
    return {
      seminarID: "",
      tan: "",
      bookModal: false,
      submitted: false
    };
  },
  computed: {
    ...mapState({
      account: state => state.account,
      seminars: state => state.seminars.all,
      booking: state => state.seminars.booking
    })
  },
  created() {
    this.getAll();
  },
  methods: {
    ...mapActions("seminars", ["getAll", "bookSeminar", "bookSeminarModal"]),
    ...mapActions("account", ["logout"]),
    logoutAction() {
      this.logout();
      router.push("/login");
    },
    bookSeminarComponent() {
      this.bookSeminar({
        user: this.account.user,
        id: this.seminarID,
        token: this.tan
      });
    }
  }
};
</script>

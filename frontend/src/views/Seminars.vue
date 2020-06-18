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
          <b-button href="#" variant="primary" :data-vue-id="seminar._id"
            >Buchen</b-button
          >
        </b-card-body>
      </b-card>
    </div>
    <b-button @click="logoutAction" variant="danger">Logout</b-button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { router } from '../router';

export default {
  computed: {
    ...mapState({
      account: (state) => state.account,
      seminars: (state) => state.seminars.all
    })
  },
  created() {
    this.getAllSeminars();
  },
  methods: {
    ...mapActions('seminars', {
      getAllSeminars: 'getAll'
    }),
    ...mapActions('account', ['logout']),
    logoutAction() {
      this.logout();
      router.push('/login');
    }
  }
};
</script>

<template>
  <div>
    <h1>Hi {{ account.user.name }}!</h1>
    <h3>Aktuelle Seminare:</h3>
    <em v-if="users.loading">Loading users...</em>
    <span v-if="users.error" class="text-danger">ERROR: {{ users.error }}</span>
    <div v-if="users.items">
      <b-card no-body v-for="user in users.items" :key="user._id">
        <b-card-body>
          <b-card-title>{{ user.title }}</b-card-title>
          <b-card-text>
            <p>{{ user.description }}</p></b-card-text
          >
          <b-button href="#" variant="primary" :data-vue-id="user._id"
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
      users: (state) => state.users.all
    })
  },
  created() {
    this.getAllUsers();
  },
  methods: {
    ...mapActions('users', {
      getAllUsers: 'getAll',
      deleteUser: 'delete'
    }),
    ...mapActions('account', ['logout']),
    logoutAction() {
      this.logout();
      router.push('/login');
    }
  }
};
</script>

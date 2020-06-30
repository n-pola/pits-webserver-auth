<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          type="text"
          v-model="newuser.username"
          name="username"
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label for="mail">E-Mail</label>
        <input
          type="email"
          v-model="newuser.eMail"
          name="mail"
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          v-model="newuser.password"
          name="password"
          class="form-control"
        />
      </div>
      <div class="form-group">
        <button class="btn btn-primary" :disabled="status.registering">
          Register
        </button>
        <img
          v-show="status.registering"
          src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
        />
        <router-link to="/login" class="btn btn-link">Cancel</router-link>
      </div>
    </form>
    <b-modal
      hide-footer
      v-model="status.showInfos"
      title="Your 2FA and Tan list"
    >
      <div v-if="failure2fa" :class="`alert alert-danger`">
        {{ totp.error }}
      </div>
      <img :src="totp.imageUrl" />
      <img
        @click="generate2Fa"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABcElEQVRIidXVz05TURAG8B8tUBPkAQgE3FpxKyGGhY9TQerCEJcseQEfCeMfCAFNXBIxCE9ANzXXxYy23NB6bxsXfMm5uTkzZ75z5nxzhvuOmQo+s9jMsYQCV3iPD/g1Kfk83mSwYsT4iS5adYM/wnEG+YJtPMZCjjZ20lbgc66pjC5u0DE+jY306eECK1UJZvCwxoZeJMmxuLP/go5IV3eUQxv7UxA0cIbz/L+FJj6ij2dTkOyIUzwvG94aSO8bHkxI8DRj7A5PtsUFDev7oGbgVVF0JwaFeIR38nOE6zSepPNqTZKD0iZ7ufm/6KZhvWbgP2gZFF6BvbLDVhpeTkhACKQvBNMsGxv4jlN3yKwG9pVSM4zX4hSdKQjGYlaUe0+Uf1Usqvb0Ix6sH0mybXy6Gulzo6T9f2ENn0S6vubidYPn+glepa0QMl+rQ0A0nF1cGt1wLsW9zY0KUiVvTWyIlrmcc1c4FHKcuGXeD/wGKsZhR67YO+oAAAAASUVORK5CYII="
      />
      <form @submit.prevent="handle2Fa">
        <div class="form-group">
          <label for="_2fa">Please Confirm your 2FA</label>
          <input
            type="text"
            v-model="totpToken"
            name="_2fa"
            class="form-control"
            :class="{ 'is-invalid': submitted2fa && !totpToken }"
          />
          <div v-show="submitted2fa && !totpToken" class="invalid-feedback">
            2FA Token is required
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary" :disabled="status.loggingIn">
            Login
          </button>
        </div>
      </form>
    </b-modal>
    <b-modal
      hide-footer
      v-model="status.showTan"
      v-if="user"
      title="Your Tan list"
    >
      <ul>
        <li v-for="otp in user.otpList" :key="otp.index">
          {{ otp }}
        </li>
      </ul>
      <b-button @click="goHome">Next</b-button>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import { router } from '../router';
const qrcode = require('qrcode');
const otp = require('otplib');

const { authenticator } = otp;

export default {
  data() {
    return {
      newuser: {
        username: '',
        password: '',
        eMail: ''
      },
      totp: {
        clientSecrent: '',
        imageUrl: ''
      },
      submitted: false,
      generateTOTP: false,
      totpToken: '',
      submitted2fa: false,
      failure2fa: false
    };
  },
  computed: {
    ...mapState('account', ['status', 'user'])
  },
  methods: {
    ...mapActions('account', ['register', 'register2Fa']),
    ...mapMutations('account', ['loginSuccess']),
    async handleSubmit() {
      this.submitted = true;
      await this.register(this.newuser);
      this.generate2Fa();
    },
    generate2Fa() {
      const service = 'Seminar PITS 2020';
      this.totp.clientSecrent = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(
        this.newuser.username,
        service,
        this.totp.clientSecrent
      );
      qrcode.toDataURL(otpauth, (err, imageUrl) => {
        if (err) {
          console.log('Error with QR');
          return;
        }
        this.totp.imageUrl = imageUrl;
      });
    },
    handle2Fa() {
      const isValid = authenticator.verify({
        token: this.totpToken,
        secret: this.totp.clientSecrent
      });
      if (isValid) {
        this.failure2fa = false;
        this.submitted2fa = true;
        this.register2Fa(this.totp);
      } else {
        this.totp.error = 'Falsches One Time Password!';
        this.failure2fa = true;
        this.submitted2fa = true;
      }
    },
    goHome() {
      router.push('/');
    }
  }
};
</script>

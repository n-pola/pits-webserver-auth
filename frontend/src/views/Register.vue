<template>
     <div>
      <div>
        <h2>Name</h2>
        <input type="text" v-model="username" />
      </div>

      <div>
        <h2>Password</h2>
        <input type="password" v-model="password" />
      </div>

      <div>
        <h2>Submit</h2>
        <input type="submit" value="Submit" v-on:click="submit" />
      </div>
    </div>
</template>
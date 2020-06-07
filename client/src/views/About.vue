<template>
  <div class="about">
    <v-container fill-height>
      <v-row>
        <v-col lg="7">
          <p class="text-center display-3 font-weight-bold" style="color: black;">
            Organise it all with
            <br />
            <span style="color: indigo;">GETITDONE</span>
          </p>
        </v-col>
        <v-col class="ml-2">
          <p class="display-1">What is <span style="color: indigo;">GETITDONE</span>?</p>
          <p class="subtitle-1">
            <span style="color: indigo;">GETITDONE</span> is an modern way of managing all your tasks. Free up your mental space and let us remember all your tasks.
          </p>
          <v-btn color="primary" large @click="getStarted">Get Started now! It's Free</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  methods: {
    getStarted() {
      this.$router.push({name: 'Dashboard'});
    }
  }
}
</script>

<style scoped>
.about {
  height: 100%;
  width: 100%;
  background-image: url("/download.png");

  /* Full height */
  height: 100%;

  /* Center and scale the image nicely */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
a.v-tab:hover {
  text-decoration: none;
}
</style>
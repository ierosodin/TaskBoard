<template>
  <v-app>
    <v-layout>
      <v-app-bar
        app
        class="bar-title">
        <v-toolbar-title>
          <div class="text-h4 d-flex pa-4 text-primary">
            Task Board
          </div>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn variant="text" icon="mdi-account" to="/login"></v-btn>
      </v-app-bar>
      <v-main
        style="min-height: 300px">
        <router-view/>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script lang="ts">
import {defineComponent} from "vue";

// import apex charts

export default defineComponent({
});

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Tinos:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Tilt+Warp&display=swap');
.v-application {
  font-family: Roboto, serif;
}
.div {
  font-family: Roboto, serif;
}
.bar-title {
  font-size: 100px !important;
  font-family: 'Tilt Warp', cursive;
}

</style>


<template>
  <v-app>
    <v-main>
      <TopMenuBar />
    </v-main>
    <router-view />
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import TopMenuBar from '@/components/TopMenuBar.vue';

export default Vue.extend({
  name: "App",
  components: {
    TopMenuBar,
  }
});
</script>

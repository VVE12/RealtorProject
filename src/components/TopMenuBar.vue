<template>
  <div>
    <v-app-bar app dark color="blue" dense>
      <v-app-bar-nav-icon
        class="d-sm-none"
        @click="menu = true"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Realtors</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-toolbar-items class="d-none d-sm-block">
        <v-btn text @click="toHome">Realtors</v-btn>
        <v-btn text @click="toDivision">Divisions</v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-navigation-drawer app dark fixed disable-resize-watcher v-model="menu" color="blue">
      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          @click="item.action"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ item.title }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

type bool = boolean;

@Component
export default class TopMenuBar extends Vue {
  private items: Array<object> = [
    { title: "Realtor List", icon: "$list", action: this.toHome },
    { title: "Edit Divisions", icon: "$edit", action: this.toDivision },
  ];
  private menu: bool = false;

  private toDivision() {
    if (this.$route.path !== "/edit") {
      this.$router.push("/edit");
    }
  }

  private toHome() {
    if (this.$route.path !== "/") {
      this.$router.push("/");
    }
  }
}
</script>
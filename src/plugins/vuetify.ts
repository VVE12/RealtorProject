import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        iconfont: 'mdi',
        values: {
          add: 'mdi-account-multiple-plus',
          list: 'mdi-account-group',
          home: 'mdi-home',
          edit: 'mdi-tooltip-edit',
          search: 'mdi-magnify',
          del: "mdi-delete",
          newdiv: "mdi-bookmark-plus",
          editItem: "mdi-pencil",
          deleteItem: "mdi-delete"
        },
    }
});

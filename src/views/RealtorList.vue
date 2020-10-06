<template>
  <v-app>
    <v-col align-self="center"
      cols="12"
      xs="12" sm="10" md="10" lg="10" xl="10"
    >
      <v-card>
        <v-data-table :headers="itemsHeaders" :items="items" :items-per-page="5"
          :search="search" sort-by="id" class="elevation-1">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Realtors</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-text-field v-model="search"
                append-icon="$search" label="Search"
                single-line hide-details
              ></v-text-field>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="blue" dark class="mb-2" v-bind="attrs" v-on="on">
                    New Realtor
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field v-model="editedItem.firstName"
                            label="First Name" :counter="24" 
                            :rules="nameRules" required></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field v-model="editedItem.lastName" 
                            label="Last Name" :counter="24"
                            :rules="nameRules" required></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-select v-model="editedItem.division"
                            :items="divisions" :rules="divisionRules"
                            label="Division" required></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-menu ref="menu" v-model="state"
                            :close-on-content-click="false"
                            transition="scale-transition" offset-y>
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="editedItem.date"
                                @blur="date = editedItem.date"
                                v-bind="attrs" v-on="on" label="Date"
                                prepend-icon="mdi-calendar"
                                color="blue lighten-1">
                              </v-text-field>
                            </template>
                            <v-date-picker v-model="editedItem.date"
                               no-title scrollable header-color="blue lighten-1"
                               color="blue lighten-1" @input="state = false" >
                            </v-date-picker>
                          </v-menu>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                  <v-card-title class="headline">
                    Are you sure you want to delete this item?
                    </v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)"> $editItem</v-icon>
            <v-icon small @click="deleteItem(item)"> $deleteItem </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { db } from "@/firebase/firebaseDb";
import { firestore } from "firebase";
import { Division } from '@/model/division';
import { Realtor } from "@/model/realtor";

type str = string;
type int = number;
type bool = boolean;

@Component
export default class RealtorList extends Vue {

  private itemsHeaders: Array<object> = [
    { text: "ID", value: "id", filterable: false},
    { text: "GUID", value: "guid", filterable: false},
    { text: "First Name", value: "firstName" },
    { text: "Last Name", value: "lastName" },
    { text: "Division", value: "division" },
    { text: "Registration Date", value: "date", filterable: false },
    { text: "Actions", value: "actions", filterable: false, sortable: false },
  ];
  private items: Array<Realtor> = [];
  private divisions: Array<Division> = [];
  private nameRules: Array<object> = [
    (v: string) => !!v || "Field is required",
    (v: string) =>
      (v && v.length <= 24) || "Input text must be less than 10 characters",
  ];
  private divisionRules: Array<object> = [(v: string) => !!v || "Field is required"];

  private dialog: bool = false;
  private dialogDelete: bool = false;
  private state: bool = false;

  private search: str = "";
  private editedIndex: int = -1;
  private counter: int = 0;

  private editedItem = {
    id: 0,
    guid: 0,
    firstName: "",
    lastName: "",
    division: "",
    date: "",
  };
  private defaultItem = {
    id: 0,
    guid: 0,
    firstName: "",
    lastName: "",
    division: "",
    date: "",
  };

  private get formTitle() {
    return this.editedIndex === -1 ? "New Realtor" : "Edit Realtor";
  }

  @Watch("dialog")
  private onDialogChanged(val: boolean) {
    val || this.close();
  }
  
  @Watch("dialog")
  private onDialogDeleteChanged(val: boolean) {
    val || this.closeDelete();
  }

  private created() {
    this.initialize();
  }

  private initialize() {
    db.collection("items").onSnapshot((spanshotChange) => {
      this.items = [];
      spanshotChange.forEach((doc) => {
        this.items.push(this.createRealtorData(doc));
      });
    });

    db.collection("divisions").onSnapshot((spanshotChange) => {
      this.divisions = [];
      spanshotChange.forEach((doc) => {
        this.divisions.push(doc.data().name);
      });
    });

    this.counter = this.updateItemsLenght();
  }

  private updateItemsLenght() {
    const spanshot = db.collection("items").get();
    spanshot.then((quary) => {
      this.counter = (quary.docs.map((x) => x.data().id) as number[]).length;
    });
    return this.counter;
  }

  private createRealtorData(snapshot: firestore.DocumentData) {
    const data = snapshot.data();
    return new Realtor(
      data.id,
      data.guid,
      data.firstName,
      data.lastName,
      data.division,
      this.convertDate(data.date)
    );
  }

  private editItem(item: Realtor) {
    this.editedIndex = this.items.indexOf(item);
    this.editedItem = Object.assign({}, item);
    this.dialog = true;
  }

  private deleteItem(item: Realtor) {
    this.editedIndex = this.items.indexOf(item);
    this.editedItem = Object.assign({}, item);
    this.dialogDelete = true;
  }

  private deleteItemConfirm() {
    this.items.splice(this.editedIndex, 1);
    this.counter--;
    this.deleteData(this.editedItem.guid);
    this.closeDelete();
  }

  private close() {
    this.dialog = false;
    this.$nextTick(() => {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    });
  }

  private closeDelete() {
    this.dialogDelete = false;
    this.$nextTick(() => {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    });
  }

  private save() {
    if (this.editedIndex > -1) {
      Object.assign(this.items[this.editedIndex], this.editedItem);
      this.updateData(this.items[this.editedIndex]);
    } else {
      this.counter++;
      this.items.push(
        new Realtor(
          this.counter,
          this.generateGuid(),
          this.editedItem.firstName,
          this.editedItem.lastName,
          this.editedItem.division,
          this.toDate(this.editedItem.date)
        )
      );
      this.createNewData();
    }
    this.close();
  }

  private updateData(item: Realtor) {
    db.collection("items")
      .where("guid", "==", item.guid)
      .get()
      .then((quarySnapshot) => {
        quarySnapshot.forEach((doc) => {
          db.collection("items")
            .doc(doc.id)
            .update({
              firstName: item.firstName,
              lastName: item.lastName,
              division: item.division,
              date: this.toDate(item.date),
            });
        });
      });
  }

  private createNewData() {
    const spanshot = db.collection("items").get();
    spanshot.then((quary) => {
      const num = (quary.docs.map((x) => x.data().id) as number[]).length;
      const col = db.collection("items").doc(this.generateNextDocId(num));
      col.set({
        id: this.items[this.items.length - 1].id,
        guid: this.items[this.items.length - 1].guid,
        firstName: this.items[this.items.length - 1].firstName,
        lastName: this.items[this.items.length - 1].lastName,
        division: this.items[this.items.length - 1].division,
        date: this.items[this.items.length - 1].date,
      });
    });
  }

  private deleteData(guid: number) {
    db.collection("items")
      .where("guid", "==", guid)
      .get()
      .then((quarySnapshot) => {
        quarySnapshot.forEach((doc) => {
          db.collection("items").doc(doc.id).delete();
        });
      });
  }

  private generateNextDocId(id: number) {
    return "item" + this.generateId(id);
  }

  private generateId(id: number) {
    return id + 1;
  }

  private generateGuid() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  private convertDate(date: string) {
    const [day, month, year] = date.split(".");
    return `${day}-${month}-${year}`;
  }
  
  private toDate(date: string) {
    const time = new Date(date).toLocaleString().substr(0, 10);
    const [year, month, day] = time.split(".");
    return `${day}.${month}.${year}`;
  }
}
</script>

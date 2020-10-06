<template>
  <v-app>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="mx-auto" max-width="430" tile>
          <v-app-bar color="blue" dark>
            <v-toolbar-title>
              <v-text-field
                dense
                v-model="division"
                placeholder="New Division Name"
                hide-details="auto"
              ></v-text-field>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="addItem"><v-icon>$newdiv</v-icon> </v-btn>
          </v-app-bar>

          <v-list dense>
            <v-subheader>DIVISIONS LIST</v-subheader>
            <v-list-item-group color="blue">
              <v-list-item v-for="item in items" :key="item.name">
                <v-list-item-content>
                  <v-list-item-title v-text="item.name"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-content>
                  <v-menu
                    ref="menu"
                    v-model="item.state"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                    max-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        dense
                        v-model="item.date"
                        @blur="date = item.date"
                        v-bind="attrs"
                        v-on="on"
                        label="Date"
                        prepend-icon="mdi-calendar"
                        color="blue"
                      >
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="item.selectedDate"
                      no-title
                      scrollable
                      header-color="blue"
                      color="blue"
                    >
                      <v-spacer></v-spacer>
                      <v-btn text color="blue" @click="item.state = false">
                        Cancel
                      </v-btn>
                      <v-btn text color="blue" @click="updateDate(item)">
                        OK
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-list-item-content>
                <v-list-item-icon>
                  <v-btn class="v-btn--icon" icon @click="deleteItem(item)">
                    <v-icon>$del</v-icon>
                  </v-btn>
                </v-list-item-icon>
              </v-list-item>
            </v-list-item-group>
            <v-divider></v-divider>
          </v-list>
          <v-row>
            <v-btn color="error" class="v-btn--spacer" @click="cancel">
              Cancel
            </v-btn>
            <v-spacer></v-spacer>

            <v-btn
              :disabled="!valid"
              color="success"
              @click="submit"
              class="v-btn--spacer"
            >
              Update
            </v-btn>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Division } from "@/model/division";
import { db } from "@/firebase/firebaseDb";
import { firestore } from "firebase";

type str = string;
type int = number;
type bool = boolean;

@Component
export default class EditDivision extends Vue {
  
  private division: str = "";
  private valid: bool = true;
  private state: bool = false;
  private lenght: int = 0;
  private date: str = this.convertDate(new Date().toString());

  private items: Array<Division> = [];
  private deleted: Array<number> = [];
  private added: Array<Division> = [];

  private created() {
    this.initialize();
  }

  private initialize(){
    db.collection("divisions").onSnapshot((spanshotChange) => {
      this.items = [];
      spanshotChange.forEach((doc) => {
        this.items.push(this.createDivisionData(doc));
      });
    });
    this.valid = false;
    this.updateDivisionLenght();
  }

  private createDivisionData(snapshot: firestore.DocumentData) {
    const data = snapshot.data();
    return new Division(
      data.id,
      data.name,
      data.date,
      this.state,
      this.convertDate(data.date)
    );
  }

  private submit() {
    this.addItems();
    this.updateItems();
    this.deleteItems();
  }
  
  private addItems() {
    if (typeof this.added !== "undefined" && this.added.length > 0) {
      this.added.forEach((data) => {
        db.collection("divisions").add({
          id: data.id,
          name: data.name,
          date: data.date,
        });
      });
      this.added = [];
    }
  }
  
  private updateItems() {
    this.items.forEach((item) => {
      db.collection("divisions")
        .where("id", "==", item.id)
        .get()
        .then((quarySnapshot) => {
          quarySnapshot.forEach((doc) => {
            db.collection("divisions").doc(doc.id).update({
              name: item.name,
              date: item.date,
            });
          });
        });
    });
  }
  
  private deleteItems() {
    if (typeof this.deleted !== "undefined" && this.deleted.length > 0) {
      this.deleted.forEach((id) => {
        db.collection("divisions")
          .where("id", "==", id)
          .get()
          .then((quarySnapshot) => {
            quarySnapshot.forEach((doc) => {
              db.collection("divisions").doc(doc.id).delete();
            });
          });
      });
      this.deleted = [];
    }
  }

  private cancel() {
    this.$router.push("/");
  }

  private addItem() {
    this.date = this.convertDate(new Date().toString());
    this.lenght++;
    const division = new Division(
      this.lenght,
      this.division,
      this.date,
      this.state,
      this.convertDate(this.date)
    );

    this.items.push(division);
    this.added.push(division);
    this.valid = true;
  }

  private deleteItem(item: Division) {
    this.valid = true;
    const index = this.items.indexOf(item);
    this.items.splice(index, 1);
    this.deleted.push(item.id);
    this.lenght--;
  }

  private updateDivisionLenght() {
    const spanshot = db.collection("divisions").get();
    spanshot.then((quary) => {
      this.lenght = (quary.docs.map((x) => x.data().id) as number[]).length;
    });
    return this.lenght;
  }
  
  private updateDate(item: Division) {
    item.date = this.convertDate(item.selectedDate);
    this.valid = true;
    item.state = false;
  }
  
  private convertDate(date: string) {
    const time = new Date(date).toLocaleString().substr(0, 10);
    const [year, month, day] = time.split(".");
    return `${day}-${month}-${year}`;
  }
  
  private toDate(date: string) {
    const time = new Date(date).toLocaleString().substr(0, 10);
    const [year, month, day] = time.split(".");
    return `${day}.${month}.${year}`;
  }
}
</script>

<style scoped>
.v-btn--icon {
  height: 24px;
  width: 24px;
}
.v-btn--spacer {
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 7px;
}
</style>
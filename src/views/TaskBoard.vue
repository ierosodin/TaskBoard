<template>
  <v-container class="flowchart">
    <v-row>
      <v-col class="v-col-4">
        <v-btn
          class="pa-4 ma-2"
          variant="outlined"
          size="lg"
          @click="addTrackDialog=true"
        >
          Add Track
        </v-btn>
        <v-btn
          class="pa-4 ma-2"
          variant="outlined"
          size="lg"
          @click="createNodeDialog=true;"
        >
          Create Car
        </v-btn>
        <v-btn
          class="pa-4 ma-2"
          variant="outlined"
          size="lg"
          @click="modifyUserDialog=true;"
        >
          Modify User
        </v-btn>
      </v-col>
      <v-col class="v-col-5">
          <div class="text-h5 d-flex pa-2 text-primary">
            Scale
          </div>
        <v-slider v-model="scene.scale" min=0.5 max=1.2 step=0.1>Scale</v-slider>
      </v-col>
      <v-col class="v-col-1">
      </v-col>
      <v-col class="v-col-2" justify="start" align="start">
        <v-form v-model="newPendingValid">
          <v-select
            v-model="selectPendingNode"
            :items="pendingNode"
            :item-title="item => item.title"
            label="Select Pending Car"
            density="comfortable"
            variant="outlined"
            :rules="requiredRules"
            return-object
            @input="newPendingValid = true"
          >
            <template v-slot:selection="{ item, index }">
              <div class="font-weight-black py-1" style="text-align: left">
                <span :style="{'text-align': 'center','vertical-align': 'middle'}">
                  {{ item.title }}
                </span>
              </div>
            </template>
            <template v-slot:item="{ item, props}">
              <v-card v-bind="props">
                <template v-slot:title>
                  {{ item.title }}
                </template>
              </v-card>
            </template>
          </v-select>
        </v-form>
        <v-btn
          variant="outlined"
          :disabled="!newPendingValid || pendingNode.length === 0 || selectPendingNode === null"
          @click="onAddPendingNode"
          color="#ff4010"
        >Add</v-btn>
      </v-col>
    </v-row>
  </v-container>
  <div>
    <flowchart :scene.sync="scene" 
      :stations.sync="stations"
      :priority.sync="priority"
      :pendingNode.sync="pendingNode"
      @updatePendingList="updatePendingList"
      @actionChange="actionChange"
      :height="1200"/>
  </div>
  <v-dialog
    v-model="createNodeDialog"
    width="auto"
    min-width="600px"
    :scrim="true"
    persistent
  >
    <v-card class="pa-2 rounded-b-lg"
            width="100%"
            height="100%"
            min-width="600px">
      <template v-slot:prepend>
        <v-icon size="large" icon=mdi-alert></v-icon>
      </template>
      <template v-slot:title>
        <div class="text-primary">Create Car</div>
      </template>
      <v-card-text>
        <v-container class="px-1 pt-2">
          <v-form v-model="newNodeValid">
            <v-select
              v-model="newNodeStation"
              :items="Object.values(stations)"
              :item-title="item => item.name"
              label="Please select a station"
              density="comfortable"
              variant="outlined"
              :rules="requiredRules"
              return-object
            >
              <template v-slot:selection="{ item, index }">
                <div class="font-weight-black py-1" style="text-align: left">
                  <span :style="{'text-align': 'center','vertical-align': 'middle'}">
                    {{ item.raw.name }}
                  </span>
                </div>
              </template>
              <template v-slot:item="{ item, props}">
                <v-card v-bind="props">
                  <template v-slot:title>
                    {{ item.raw.name }}
                  </template>
                </v-card>
              </template>
            </v-select>
            <v-select
              v-model="newNodeType"
              :items="nodeCategory"
              :item-title="item => item.name"
              label="Please select a node type"
              density="comfortable"
              variant="outlined"
              :rules="requiredRules"
              return-object
            >
              <template v-slot:selection="{ item, index }">
                <div class="font-weight-black py-1" style="text-align: left">
                  <span :style="{'text-align': 'center','vertical-align': 'middle'}">
                    {{ item.raw.name }}
                  </span>
                </div>
              </template>
              <template v-slot:item="{ item, props}">
                <v-card v-bind="props">
                  <template v-slot:prepend>
                    <v-icon size="small" :icon="item.raw.icon" :color="item.raw.iconColor"></v-icon>
                  </template>
                  <template v-slot:title>
                    {{ item.raw.name }}
                  </template>
                </v-card>
              </template>
            </v-select>
            <v-text-field
              v-model="newNodeTitle"
              label="Title"
              variant="outlined"
              :rules="titleRules"
              hide-details="auto"
            ></v-text-field>
            <br/>
            <v-textarea v-model="newNodeDetail" label="Detail" variant="outlined"></v-textarea>
          </v-form>
        </v-container>
      </v-card-text>
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" :disabled="!newNodeValid" @click="onCreateFormSubmit">Submit</v-btn>
        <v-btn variant="outlined" @click="onCreateFormReset">Cancel</v-btn>
      </template>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="addTrackDialog"
    width="auto"
    min-width="600px"
    :scrim="true"
    persistent
  >
    <v-card class="pa-2 rounded-b-lg"
            width="100%"
            height="100%"
            min-width="600px">
      <template v-slot:prepend>
        <v-icon size="large" icon=mdi-alert></v-icon>
      </template>
      <template v-slot:title>
        <div class="text-primary">Add Track</div>
      </template>
      <v-card-text>
        <v-container class="px-1 pt-2">
          <v-form v-model="newTrackValid">
            <v-select
              v-model="newTrackStation"
              :items="Object.values(stations)"
              :item-title="item => item.name"
              label="Please select a station"
              density="comfortable"
              variant="outlined"
              :rules="requiredRules"
              return-object
            >
              <template v-slot:selection="{ item, index }">
                <div class="font-weight-black py-1" style="text-align: left">
                  <span :style="{'text-align': 'center','vertical-align': 'middle'}">
                    {{ item.raw.name }}
                  </span>
                </div>
              </template>
              <template v-slot:item="{ item, props}">
                <v-card v-bind="props">
                  <template v-slot:title>
                    {{ item.raw.name }}
                  </template>
                </v-card>
              </template>
            </v-select>
          </v-form>
        </v-container>
      </v-card-text>
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" :disabled="!newTrackValid" @click="onCreateTrack">Submit</v-btn>
        <v-btn variant="outlined" @click="onCloseAddTrack">Cancel</v-btn>
      </template>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="modifyUserDialog"
    width="auto"
    min-width="600px"
    :scrim="true"
    persistent
  >
    <v-card class="pa-2 rounded-b-lg"
            width="100%"
            height="100%"
            min-width="600px">
      <template v-slot:prepend>
        <v-icon size="large" icon=mdi-alert></v-icon>
      </template>
      <template v-slot:title>
        <div class="text-primary">Modify User</div>
      </template>
      <v-card-text>
        <v-container class="px-1 pt-2">
          <v-form v-model="modifyUserValid">
            <v-select
              v-model="modifyUser"
              :items="scene.users.concat([{'id': -1, 'user_name': '+ New'}])"
              :item-title="item => item.user_name"
              label="Select a user or create a new one"
              density="comfortable"
              variant="outlined"
              :rules="requiredRules"
              return-object
            >
              <template v-slot:selection="{ item, index }">
                <div class="font-weight-black py-1" style="text-align: left">
                  <span :style="{'text-align': 'center','vertical-align': 'middle'}">
                    {{ item.raw.user_name }}
                  </span>
                </div>
              </template>
              <template v-slot:item="{ item, props}">
                <v-card v-bind="props">
                  <template v-slot:title>
                    {{ item.raw.user_name }}
                  </template>
                </v-card>
              </template>
            </v-select>
            <v-text-field
              v-model="modifyUserName"
              label="User Name"
              variant="outlined"
              :rules="userNameRules"
              hide-details="auto"
            ></v-text-field>
            <br/>
            <v-text-field
              v-model="modifyUserColor"
              label="Color"
              variant="outlined"
              :rules="userColorRules"
              hide-details="auto"
            ></v-text-field>
          </v-form>
        </v-container>
      </v-card-text>
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" :disabled="!modifyUserValid" @click="onModifyUserSubmit">Submit</v-btn>
        <v-btn variant="outlined" @click="onModifyUserReset">Cancel</v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useNotifications } from 'vue-browser-notifications'

import { getTracks, postTracks } from "@/utils/request";
import { getPending, postPending, deletePending } from "@/utils/request";
import { getPriority, patchPriority } from "@/utils/request";
import { getUsers, postUsers, patchUsers } from "@/utils/request";
import { getNotifyTime } from "@/utils/request";
/* eslint-disable */
import Flowchart from '../components/Flowchart.vue'

const { requestPermission, sendNotification } = useNotifications(true, { icon: 'src/assets/page_icon.png'})

export default defineComponent ({
  name: 'app',
  components: {
    Flowchart,
  },
  data() {
    return {
      createNodeDialog: false,
      addTrackDialog: false,
      modifyUserDialog: false,
      scene: {
        centerX: 150,
        centerY: 0,
        scale: 1,
        nodes: [],
        tracks: [],
        users: [
          {
            id: 0,
            user_name: "test",
            color: "#303040",
            originX: 500,
            originY: 200,
            moveX: 500,
            moveY: 200,
          }
        ]
      },
      newNodeType: null,
      newNodeStation: null,
      newNodeTitle: "",
      newNodeDetail: "",
      newNodeValid: false,
      requiredRules: [
        value => !!value || 'Required.',
      ],
      titleRules: [
        value => !!value || 'Required.',
        value => (value && value.length < 10) || 'Max 10 characters',
      ],
      userNameRules: [
        value => !!value || 'Required.',
        value => (value && value.length < 10) || 'Max 10 characters',
      ],
      userColorRules: [
        value => !!value || 'Required.',
        value => (value && value.length === 7) || '7 characters',
      ],
      nodeCategory: [
        {
          name: 'nodeType1',
          outButtons: [],
        },
        {
          name: 'nodeType2',
          outButtons: [],
        },
      ],
      stations: {
        0: {
          id: 0,
          name: 'station1',
          width: 0,
          widthDelta: 1000,
        },
        1: {
          id: 1,
          name: 'station2',
          width: 0,
          widthDelta: 1000,
        },
      },
      priority: [
        {
          id: 1,
          x: 0,
          y: 0
        },
        {
          id: 2,
          x: 0,
          y: 0
        }
      ],
      pendingNode: [],
      newTrackStation: null,
      newTrackValid: false,
      modifyUser: null,
      modifyUserName: '',
      modifyUserColor: '#',
      selectPendingNode: null,
      newPendingValid: false,
      modifyUserValid: false,
      timer: '',
      isAction: false,
    }
  },
  computed: {
  },
  created() {
    this.updateFromDB()
    this.updateUser()
    this.updateTimer = setInterval(this.updateFromDB, 500);
    this.notifyTimer = setInterval(this.notify, 60000);
  },
  watch: {
    modifyUser: function (newValue) {
      this.changeModifyUser()
    }
  },
  methods: {
    async updateFromDB() {
      if (!this.isAction) {
        this.scene.tracks = await getTracks()
        this.pendingNode = await getPending()
        this.priority = await getPriority()
      }
    },
    async updateUser() {
      let users = await getUsers()
      users.forEach((user, index) => {
        Object.assign(users[index], {
          originX: -100,
          originY: 50 * (index + 1),
          moveX: -100,
          moveY: 50 * (index + 1)
        })
      });
      this.scene.users = users
    },
    async notify() {
      const notifyTime = await getNotifyTime();
      const today = new Date();
      if (today.getHours() === notifyTime.h && today.getMinutes() == notifyTime.m) {
        sendNotification('Task Board', {body: `Please check your task`})
      }
    },
    async addTrack(id) {
      this.scene.tracks = await getTracks()
      console.log("read track")
      let stationTrack = this.scene.tracks.filter((track) => {
        return track.station_id === id;
      });
      let maxID = Math.max(-1, ...stationTrack.map((track) => {
        return track.track_id;
      }))
      let newTrack = {
        track_id: maxID + 1,
        station_id: id,
        relativeX: 0,
        relativeY: 150 * (parseInt(maxID + 1) + 1),
        nodes: []
      }
      this.scene.tracks.push(newTrack)
      await postTracks(newTrack)
      console.log("save track")
    },
    addNode(stat) {
      let maxID = Math.max(-1, ...this.scene.nodes.map((node) => {
        return node.id;
      }))
      this.scene.nodes.push({
        id: maxID + 1,
        centeredX: (this.stations[this.newNodeStation.id].width + 200) / this.scene.scale,
        centeredY: this.scene.centerY + 300,
        type: this.newNodeType.name,
        station_id: this.newNodeStation.id,
        track_id: -1,
        task_id: -1,
        car_id: -1,
        title: this.newNodeTitle,
        detail: this.newNodeDetail,
        currentUsers: [],
        label: `node id: ${maxID + 1}`,
        outButtons: this.newNodeType.outButtons,
        stat: stat,
        upStream: [],
        param: {},
      })
    },
    nodeClick(id) {
      // console.log('node click', id);
      return
    },
    nodeDelete(id) {
      console.log('node delete', id);
      return
    },
    actionChange(isAction) {
      this.isAction = isAction
      return
    },
    changeModifyUser() {
      if (this.modifyUser === null) {
        return
      } else if (this.modifyUser.user_name !== '+ New') {
        this.modifyUserName = this.modifyUser.user_name
        this.modifyUserColor = this.modifyUser.color
      } else {
        this.modifyUserName = ""
        this.modifyUserColor = "#"
      }
    },
    onCreateFormSubmit(e) {
      e.preventDefault();
      this.addNode('warning');
      this.newNodeType = null;
      this.newNodeStation = null;
      this.newNodeTitle = "";
      this.newNodeDetail = "";
      this.createNodeDialog = false;
    },
    onCreateFormReset(e) {
      e.preventDefault();
      this.newNodeType = null;
      this.newNodeStation = null;
      this.newNodeTitle = "";
      this.newNodeDetail = "";
      this.createNodeDialog = false;
    },
    async onModifyUserSubmit(e) {
      e.preventDefault();
      if (this.modifyUser.id > -1) {
        await patchUsers(this.modifyUser.id, {
          "user_name": this.modifyUserName,
          "color": this.modifyUserColor
        })
      } else {
        await postUsers({
          "user_name": this.modifyUserName,
          "color": this.modifyUserColor
        })
      }
      this.updateUser()
      this.modifyUser = null;
      this.modifyUserName = ""
      this.modifyUserColor = "#"
      this.modifyUserDialog = false;
    },
    onModifyUserReset(e) {
      e.preventDefault();
      this.modifyUser = null;
      this.modifyUserName = ""
      this.modifyUserColor = "#"
      this.modifyUserDialog = false;
    },
    onCreateTrack(e) {
      e.preventDefault();
      this.addTrack(this.newTrackStation.id)
      this.addTrackDialog = false;
      this.newTrackStation = null;
    },
    onCloseAddTrack(e) {
      e.preventDefault();
      this.addTrackDialog = false;
      this.newTrackStation = null;
    },
    async onAddPendingNode() {
      // delete it in db
      await deletePending(this.selectPendingNode.id)

      // no matter this node is in db or not, add it!
      let pnode = this.selectPendingNode

      let maxID = Math.max(-1, ...this.scene.nodes.map((node) => {
        return node.id;
      }))
      pnode.id = maxID + 1
      pnode.centeredX = (this.stations[pnode.station_id].width + 200) / this.scene.scale
      pnode.centeredY = this.scene.centerY + 300
      this.scene.nodes.push(pnode)

      // cannot direct assign array to pendingNode
      const newPending = await getPending()
      this.pendingNode.splice(0, this.pendingNode.length)
      newPending.forEach(node => {
        this.pendingNode.push(node)
      });
      console.log("read pending node")
      this.selectPendingNode = null
    },
    updatePendingList() {
      this.selectPendingNode = null
    }
  }
})
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  overflow-y: hidden;
  overflow-x: hidden;
  height: 100vh;
  .tool-wrapper {
    position: relative;
  }
  .flowchart {
    max-height: 100vh;
  }
}
</style>

<template>
  <div>
    <div id="flowchart" class="flowchart">
      <div class="flowchart-container"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleUp"
        @mouseleave="handleUp"
      >
        <flowchart-node
          v-bind.sync="node"
          v-for="(node, index) in scene.nodes"
          :ref="`node${index}`"
          :key="`node${index}`"
          :options="nodeOptions"
          :stations.sync="stations"
          :priority.sync="priority"
          @nodeSelected="nodeSelected(node.id, $event)"
          @openDetail="openNodeDetail(node)"
          @pending="onPendingNode(node)"
          @nodeHover="onNodeHover(node)"
          @deleteUser="deleteUserFromNode"
        >
        </flowchart-node>
        <flowchart-node
          v-bind.sync="node"
          v-for="(node, index) in getTracksNode(-1)"
          :ref="`tracks-node${index}`"
          :key="`tracks-node${index}`"
          :options="nodeOptions"
          :stations.sync="stations"
          :priority.sync="priority"
          @nodeSelected="taskSelected(node.task_id, $event)"
          @openDetail="openNodeDetail(node)"
          @pending="console.log('cannot pending task')"
          @nodeHover="onNodeHover(node)"
          @deleteUser="deleteUserFromTask"
        >
        </flowchart-node>
        <svg width="100%" :height="`${height}px`">
          <defs>
            <filter id="inset-shadow">
              <feOffset dx="0" dy="0"/>
              <feGaussianBlur stdDeviation="6" result="offset-blur"/>
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
              <feFlood flood-color="black" flood-opacity=".95" result="color"/>
              <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
              <feComposite operator="over" in="shadow" in2="SourceGraphic"/> 
            </filter>
          </defs>
          <line
            v-for="(station, index) in stations"
            :key="'line-' + index"
            :id="'line-' + index"
            :x1="calStationWidth(index)"
            y1="0"
            :x2="calStationWidth(index)"
            y2="100%"
            style="stroke: rgb(100, 100, 100); stroke-width: 6; cursor: col-resize"
            stroke-dasharray="20, 20"
          />
          <rect
            v-for="(station, index) in stations"
            :key="'rect-' + index"
            :id="'rect-' + index"
            :x="calPriority(index) - 50"
            :y="(this.scene.centerY + priority[index].y) * this.scene.scale"
            rx="10"
            style="fill:rgba(160,48,16,0.85)"
            width="75"
            height="20"
            filter="url(#inset-shadow)"
          />
          <circle
            v-for="(track, index) in scene.tracks"
            :key="'track-' + index"
            :id="'track-' + index"
            :cx="stations[track.station_id].width + track.relativeX"
            :cy="(scene.centerY + track.relativeY) * scene.scale"
            :r="10 * scene.scale"
            :style="trackCircleColor(track)"
          />
          <circle
            v-for="(user, index) in scene.users"
            :key="'user-' + index"
            :id="'user-' + index"
            :cx="(scene.centerX + user.moveX) * scene.scale"
            :cy="(scene.centerY + user.moveY) * scene.scale"
            :r="20 * scene.scale"
            :style="'fill:' + user.color"
            filter="url(#inset-shadow)"
          />
          <text
            v-for="(user, index) in scene.users"
            :key="'usertext-' + index"
            :id="'usertext-' + index"
            :x="(scene.centerX + user.moveX - 10) * scene.scale"
            :y="(scene.centerY + user.moveY + 5) * scene.scale"
            :style="'font-size:' + 15 * scene.scale + 'px;'"
          >
            {{ user.user_name.substring(0, 2) }}
          </text>
          <text
            v-for="(station, index) in stations"
            :key="'text-' + index"
            :x="calStationWidth(index) + 50 * scene.scale"
            y="5%"
            textLength="100"
            lengthAdjust="spacing"
            style="font-size: 24px;"
          >
            {{ station.name }}
          </text>
        </svg>
      </div>
      <v-dialog
        v-model="detailDialog"
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
            <div class="text-primary">Car Detail</div>
          </template>
          <v-card-text>
            <v-container class="px-1 pt-2">
              <v-form>
                <v-text-field
                  readonly
                  v-model="detailNode.title"
                  label="Title"
                  variant="outlined"
                  hide-details="auto"
                ></v-text-field>
                <br/>
                <v-row>
                  <v-chip-group>
                    <v-chip v-for="(user, index) in getUserByIdx(detailNode.currentUsers)"
                      :color="user.color"
                      variant="outlined"
                      class="ml-2 pa-4"
                      @click="detailDeleteUser(user, detailNode)"
                    >{{ user.user_name }}</v-chip>
                  </v-chip-group>
                </v-row>
                <br/>
                <v-textarea v-model="detailNode.detail" label="Detail" variant="outlined"></v-textarea>
              </v-form>
            </v-container>
          </v-card-text>
          <template v-slot:actions>
            <v-spacer></v-spacer>
            <v-btn variant="outlined" @click="onCloseDetail">Close</v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import FlowchartNode from './FlowchartNode.vue';
import { getMousePosition } from '../assets/utility/position';
import { useLocalStorage } from "@vueuse/core"
import { getTracks, postTracks, patchTracks } from "@/utils/request";
import { getPending, postPending } from "@/utils/request";
import { patchPriority } from "@/utils/request";

export default defineComponent({
  name: 'VueFlowchart',
  props: {
    scene: {
      type: Object,
      default() {
        return {
          centerX: 0,
          scale: 1,
          centerY: 0,
          nodes: [],
          tracks: [],
          users: []
        }
      }
    },
    height: {
      type: Number,
      default: 400,
    },
    stations: {
      type: Object,
      default() {
        return {}
      }
    },
    priority: {
      type: Object,
      default() {
        return []
      }
    },
    pendingNode: {
      type: Object,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      action: {
        dragging: false,
        draggingUser: false,
        scrolling: false,
        movingBound: false,
        movingBox: false,
        selected: 0,
        selectedBound: null,
        selectedBox: null,
        selectedUser: null
      },
      isaction: false,
      hoverNode: null,
      mouse: {
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
      },
      rootDivOffset: {
        top: 0,
        left: 0
      },
      moving: false,
      draggingNodeTop: 0,
      draggingNodeLeft: 0,
      actionType: '',
      window: {
        width: 0,
        height: 0
      },
      detailDialog: false,
      detailNode: {
        title: "", 
        detail: "",
        currentUsers: []
      },
      checkSelectAsync: false,
    };
  },
  created() {
    window.addEventListener('resize', this.windowsResize);
    this.windowsResize();
  },
  destroyed() {
    window.removeEventListener('resize', this.windowsResize);
  },
  components: {
    FlowchartNode,
  },
  computed: {
    nodeOptions() {
      return {
        centerY: this.scene.centerY,
        centerX: this.scene.centerX,
        scale: this.scene.scale,
        offsetTop: this.rootDivOffset.top,
        offsetLeft: this.rootDivOffset.left,
        selected: this.action.selected,
        users: this.scene.users,
      }
    }
  },
  mounted() {
    this.rootDivOffset.top = this.$el ? this.$el.offsetTop : 0;
    this.rootDivOffset.left = this.$el ? this.$el.offsetLeft : 0;
  },
  methods: {
    calStationWidth(index) {
      if (parseInt(index) > 0)
        this.stations[index].width = 
          this.stations[index - 1].width + this.stations[index - 1].widthDelta * this.scene.scale
      else
        this.stations[index].width = this.scene.centerX * this.scene.scale
      return this.stations[index].width
    },
    calPriority(index) {
      this.priority[index].x = this.stations[index].width
      return this.priority[index].x
    },
    trackCircleColor(track) {
      if (track.relativeY > this.priority[track.station_id].y) {
        return "fill:rgba(255, 144, 64, 0.85)"
      } else {
        return "fill:rgba(160, 48, 16, 0.85)"
      }
    },
    nodeSelected(id, e) {
      this.action.dragging = true;
      this.action.selected = id;
      this.$emit('nodeClick', id);
      this.mouse.lastX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.mouse.lastY = e.pageY || e.clientY + document.documentElement.scrollTop
    },
    async taskSelected(id, e) {
      let node = this.getTrackNode(-1, id)
      // delete task in track
      let r = await this.taskDelete(node.station_id, node.track_id, node.task_id)

      // push task into normal nodes
      // calculate new x, y
      let x = this.stations[node.station_id].width / this.scene.scale + 10
      x = x + (300 + 10) * node.car_id // 300 is node width, 10 is gap
      let y = this.scene.centerY
      y = y + (node.track_id + 1) * 150 // 150 is track delta
      y = y - 50 // node port position
      node.centeredX = x
      node.centeredY = y
      node.track_id = -1
      node.task_id = -1
      node.car_id = -1
      // node.currentUsers = []
      let maxID = Math.max(-1, ...this.scene.nodes.map((node) => {
        return node.id;
      }))
      node.id = maxID + 1
      this.scene.nodes.push(node)

      this.$emit('nodeClick', node.id);
      this.action.dragging = true;
      this.action.selected = node.id;
      this.mouse.lastX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.mouse.lastY = e.pageY || e.clientY + document.documentElement.scrollTop
    },
    handleMove(e) {
      if (this.action.dragging) {
        this.mouse.x = e.pageX || e.clientX + document.documentElement.scrollLeft
        this.mouse.y = e.pageY || e.clientY + document.documentElement.scrollTop
        let diffX = this.mouse.x - this.mouse.lastX;
        let diffY = this.mouse.y - this.mouse.lastY;

        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
        this.moveSelectedNode(diffX, diffY);
      }
      if (this.action.draggingUser) {
        [this.mouse.x, this.mouse.y] = getMousePosition(this.$el, e);
        let diffX = this.mouse.x - this.mouse.lastX;
        let diffY = this.mouse.y - this.mouse.lastY;

        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
        this.moveSelectedUser(diffX, diffY);
      }
      if (this.action.scrolling) {
        [this.mouse.x, this.mouse.y] = getMousePosition(this.$el, e);
        let diffX = this.mouse.x - this.mouse.lastX;
        let diffY = this.mouse.y - this.mouse.lastY;

        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;

        this.scene.centerX += diffX / this.scene.scale;
        this.scene.centerY += diffY / this.scene.scale;

        this.scene.nodes = this.scene.nodes.map((node) => ({
          ...node,
          centeredX: node.centeredX + diffX / this.scene.scale,
          centeredY: node.centeredY + diffY / this.scene.scale,
        }))
      }
      if (this.action.movingBound) {
        [this.mouse.x, this.mouse.y] = getMousePosition(this.$el, e);
        const diffX = (this.mouse.x - this.mouse.lastX) / this.scene.scale;

        this.mouse.lastX = this.mouse.x;

        if (this.action.selectedBound > 0
          && (this.stations[this.action.selectedBound - 1].width - (diffX - (300 + 10))
            * this.scene.scale) < this.stations[this.action.selectedBound].width) {
          this.stations[this.action.selectedBound - 1].widthDelta += diffX;
          [...Array(this.scene.nodes.length).keys()].forEach((i) => {
            if (this.scene.nodes[i].station_id >= this.action.selectedBound) {
              Object.assign(this.scene.nodes[i], {
                centeredX: this.scene.nodes[i].centeredX + diffX,
                centeredY: this.scene.nodes[i].centeredY
              });
            } else {
              if ((this.scene.nodes[i].centeredX + 300 + 10) * this.scene.scale > this.calStationWidth(this.action.selectedBound))
                Object.assign(this.scene.nodes[i], {
                  centeredX: this.calStationWidth(this.action.selectedBound) / this.scene.scale - (300 + 10),
                  centeredY: this.scene.nodes[i].centeredY
                });
            }
          });
        }
      }
      if (this.action.movingBox) {
        [this.mouse.x, this.mouse.y] = getMousePosition(this.$el, e);
        const diffY = this.mouse.y - this.mouse.lastY

        this.mouse.lastY = this.mouse.y;
        this.priority[this.action.selectedBox].y += diffY / this.scene.scale;
      }
    },
    async handleUp(e) {
      const target = e.target || e.srcElement;
      // eslint-disable-next-line
      if (this.$el.contains(target)) {
        if (typeof target.className !== 'string' || target.className.indexOf('node-input') < 0) {
          this.draggingLink = null;
        }
        if (typeof target.className === 'string' && target.className.indexOf('node-delete') > -1) {
          this.nodeDelete(this.action.selected);
        } else if (this.action.dragging) {
          // check whether if coonect node to track
          this.checkSelectedNode();
        }
      }
      if (this.action.movingBox) {
        const updatePriority = this.priority[this.action.selectedBox]
        let priorityID = updatePriority.id
        await patchPriority(priorityID, updatePriority)
        console.log("save station priority")
      }
      if (this.action.draggingUser) {
        if (target.id.split('-')[0] == 'node') {
          if (this.hoverNode !== null && this.hoverNode.task_id > -1) {
            this.addUserToTask(this.scene.users[this.action.selectedUser], this.hoverNode)
          }
        }
        this.scene.users[this.action.selectedUser].moveX = this.scene.users[this.action.selectedUser].originX
        this.scene.users[this.action.selectedUser].moveY = this.scene.users[this.action.selectedUser].originY
      }
      this.action.dragging = false;
      this.action.draggingUser = false;
      this.action.scrolling = false;
      this.action.movingBound = false;
      this.action.movingBox = false;
      if (!this.checkSelectAsync) {
        this.action.selected = null;
      }
      this.action.selectedBound = null;
      this.action.selectedBox = null;
      this.action.selectedUser = null;

      this.$emit('actionChange', false);
    },
    handleDown(e) {
      this.$emit('actionChange', true);

      const target = e.target || e.srcElement;
      const target_id = e.target.id
      if (target_id.match('^user-*')) {
        this.action.draggingUser = true;
        this.action.selectedUser = target.id.split('-')[1];
        [this.mouse.lastX, this.mouse.lastY] = getMousePosition(this.$el, e);
        this.action.selected = null; // deselectAll
      }
      else if (target === this.$el || target.matches('line, line *')) {
        this.action.selectedBound = target.id.split('-')[1];
        if (this.action.selectedBound > 0)
          this.action.movingBound = true;
        else
          this.action.scrolling = true;
        [this.mouse.lastX, this.mouse.lastY] = getMousePosition(this.$el, e);
        this.action.selected = null; // deselectAll
      }
      else if (target.matches('rect, rect *')) {
        this.action.movingBox = true;
        this.action.selectedBox = target.id.split('-')[1];
        [this.mouse.lastX, this.mouse.lastY] = getMousePosition(this.$el, e);
        this.action.selected = null; // deselectAll
      }
      else if (target === this.$el || target.matches('svg, svg *')) {
        this.action.scrolling = true;
        [this.mouse.lastX, this.mouse.lastY] = getMousePosition(this.$el, e);
        this.action.selected = null; // deselectAll
      }
      this.$emit('canvasClick', e);
    },
    handleMouseMove(e) {
      if (e.type.includes('mouse')) {
        this.handleMove(e);
      }
    },
    handleMouseDown(e) {
      if (e.type.includes('mouse')) {
        this.handleDown(e);
      }
    },
    moveSelectedNode(dx, dy) {
      let index = this.scene.nodes.findIndex((item) => {
        return item.id === this.action.selected
      })
      let left = this.scene.nodes[index].centeredX + dx / this.scene.scale;
      let top = this.scene.nodes[index].centeredY + dy / this.scene.scale;
      if (this.scene.nodes[index].station_id + 1 < Object.keys(this.stations).length) {
        left = Math.min(left, this.calStationWidth(this.scene.nodes[index].station_id + 1) / this.scene.scale - 300);
      }
      left = Math.max(left, this.calStationWidth(this.scene.nodes[index].station_id) / this.scene.scale);
      Object.assign(this.scene.nodes[index], {
        centeredX: left,
        centeredY: top
      })
    },
    moveSelectedUser(dx, dy) {
      let index = this.action.selectedUser
      Object.assign(this.scene.users[index], {
        moveX: this.scene.users[index].moveX + dx / this.scene.scale,
        moveY: this.scene.users[index].moveY + dy / this.scene.scale
      })
    },
    async checkSelectedNode() {
      this.checkSelectAsync = true
      let index = this.scene.nodes.findIndex((item) => {
        return item.id === this.action.selected
      })
      let left = this.scene.nodes[index].centeredX;
      let top = this.scene.nodes[index].centeredY + 50 * this.scene.scale; // 50 is node port position
      let closestTrack = -1;
      // 300 is the node width, 10 is the gap
      let trackX = this.stations[this.scene.nodes[index].station_id].width / this.scene.scale
      let x_delta = (left - trackX) % (300 + 10)
      let x_count = Math.round((left - trackX) / (300 + 10))
      if (x_delta < 30 || x_delta > (300 + 10 - 30)) {
        let delta = Math.abs(top - this.scene.centerY - 150) % 150;
        if (delta < 30 * this.scene.scale) {
          closestTrack = parseInt(Math.abs(top - this.scene.centerY - 150) / 150);
        }
        else if (delta > 90 * this.scene.scale) {
          closestTrack = parseInt(Math.abs(top - this.scene.centerY - 150) / 150) + 1;
        }
      }
      let taskNode = this.scene.nodes[index]
      console.log("read track")
      this.scene.tracks = await getTracks()
      let stationTrack = this.scene.tracks.filter((track) => {
        return track.station_id === taskNode.station_id;
      });
      if (closestTrack > -1 && closestTrack < stationTrack.length && x_count <= stationTrack[closestTrack].nodes.length) {
        let tracksNode = this.getTracksNode(-1)
        let maxID = Math.max(-1, ...tracksNode.map((node) => {
          return node.task_id;
        }))
        taskNode.task_id = maxID + 1
        taskNode.car_id = stationTrack[closestTrack].nodes.length
        taskNode.track_id = closestTrack
        let trackID = stationTrack[closestTrack].id
        stationTrack[closestTrack].nodes.push(taskNode)
        console.log("put track")
        await patchTracks(trackID, stationTrack[closestTrack])
        console.log("read track")
        this.scene.tracks = await getTracks()
        this.nodeDelete(this.action.selected)
        this.action.selected = null
        this.checkSelectAsync = false
      }
    },
    async addUserToTask(user, node) {
      console.log("read track")
      const tracks = await getTracks(`?station_id=${node.station_id}&track_id=${node.track_id}`)
      if (tracks.length !== 1) {
	console.error("wrong tracks in db")
      }
      const track = tracks[0]
      const nodes = track.nodes.filter((tnode) => {
	return tnode.task_id === node.task_id;
      })
      if (nodes.length !== 1) {
	console.error("wrong nodes in db")
      }
      node = nodes[0]
      node.currentUsers.push(user.id)
      node.currentUsers = node.currentUsers.filter((value, index, array) => array.indexOf(value) === index);
      const nodeIdx = track.nodes.findIndex((item) => {
        return item.task_id === node.task_id;
      })
      track.nodes[nodeIdx] = node
      await patchTracks(track.id, track)
    },
    detailDeleteUser(user, node) {
      if (node.track_id > -1) {
        this.deleteUserFromTask(user, node)
      } else {
        this.deleteUserFromNode(user, node)
      }
    },
    async deleteUserFromTask(user, node) {
      console.log("read track")
      const tracks = await getTracks(`?station_id=${node.station_id}&track_id=${node.track_id}`)
      if (tracks.length !== 1) {
	console.error("wrong tracks in db")
      }
      const track = tracks[0]
      const nodes = track.nodes.filter((tnode) => {
	return tnode.task_id === node.task_id;
      })
      if (nodes.length !== 1) {
	console.error("wrong nodes in db")
      }
      node = nodes[0]
      node.currentUsers = node.currentUsers.filter((id) => {
	return id !== user.id;
      })
      this.detailNode.currentUsers = node.currentUsers
      const nodeIdx = track.nodes.findIndex((item) => {
        return item.task_id === node.task_id;
      })
      track.nodes[nodeIdx] = node
      await patchTracks(track.id, track)
    },
    async deleteUserFromNode(user, node) {
      const newCurrentUsers = node.currentUsers.filter((id) => {
	return id !== user.id;
      })
      const nodeIdx = this.scene.nodes.findIndex((item) => {
        return item.id === node.id;
      })
      let newNode = this.scene.nodes[nodeIdx]
      newNode.currentUsers = newCurrentUsers
      this.scene.nodes[nodeIdx] = newNode
    },
    getUserByIdx(ids) {
      return this.scene.users.filter((user) => {
        return ids.includes(user.id)
      })
    },
    getTracksNode(station_id) {
      let stationTrack = this.scene.tracks
      if (station_id > -1) {
        stationTrack = this.scene.tracks.filter((track) => {
          return track.station_id === station_id;
        });
      }
      let tracksNode = []
      stationTrack.forEach(track => {
        tracksNode = tracksNode.concat(track.nodes)
      })
      return tracksNode
    },
    getTrackNode(station_id, task_id) {
      let tracksNode = this.getTracksNode(station_id)
      let taskNode = null
      tracksNode.forEach(node => {
        if (node.task_id === task_id) {
          taskNode = node
        }
      })
      return taskNode
    },
    nodeDelete(id) {
      this.scene.nodes = this.scene.nodes.filter((node) => {
        return node.id !== id;
      })
      this.$emit('nodeDelete', id)
    },
    async taskDelete(station_id, track_id, task_id) {
      const tracks = await getTracks(`?station_id=${station_id}&track_id=${track_id}`)
      if (tracks.length !== 1) {
        console.error("duplicate track in db")
        return
      }
      let track = tracks[0]
      console.log("read track by station_id and track_id")
      track.nodes = track.nodes.filter((node) => {
        return node.task_id !== task_id;
      })
      track.nodes.forEach((node, index) => {
        node.car_id = index
        track.nodes[index] = node
      })
      await patchTracks(track.id, track)
      console.log("patch track")
      this.scene.tracks = await getTracks()
      console.log("read track")
      return true
    },
    windowsResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    async openNodeDetail(node) {
      if (node.track_id > -1) {
        console.log("read node detail")
        const tracks = await getTracks(`?station_id=${node.station_id}&track_id=${node.track_id}`)
        if (tracks.length !== 1) {
          console.error("wrong tracks in db")
        }
        const track = tracks[0]
        const nodes = track.nodes.filter((tnode) => {
          return tnode.task_id === node.task_id;
        })
        if (nodes.length !== 1) {
          console.error("wrong nodes in db")
        }
        node = nodes[0]
      }
      this.detailNode = node
      this.detailDialog = true
    },
    async onCloseDetail() {
      if (this.detailNode.track_id > -1) {
        console.log("save node detail")
        const tracks = await getTracks(`?station_id=${this.detailNode.station_id}&track_id=${this.detailNode.track_id}`)
        if (tracks.length !== 1) {
          console.error("wrong tracks in db")
        }
        const track = tracks[0]
        const nodeIdx = track.nodes.findIndex((item) => {
          return item.task_id === this.detailNode.task_id;
        })
        track.nodes[nodeIdx] = this.detailNode
        await patchTracks(track.id, track)
      }
      this.detailDialog = false
      this.detailNode = {
        title: "", 
        detail: "",
        currentUsers: []
      }
    },
    async onPendingNode(pnode) {
      this.nodeDelete(pnode.id)
      await postPending(pnode)
      console.log("save pending node")
      // cannot direct assign array to pendingNode
      const newPending = await getPending()
      this.pendingNode.splice(0, this.pendingNode.length)
      newPending.forEach(node => {
        this.pendingNode.push(node)
      });
      console.log("read pending node")
      this.$emit('updatePendingList');
    },
    onNodeHover(node) {
      this.hoverNode = node
    },
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.flowchart {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 1;
  max-height: 100vh;
  overflow-y: hidden;
}
.flowchart-container {
  flex: 1;
  margin: 0;
  background: #ddd;
  position: relative;
  overflow: hidden;
  svg {
    cursor: grab;
    position: relative;
  }
  svg text{
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
  }
}
</style>

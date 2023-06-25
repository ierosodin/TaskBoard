<template>
  <div class="flowchart-node" :style="nodeStyle" 
    @dblclick="handleMouseDouble"
    @mousedown="handleMousedown"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
    v-bind:class="{selected: options.selected === id}"
  >
    <div class="node-port node-input"
      :class="{ 'node-port-tag': stat }"
      :style="portStyle"
    ></div>
    <div :id="'node-main_' + id" class="node-main">
      <div ref="nodeType" :id="'node-type_' + id" class="node-type">
         <v-row>
           <v-col :id="'node-title_' + id" class="px-2 pt-2 mb-0">
             <v-btn
               :id="'node-title-btn_' + id"
               block
               elevation="0"
               variant="text"
               :style="{'pointer-events': 'none'}"
               color="#303040"
             >
               {{ title }}
             </v-btn>
           </v-col>
         </v-row>
         <v-row v-if="currentUsers.length === 0" class="pb-2">
         </v-row>
         <v-divider v-if="currentUsers.length > 0"></v-divider>
         <v-row
           class="pa-0 mr-0 mt-0 justify-end"
           :id="'node-user_' + id"
         >
           <v-btn
             v-for="(user, index) in getUserByIds(currentUsers)"
             class="ml-1 mr-0 px-2 mb-2"
             :id="'node-user-btn_' + id"
             size="small"
             elevation="2"
             :color="user.color"
             variant="outlined"
             @click="onDeleteUser(user)"
           >
             <span
               class = "text-black"
               :id="'node-user-btn-text_' + id"
             >
               {{ user.user_name }}
             </span>
           </v-btn>
         </v-row>
      </div>
      <div class="node-label" :id="'node-label_' + id">
        <div ref="labelTitle" class="node-label-title" :id="'node-label-title_' + id">
          <div
            class="text-right"
            :id="'node-text' + id"
          >
            <v-btn
              class="pa-0 ml-2 mr-2"
              v-if="track_id == -1"
              variant="tonal"
              @click="onPending"
              color="#ff4010"
            >
              <span
                :id="'node-pending' + id"
              >
                P
              </span>
            </v-btn>
            <v-btn
              variant="tonal"
              @click="onOpenDetail"
              color="#303040"
            >
              <span
                :id="'node-detail' + id"
              >
                Detail
              </span>
            </v-btn>
          </div>
        </div>
        <div v-if="outButtons.length > 0" class="node-buttons" :id="'node-buttons_' + id">
          <div v-for="(button, index) in outButtons" :key="index" :id="'button_' + id + '_' + index" class="node-label-button">
            <span>{{ button.text }}</span>
            <div class="node-port node-output" :id="'port_' + id + '_' + index" 
              :style="buttonPortStyle(index)"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="outButtons.length === 0"
      :id="'node-output_' + id"
      class="node-port node-output"
      :class="{ 'node-port-tag': stat }"
      :style="portStyle"
    >
    </div>
    <div v-show="show.delete">
      <v-icon class="node-delete" size="small" icon=mdi-close></v-icon>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'FlowchartNode',
  props: {
    id: {
      type: Number,
      default: 1000,
      validator(val) {
        return typeof val === 'number'
      }
    },
    centeredX: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number'
      }
    },    
    centeredY: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number'
      }
    },
    type: {
      type: String,
      default: 'Default'
    },
    label: {
      type: String,
      default: 'node id: '
    },
    title: {
      type: String,
      default: 'node id: '
    },
    detail: {
      type: String,
      default: 'node id: '
    },
    track_id: {
      type: Number,
      default: -1
    },
    task_id: {
      type: Number,
      default: -1
    },
    car_id: {
      type: Number,
      default: -1
    },
    station_id: {
      type: Number,
      default: -1
    },
    currentUsers: {
      type: Object,
      default() {
        return []
      }
    },
    options: {
      type: Object,
      default() {
        return {
          centerX: 1024,
          scale: 1,
          centerY: 140,
        }
      }
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
    stat: {
      type: String,
      default() {
        return 'success';
      }
    },
    outButtons: {
      type: Array,
      default() {
        return [];
      }
    },
    upStream: {
      type: Array,
      default() {
        return [];
      }
    },
  },
  data() {
    return {
      show: {
        delete: true,
      },
      reload: false,
    }
  },
  mounted() {
    // trigger buttonPortStyle fn
    this.show.delete = false;
  },
  computed: {
    nodeStyle() {
      if (this.track_id > -1) {
        let x = this.stations[this.station_id].width / this.options.scale + 10
        x = x + (300 + 10) * this.car_id // 300 is node width, 10 is gap
        x = x * this.options.scale
        let y = this.options.centerY
        y = y + (this.track_id + 1) * 150
        y = y - 50 // node port position
        y = y * this.options.scale
        return {
          top: y + 'px', // remove: this.options.offsetTop + 
          left: x + 'px', // remove: this.options.offsetLeft + 
          transform: `scale(${this.options.scale})`,
        }
      } else {
        return {
          top: this.centeredY * this.options.scale + 'px', // remove: this.options.offsetTop + 
          left: this.centeredX * this.options.scale + 'px', // remove: this.options.offsetLeft + 
          transform: `scale(${this.options.scale})`,
        }
      }
    },
    portStyle() {
      if (this.track_id > -1) {
        let y = (this.track_id + 1) * 150
        if (y > this.priority[this.station_id].y) {
          return {
            background: 'rgba(255,144,64,0.85)'
          }
        }
        return {
          background: 'rgba(160,48,16,0.85)'
        }
      } else {
        return {
          background: '#303040'
        }
      }
    }
  },
  methods: {
    buttonPortStyle(index) {
      const nodeTypeElement = this.$refs.nodeType;
      if (!nodeTypeElement) { return; }

      const labelTitleElement = this.$refs.labelTitle;
      if (!labelTitleElement) { return; }

      const nodeTypeHeight = nodeTypeElement.offsetHeight;
      const labelTitleHeight = labelTitleElement.offsetHeight;

      let buttonHeight = labelTitleHeight + nodeTypeHeight;

      let element = null;
      for (let i = index; i >= 0; i--) {
        element = document.getElementById('button_' + this.id + '_' + i);
        if (!element) { continue; }
        if (i === index) {
          buttonHeight += element.offsetHeight / 1.5;
        } else {
          buttonHeight += element.offsetHeight;
        }
      }
      let additionalHeight = 0;
      if (this.stat !== null) {
        additionalHeight += 40;
      }
      buttonHeight += additionalHeight
      
      return {
        top: buttonHeight + 'px',
        right: '-12px',
        marginTop: '0px'
      }
    },
    getUserByIds(ids) {
      return this.options.users.filter((user) => {
        return ids.includes(user.id)
      })
    },
    handleMousedown(e) {
      const target = e.target || e.srcElement;
      if (target.className !== null && target.className.startsWith('v-btn')) {
        return
      }
      if (!(target.matches('svg, svg *') || target.matches('button') || target.matches('span'))) {
        if (target.className.indexOf('node-input') < 0 && target.className.indexOf('node-output') < 0) {
          this.$emit('nodeSelected', e);
        }
      }
      if (e.type.includes('mouse')) {
        e.preventDefault();
      }
    },
    handleMouseOver() {
      this.$emit('nodeHover')
      this.show.delete = true;
    },
    handleMouseLeave() {
      this.show.delete = false;
    },
    handleMouseDouble() {
      return null
    },
    onDeleteUser(user) {
      this.$emit('deleteUser', user, this)
    },
    onOpenDetail() {
      this.$emit('openDetail')
    },
    onPending() {
      this.$emit('pending')
    },
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$themeColor: rgb(120, 120, 120);
$portSize: 16;

.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.flowchart-node {
  margin: 0;
  width: 300px;
  position: absolute;
  box-sizing: border-box;
  border: none;
  opacity: .9;
  cursor: move;
  transform-origin: top left;
  z-index: 1;
  .node-main {
    text-align: center;
    .node-error {
      margin: 0 auto;
      background: #ff0000;
      opacity: 0.9;
      padding: 6px;
      width: 300px;
      border-radius: 4px;
      position: relative;
      span {
        color: #FFF;
        font-size: 20px;
        font-weight: 600;
      }
    }
    .node-warning {
      margin: 0 auto;
      background: #ffcc00;
      opacity: 0.9;
      padding: 6px;
      width: 300px;
      border-radius: 4px;
      position: relative;
      span {
        color: #FFF;
        font-size: 20px;
        font-weight: 600;
      }
    }
    .node-success {
      margin: 0 auto;
      background: #33FF39;
      opacity: 0.9;
      padding: 6px;
      width: 300px;
      border-radius: 4px;
      position: relative;
      span {
        color: #FFF;
        font-size: 20px;
        font-weight: 600;
      }
    }
    .node-type {
      background: #b0b0c0;
      opacity: 0.7;
      border: 2px solid #ffffff;
      border-radius: 6px;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
      color: black;
      font-size: 24px;
      font-weight: 600;
      padding: 6px;
    }
    .node-label {
      font-size: 20px;
      background: #FFF;
      border: 2px solid #e0e6ed;

      .node-label-title{
        border-radius: 4px;
        background: #FFF;
        padding: 4px;
      }
      .node-label-button {
        border: 1px solid #dfdfdf;
        border-radius: 4px;
        background: #EFEFEF;
        color: #0084ff;
        padding: 10px;
        font-weight: 600;
      }
    }
  }
  .node-port {
    position: absolute;
    width: #{$portSize}px;
    height: #{$portSize}px;
    top: 50%;
    transform: translateY(-50%);
    border: 1px solid #ccc;
    border-radius: 100px;
    background: #{$themeColor};
    opacity: 0.9;
    &.node-port-tag {
      margin-top: 50px;
      top: 0px;
      transform: translateY(-50%);
    }
  }
  .node-input {
    left: #{-$portSize+4}px;
  }
  .node-output {
    right: #{-$portSize+4}px;
  }
  .node-delete {
    position: absolute;
    right: -10px;
    top: -10px;
    font-size: 16px;
    font-weight: 900;
    width: 24px;
    height: 24px;
    color: red;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid red;
    border-radius: 100px;
    text-align: center;
    &:hover{
      border: 1px solid rgba(255, 0, 0, 0.9);
      background: rgba(255, 0, 0, 0.9);
      color: white;
    }
  }
}
.selected {
  box-shadow: 0 0 0 2px $themeColor;
}
</style>

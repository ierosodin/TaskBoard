/**
 * communication to backend server
 */
import axios, {formToJSON} from 'axios'
import moment from "moment";
import {VueCookieNext} from "vue-cookie-next";
import {JSON_SERVER_URL} from "../../cfg/api_cfg";

export async function getTracks(filter: string = "") {
  let result: any
  await axios.get(`${JSON_SERVER_URL}tracks${filter}`)
    .then((res) => {
      result = res.data
    }).catch((err) => {
      console.log(err);
    });
  return result
}

export async function postTracks(data: any){
  let result: any
  await axios.post(`${JSON_SERVER_URL}tracks`, data, {
    headers: {
      "Content-Type": "application/json"
    }
  }).then((res) => {
    result = res.data
  }).catch((err) => {
    console.log(err);
  });
  return result;
}

export async function patchTracks(id: number, data: any){
  let result: any
  await axios.patch(`${JSON_SERVER_URL}tracks/${id}`, data, {
    headers: {
      "Content-Type": "application/json"
    }
  }).then((res) => {
    result = res.data
  }).catch((err) => {
    console.log(err);
  });
  return result;
}

export async function getPending(filter: string = "") {
  let result: any
  await axios.get(`${JSON_SERVER_URL}pendingNode${filter}`)
    .then((res) => {
      result = res.data
    }).catch((err) => {
      console.log(err);
    });
  return result
}

export async function postPending(data: any){
  let result: any
  await axios.post(`${JSON_SERVER_URL}pendingNode`, data, {
    headers: {
      "Content-Type": "application/json"
    }
  }).then((res) => {
    result = res.data
  }).catch((err) => {
    console.log(err);
  });
  return result;
}

export async function deletePending(id: number){
  let result: any
  await axios.delete(`${JSON_SERVER_URL}pendingNode/${id}`, {
  }).then((res) => {
    result = res.data
  }).catch((err) => {
    console.log(err);
  });
  return result;
}

export async function getPriority(filter: string = "") {
  let result: any
  await axios.get(`${JSON_SERVER_URL}priority${filter}`)
    .then((res) => {
      result = res.data
    }).catch((err) => {
      console.log(err);
    });
  return result
}

export async function patchPriority(id: number, data: any){
  let result: any
  await axios.patch(`${JSON_SERVER_URL}priority/${id}`, data, {
    headers: {
      "Content-Type": "application/json"
    }
  }).then((res) => {
    result = res.data
  }).catch((err) => {
    console.log(err);
  });
  return result;
}

export async function getUsers(filter: string = "") {
  let result: any
  await axios.get(`${JSON_SERVER_URL}users${filter}`)
    .then((res) => {
      result = res.data
    }).catch((err) => {
      console.log(err);
    });
  return result
}

export async function postUsers(data: any){
  let result: any
  await axios.post(`${JSON_SERVER_URL}users`, data, {
    headers: {
      "Content-Type": "application/json"
    }
  }).then((res) => {
    result = res.data
  }).catch((err) => {
    console.log(err);
  });
  return result;
}

export async function patchUsers(id: number, data: any){
  let result: any
  await axios.patch(`${JSON_SERVER_URL}users/${id}`, data, {
    headers: {
      "Content-Type": "application/json"
    }
  }).then((res) => {
    result = res.data
  }).catch((err) => {
    console.log(err);
  });
  return result;
}

export async function getNotifyTime() {
  let result: any
  await axios.get(`${JSON_SERVER_URL}notifyTime`)
    .then((res) => {
      result = res.data
    }).catch((err) => {
      console.log(err);
    });
  return result
}


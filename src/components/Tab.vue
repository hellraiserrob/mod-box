<template>
  <div class="toast" :class="{'toast--active' : toast.active}">
    <div class="toast__text">
      {{ toast.message }}
    </div>
    
    <button class="btn-icon" @click="toast.active = false">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-x-lg"
        viewBox="0 0 16 16"
      >
        <path
          d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
        />
      </svg>
    </button>
  </div>
  <div class="tab" :class="{ 'tab--active': tab.active }">
    <div class="folder__header mb10">
      <h3>Tab ({{ tab.name }})</h3>
      <button
        @click="showSettings = !showSettings"
        class="btn-icon"
        :class="{ 'btn-icon--active': showSettings }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-gear-wide-connected"
          viewBox="0 0 16 16"
        >
          <path
            d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z"
          />
        </svg>
      </button>
    </div>

    <div v-if="showSettings" class="panel">
      <div class="panel__close">
        <button class="btn-icon" @click="showSettings = false">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-x-lg"
            viewBox="0 0 16 16"
          >
            <path
              d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
            />
          </svg>
        </button>
      </div>

      <div v-if="showDeleteConfirmation" class="panel__modal">
        <h3 class="mb10">Confirm tab deletion</h3>
        <div class="panel__modal__actions">
          <button class="btn btn--danger" @click="deleteTab">Delete</button>
          <button class="btn" @click="showDeleteConfirmation = false">
            Cancel
          </button>
        </div>
      </div>
      <h3 class="mb20">Tab settings</h3>

      <div class="field mb20">
        <label class="field__label">Tab name</label>
        <input
          class="field__input"
          type="text"
          v-model="tab.name"
          placeholder="Tab name"
          ref="tabName"
        />
      </div>

      <div class="field mb20">
        <label class="field__label">
          Tab request domains
          <Tooltip> Single or comma separated domains </Tooltip>
        </label>
        <input
          class="field__input"
          type="text"
          v-model="tab.requestDomains"
          placeholder="Domains"
        />
        <label class="field__hint"
          >- Applies to all tab rules unless overridden</label
        >
      </div>

      <div class="panel__actions btn-group">
        <button @click="showDeleteConfirmation = true" class="btn">
          Delete tab
        </button>
        <button @click="cloneTab" class="btn">Clone tab</button>
      </div>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Request headers
         - {{ requestHeaderTotal }}
      </h3>
      <div class="empty" v-if="!tab.requestHeaders?.length">
        Zero request headers
      </div>

      <table class="table" v-if="tab.requestHeaders?.length">
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th>Name</th>
          <th>Value</th>
          <th>
            Url Filter
            <!-- <Tooltip>
              The pattern which is matched against the network request url
            </Tooltip> -->
          </th>
          <th>
            Domains

            <!-- <Tooltip> Single or comma separated domains </Tooltip> -->
          </th>
          <th></th>
        </tr>

        <RuleDragger
          v-for="(header, index) in tab.requestHeaders"
          :index="Number(index)"
          :tmp="requestHeadersTmp"
          :target="requestHeadersTarget"
          :total="tab.requestHeaders?.length"
          @onSetTmp="onSetRequestHeaderTmp"
          @onSetTarget="onSetRequestHeaderTarget"
          @onMoveRule="moveRequestHeaderRule"
        >
          <td class="table__short">
            <button
              class="toggle"
              @click="header.active = !header.active"
              :class="{ 'toggle--active': header.active }"
            >
              <div class="toggle__text">
                {{ header.active ? "On" : "Off" }}
              </div>
            </button>
          </td>
          <td>
            <Dropdown v-model="header.operation" :options="operationOptions" />
          </td>
          <td :colspan="header.operation !== 'remove' ? 1 : 2">
            <Editor v-model="header.name" placeholder="Header name" label="Header name" />
          </td>
          <td v-if="header.operation !== 'remove'">
            <Editor v-model="header.value" placeholder="Header value" />
          </td>
          <td>
            <Editor
              v-model="header.condition.urlFilter"
              placeholder="urlFilter"
            />
          </td>
          <td>
            <Editor
              v-model="header.condition.requestDomains"
              placeholder="Request domains"
              :aligned="'right'"
              :fallback="tab.requestDomains"
              :domains="true"
            />
          </td>
          <td class="table__short text-right">
            <DropdownMenu :options="requestActions" :rule="header" />
          </td>
        </RuleDragger>
      </table>

      <button class="btn mt10" @click="addRequestHeader()">
        Add
      </button>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Response headers - {{ responseHeaderTotal }}
      </h3>
      <div class="empty" v-if="!tab.responseHeaders?.length">
        Zero response headers
      </div>

      <table class="table" v-if="tab.responseHeaders?.length">
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th>Name</th>
          <th>Value</th>
          <th>
            Url Filter
            <!-- <Tooltip>
              The pattern which is matched against the network request url
            </Tooltip> -->
          </th>
          <th>
            Domains
            <!-- <Tooltip>Single or comma separated domains</Tooltip> -->
          </th>
          <th></th>
        </tr>
        <RuleDragger
          v-for="(header, index) in tab.responseHeaders"
          :index="Number(index)"
          :tmp="responseHeadersTmp"
          :target="responseHeadersTarget"
          :total="tab.responseHeaders?.length"
          @onSetTmp="onSetResponseHeaderTmp"
          @onSetTarget="onSetResponseHeaderTarget"
          @onMoveRule="moveResponseHeaderRule"
        >
          <td class="table__short">
            <button
              class="toggle"
              @click="header.active = !header.active"
              :class="{ 'toggle--active': header.active }"
            >
              <div class="toggle__text">
                {{ header.active ? "On" : "Off" }}
              </div>
            </button>
          </td>
          <td>
            <Dropdown v-model="header.operation" :options="operationOptions" />
          </td>
          <td :colspan="header.operation !== 'remove' ? 1 : 2">
            <Editor v-model="header.name" placeholder="Header name" />
          </td>
          <td v-if="header.operation !== 'remove'">
            <Editor v-model="header.value" placeholder="Header value" />
          </td>
          <td>
            <Editor
              v-model="header.condition.urlFilter"
              placeholder="urlFilter"
            />
          </td>
          <td>
            <Editor
              v-model="header.condition.requestDomains"
              placeholder="Request domains"
              :fallback="tab.requestDomains"
              :domains="true"
              :aligned="'right'"
            />
          </td>
          <td class="table__short text-right">
            <DropdownMenu :options="responseActions" :rule="header" />
          </td>
        </RuleDragger>
      </table>

      <button class="btn mt10" @click="addResponseHeader()">
        Add
      </button>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Block requests - {{ blockedTotal }}
      </h3>
      <div class="empty" v-if="!tab.blockedRequests?.length">
        Zero blocked requests
      </div>

      <table v-if="tab.blockedRequests?.length" class="table">
        <tr>
          <th></th>
          <th class="table__short"></th>
          <th>Type</th>
          <th>
            Url Filter
            <!-- <Tooltip>
              The pattern which is matched against the network request url
            </Tooltip> -->
          </th>
          <th>
            Domains
            <!-- <Tooltip> Single or comma separated domains</Tooltip> -->
          </th>
          <th class="table__short"></th>
        </tr>
        <RuleDragger
          v-for="(request, index) in tab.blockedRequests"
          :index="Number(index)"
          :tmp="blockedRequestsTmp"
          :target="blockedRequestsTarget"
          :total="tab.blockedRequests?.length"
          @onSetTmp="onSetBlockedTmp"
          @onSetTarget="onSetBlockedTarget"
          @onMoveRule="moveBlockedRule"
        >
          <td class="table__short">
            <button
              class="toggle"
              @click="request.active = !request.active"
              :class="{ 'toggle--active': request.active }"
            >
              <div class="toggle__text">
                {{ request.active ? "On" : "Off" }}
              </div>
            </button>
          </td>
          <td>
            <Dropdown
              v-model="request.condition.document"
              :options="blockOptions"
            />
          </td>
          <td>
            <Editor
              v-if="!request.condition.document"
              v-model="request.condition.urlFilter"
              placeholder="urlFilter"
              :locked="request.condition.document"
            />
          </td>
          <td>
            <Editor
              v-model="request.condition.requestDomains"
              placeholder="Request domains"
              :fallback="tab.requestDomains"
              :domains="true"
              :aligned="'right'"
            />
          </td>
          <td class="table__short text-right">
            <DropdownMenu :options="blockActions" :rule="request" />
          </td>
        </RuleDragger>
      </table>

      <button class="mt10 btn" @click="addBlockedRequest()">
        Add
      </button>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Redirect requests - {{ redirectedTotal }}
      </h3>
      <div class="empty" v-if="!tab.redirectRequests?.length">
        Zero redirect requests
      </div>

      <table v-if="tab.redirectRequests?.length" class="table">
        <tr>
          <th></th>
          <th class="table__short"></th>
          <th>
            Url Filter
            <!-- <Tooltip>
              The pattern which is matched against the network request url
            </Tooltip> -->
          </th>
          <th>
            Destination
            <!-- <Tooltip> An absolute destination Url </Tooltip> -->
          </th>
          <th>
            Domains
            <!-- <Tooltip> Single or comma separated domains</Tooltip> -->
          </th>
          <th class="table__short"></th>
        </tr>
        <!-- <tr v-for="request in tab.redirectRequests"> -->
        <RuleDragger
          v-for="(request, index) in tab.redirectRequests"
          :index="Number(index)"
          :tmp="redirectRequestsTmp"
          :target="redirectRequestsTarget"
          :total="tab.redirectRequests?.length"
          @onSetTmp="onSetRedirectTmp"
          @onSetTarget="onSetRedirectTarget"
          @onMoveRule="moveRedirectRule"
        >
          <td class="table__short">
            <button
              class="toggle"
              @click="request.active = !request.active"
              :class="{ 'toggle--active': request.active }"
            >
              <div class="toggle__text">
                {{ request.active ? "On" : "Off" }}
              </div>
            </button>
          </td>
          <td>
            <Editor
              v-model="request.condition.urlFilter"
              placeholder="urlFilter"
            />
          </td>
          <td>
            <Editor v-model="request.url" placeholder="Url" />
          </td>
          <td>
            <Editor
              v-model="request.condition.requestDomains"
              placeholder="Request domains"
              :fallback="tab.requestDomains"
              :domains="true"
              :aligned="'right'"
            />
          </td>
          <td class="table__short text-right">
            <DropdownMenu :options="redirectActions" :rule="request" />
          </td>
        </RuleDragger>
      </table>

      <button class="mt10 btn" @click="addRedirectRequest()">
        Add
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed, onMounted, nextTick } from "vue";
import type { Ref } from "vue";

import Editor from "./Editor.vue";
import Dropdown from "./Dropdown.vue";
import DropdownMenu from "./DropdownMenu.vue";
import Tooltip from "./Tooltip.vue";
import RuleDragger from "./RuleDragger.vue";

const props = defineProps({
  tab: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["deleteTab", "cloneTab"]);

const { tab } = toRefs(props);
const tabName: Ref<HTMLInputElement | null> = ref(null);

const requestActions = [
  {
    label: "Delete",
    confirm: true,
    action: (rule:any) => {
      deleteRequestHeader(rule)
    },
  },
  {
    label: "Copy to clipboard",
    action: (rule: any) => {
      showToast(`${rule.name}${rule.value ? ':' + rule.value : ''}`);
    },
  }
];

const responseActions = [
  {
    label: "Delete",
    confirm: true,
    action: (rule:any) => {
      deleteResponseHeader(rule)
    },
  },
  {
    label: "Copy to clipboard",
    action: (rule: any) => {
      showToast(`${rule.name}${rule.value ? ':' + rule.value : ''}`);
    },
  }
];

const blockActions = [
  {
    label: "Delete",
    confirm: true,
    action: (rule:any) => {
      deleteBlockRequest(rule)
    },
  }
];

const redirectActions = [
  {
    label: "Delete",
    confirm: true,
    action: (rule:any) => {
      deleteRedirectRequest(rule)
    },
  }
];

const operationOptions = [
  {
    label: "Set",
    value: "set",
  },
  {
    label: "Remove",
    value: "remove",
  },
];

const blockOptions = [
  {
    label: "Assets",
    value: false,
  },
  {
    label: "Domain",
    value: true,
  },
];

/**
 * reactive
 */
const showSettings = ref(false);
const showDeleteConfirmation = ref(false);

const requestHeadersTmp = ref(-1);
const requestHeadersTarget = ref(-1);

const responseHeadersTmp = ref(-1);
const responseHeadersTarget = ref(-1);

const blockedRequestsTmp = ref(-1);
const blockedRequestsTarget = ref(-1);

const redirectRequestsTmp = ref(-1);
const redirectRequestsTarget = ref(-1);
const toast = ref({
  active: false,
  message: ""
});

/**
 * computed
 */
const blockedTotal = computed(() => {
  return (
    tab.value.blockedRequests?.filter((request: any) => request.active)
      .length || 0
  );
});

const redirectedTotal = computed(() => {
  return (
    tab.value.redirectRequests?.filter((request: any) => request.active)
      .length || 0
  );
});

const requestHeaderTotal = computed(() => {
  return (
    tab.value.requestHeaders?.filter((request: any) => request.active).length ||
    0
  );
});

const responseHeaderTotal = computed(() => {
  return (
    tab.value.responseHeaders?.filter((request: any) => request.active)
      .length || 0
  );
});

/**
 * methods
 */

async function showToast(text: string) {
  try {
    await navigator.clipboard.writeText(text).then(() => {
      toast.value.message = "Copied to clipboard...";
      toast.value.active = true;
      hideToast();
    });
  } catch (error) {
    toast.value.message = "Couldn't copy to clipboard...";
    toast.value.active = true;
    hideToast();
  }
}

let timer: ReturnType<typeof setTimeout> = setTimeout(() => {});

function hideToast() {
  clearTimeout(timer);

  timer = window.setTimeout(() => {
    toast.value.active = false;
  }, 3000)
}

// request header specifics
function onSetRequestHeaderTmp(tmp: number) {
  requestHeadersTmp.value = tmp;
}
function onSetRequestHeaderTarget(tmp: number) {
  requestHeadersTarget.value = tmp;
}

function moveRequestHeaderRule(from: number, to: number) {
  const rule = tab.value.requestHeaders[from];

  tab.value.requestHeaders.splice(from, 1);
  tab.value.requestHeaders.splice(to, 0, rule);
}

// response headers specifics
function onSetResponseHeaderTmp(tmp: number) {
  responseHeadersTmp.value = tmp;
}
function onSetResponseHeaderTarget(tmp: number) {
  responseHeadersTarget.value = tmp;
}


function moveResponseHeaderRule(from: number, to: number) {
  const rule = tab.value.responseHeaders[from];

  tab.value.responseHeaders.splice(from, 1);
  tab.value.responseHeaders.splice(to, 0, rule);
}

// blocked request specifics
function onSetBlockedTmp(tmp: number) {
  blockedRequestsTmp.value = tmp;
}
function onSetBlockedTarget(tmp: number) {
  blockedRequestsTarget.value = tmp;
}

function moveBlockedRule(from: number, to: number) {
  const rule = tab.value.blockedRequests[from];

  tab.value.blockedRequests.splice(from, 1);
  tab.value.blockedRequests.splice(to, 0, rule);
}

// redirect requests specifics
function onSetRedirectTmp(tmp: number) {
  redirectRequestsTmp.value = tmp;
}
function onSetRedirectTarget(tmp: number) {
  redirectRequestsTarget.value = tmp;
}

function moveRedirectRule(from: number, to: number) {
  const rule = tab.value.redirectRequests[from];

  tab.value.redirectRequests.splice(from, 1);
  tab.value.redirectRequests.splice(to, 0, rule);
}

function deleteTab() {
  emit("deleteTab", tab?.value);
}

function cloneTab() {
  emit("cloneTab", tab.value);
}

function addRequestHeader() {
  tab.value.requestHeaders.push({
    active: true,
    name: "",
    value: "",
    condition: {
      urlFilter: "",
      requestDomains: "",
    },
  });
}

function addResponseHeader() {
  tab.value.responseHeaders.push({
    active: true,
    name: "",
    value: "",
    condition: {
      urlFilter: "",
      requestDomains: "",
    },
  });
}

function addBlockedRequest() {
  tab.value.blockedRequests.push({
    active: true,
    condition: {
      urlFilter: "",
      requestDomains: "",
      document: false,
    },
  });
}

function addRedirectRequest() {
  if (!tab.value.redirectRequests) {
    tab.value.redirectRequests = [];
  }

  tab.value.redirectRequests.push({
    active: true,
    url: "",
    condition: {
      urlFilter: "",
      requestDomains: "",
    },
  });
}

function deleteRequestHeader(targetHeader: any) {
  tab.value.requestHeaders = tab.value.requestHeaders.filter(
    (header: any) => header !== targetHeader
  );
}

function deleteResponseHeader(targetHeader: any) {
  tab.value.responseHeaders = tab.value.responseHeaders.filter(
    (header: any) => header !== targetHeader
  );
}

function deleteBlockRequest(targetRequest: any) {
  tab.value.blockedRequests = tab.value.blockedRequests.filter(
    (request: any) => request !== targetRequest
  );
}

function deleteRedirectRequest(targetRequest: any) {
  tab.value.redirectRequests = tab.value.redirectRequests.filter(
    (request: any) => request !== targetRequest
  );
}

/**
 * lifecycle hooks
 */

onMounted(() => {
  if (tab.value.name === "New tab" || tab.value.name === "Cloned tab") {
    showSettings.value = true;

    nextTick(() => {
      tabName.value?.focus();
      tabName.value?.select();
    });
  }
});
</script>

<template>
  <div class="tab" :class="{ 'tab--active': tab.active }">
    <div class="folder__header mb10">
      <h3>Tab ({{ tab.name }})</h3>
      <button @click="showSettings = !showSettings" class="btn-icon" :class="{ 'btn-icon--active': showSettings }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
          class="bi bi-gear-wide-connected" viewBox="0 0 16 16">
          <path
            d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z" />
        </svg>
      </button>
    </div>
    <!-- <button
      @click="showSettings = !showSettings"
      class="btn mb20"
      :class="{ 'btn--active': showSettings }"
    >
      Tab settings
    </button> -->

    <div v-if="showSettings" class="panel">
      <div class="panel__close">
        <button class="btn-icon" @click="showSettings = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
            viewBox="0 0 16 16">
            <path
              d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
        </button>
      </div>

      <div v-if="showDeleteConfirmation" class="panel__modal">
        <h3 class="mb10">Confirm tab deletion</h3>
        <div class="panel__modal__actions">
          <button class="btn btn--danger" @click="deleteTab">Delete</button>
          <button class="btn" @click="showDeleteConfirmation = false">Cancel</button>
        </div>
      </div>
      <h3 class="mb20">Tab settings</h3>

      <div class="field mb20">
        <label class="field__label">Tab name</label>
        <input class="field__input" type="text" v-model="tab.name" placeholder="Tab name" />
      </div>
      <div>
        <button @click="showDeleteConfirmation = true" class="btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
            viewBox="0 0 16 16">
            <path
              d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
          Delete tab
        </button>
      </div>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Add request headers
        <div class="badge">{{ requestHeaderTotal }}</div>
      </h3>
      <div class="empty" v-if="!tab.requestHeaders.length">
        No request headers
      </div>

      <table class="table" v-if="tab.requestHeaders.length">
        <tr>
          <th></th>
          <th>Header name</th>
          <th>Header value</th>
          <th>Url Filter</th>
          <th>Domains</th>
          <th></th>
        </tr>
        <tr v-for="header in tab.requestHeaders">
          <td class="table__short">
            <button class="toggle" @click="header.active = !header.active" :class="{ 'toggle--active': header.active }">
              <div class="toggle__text">
                {{ header.active ? "On" : "Off" }}
              </div>
            </button>
          </td>
          <td>
            <Editor v-model="header.name" placeholder="Header name" />
          </td>
          <td>
            <Editor v-model="header.value" placeholder="Header value" />
          </td>
          <td>
            <Editor v-model="header.condition.urlFilter" placeholder="urlFilter" />
          </td>
          <td>
            <Editor v-model="header.condition.requestDomains" placeholder="Request domains" />
          </td>
          <td class="table__short text-right">
            <button class="btn-icon" @click="deleteRequestHeader(header)" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
                viewBox="0 0 16 16">
                <path
                  d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
              </svg>
            </button>
          </td>
        </tr>
      </table>

      <button class="btn mt10" @click="addRequestHeader(tab)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg"
          viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
        </svg>
        Add request header
      </button>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Add response headers
        <div class="badge">{{ responseHeaderTotal }}</div>
      </h3>
      <div class="empty" v-if="!tab.responseHeaders.length">
        No response headers
      </div>

      <table class="table" v-if="tab.responseHeaders.length">
        <tr>
          <th></th>
          <th>Header name</th>
          <th>Header value</th>
          <th>Url Filter</th>
          <th>Domains</th>
          <th></th>
        </tr>
        <tr v-for="header in tab.responseHeaders">
          <td class="table__short">
            <button class="toggle" @click="header.active = !header.active" :class="{ 'toggle--active': header.active }">
              <div class="toggle__text">
                {{ header.active ? "On" : "Off" }}
              </div>
            </button>
          </td>
          <td>
            <Editor v-model="header.name" placeholder="Header name" />
          </td>
          <td>
            <Editor v-model="header.value" placeholder="Header value" />
          </td>
          <td>
            <Editor v-model="header.condition.urlFilter" placeholder="urlFilter" />
          </td>
          <td>
            <Editor v-model="header.condition.requestDomains" placeholder="Request domains" />
          </td>
          <td class="table__short text-right">
            <button class="btn-icon" @click="deleteResponseHeader(header)" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
                viewBox="0 0 16 16">
                <path
                  d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
              </svg>
            </button>
          </td>
        </tr>
      </table>

      <button class="btn mt10" @click="addResponseHeader(tab)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg"
          viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
        </svg>
        Add response header
      </button>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Block requests
        <div class="badge">{{ blockedTotal }}</div>
      </h3>
      <div class="empty" v-if="!tab.blockedRequests.length">
        No blocked requests
      </div>

      <table v-if="tab.blockedRequests.length" class="table">
        <tr>
          <th class="table__short"></th>
          <th>Url Filter</th>
          <th>Domains</th>
          <th title="Block document">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-window-x"
              viewBox="0 0 16 16">
              <path
                d="M2.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M4 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
              <path
                d="M0 4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4a.5.5 0 0 1-1 0V7H1v5a1 1 0 0 0 1 1h5.5a.5.5 0 0 1 0 1H2a2 2 0 0 1-2-2zm1 2h13V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1z" />
              <path
                d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-4.854-1.354a.5.5 0 0 0 0 .708l.647.646-.647.646a.5.5 0 0 0 .708.708l.646-.647.646.647a.5.5 0 0 0 .708-.708l-.647-.646.647-.646a.5.5 0 0 0-.708-.708l-.646.647-.646-.647a.5.5 0 0 0-.708 0" />
            </svg>
          </th>
          <th class="table__short"></th>
        </tr>
        <tr v-for="request in tab.blockedRequests">
          <td class="table__short">
            <button class="toggle" @click="request.active = !request.active"
              :class="{ 'toggle--active': request.active }">
              <div class="toggle__text">
                {{ request.active ? "On" : "Off" }}
              </div>
            </button>
          </td>
          <td>
            <Editor v-model="request.condition.urlFilter" placeholder="urlFilter"
              :locked="request.condition.document" />
          </td>
          <td>
            <Editor v-model="request.condition.requestDomains" placeholder="Request domains" />
          </td>
          <td>
            <button class="checkbox" @click="request.condition.document = !request.condition.document"
              :class="{ 'checkbox--active': request.condition.document }">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg"
                viewBox="0 0 16 16">
                <path
                  d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
              </svg>
            </button>
          </td>
          <td class="table__short text-right">
            <button class="btn-icon" @click="deleteBlockRequest(request)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
                viewBox="0 0 16 16">
                <path
                  d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
              </svg>
            </button>
          </td>
        </tr>
      </table>

      <button class="mt10 btn" @click="addBlockedRequest(tab)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg"
          viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
        </svg>
        Add request
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Editor from "./Editor.vue";

const props = defineProps(["tab"]);
const emit = defineEmits(["deleteTab"]);

const tab = props.tab;

/**
 * reactive
 */
const showSettings = ref(false);
const showDeleteConfirmation = ref(false);

/**
 * computed
 */
const blockedTotal = computed(() => {
  return tab.blockedRequests.filter((request: any) => request.active).length;
});

const requestHeaderTotal = computed(() => {
  return tab.requestHeaders.filter((request: any) => request.active).length;
});

const responseHeaderTotal = computed(() => {
  return tab.responseHeaders.filter((request: any) => request.active).length;
});

/**
 * methods
 */
function deleteTab() {
  emit("deleteTab", tab);
}

function addRequestHeader(tab: any) {
  tab.requestHeaders.push({
    active: true,
    name: "",
    value: "",
    condition: {
      urlFilter: "",
      requestDomains: "",
    },
  });
}

function addResponseHeader(tab: any) {
  tab.responseHeaders.push({
    active: true,
    name: "",
    value: "",
    condition: {
      urlFilter: "",
      requestDomains: "",
    },
  });
}

function addBlockedRequest(tab: any) {
  tab.blockedRequests.push({
    active: true,
    condition: {
      urlFilter: "",
      requestDomains: "",
      document: false,
    },
  });
}

function deleteRequestHeader(targetHeader: any) {
  tab.requestHeaders = tab.requestHeaders.filter(
    (header: any) => header !== targetHeader
  );
}

function deleteResponseHeader(targetHeader: any) {
  tab.responseHeaders = tab.responseHeaders.filter(
    (header: any) => header !== targetHeader
  );
}

function deleteBlockRequest(targetRequest: any) {
  tab.blockedRequests = tab.blockedRequests.filter(
    (request: any) => request !== targetRequest
  );
}
</script>

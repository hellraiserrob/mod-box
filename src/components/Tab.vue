<template>
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
        <div class="badge">{{ requestHeaderTotal }}</div>
      </h3>
      <div class="empty" v-if="!tab.requestHeaders?.length">
        No request headers
      </div>

      <table class="table" v-if="tab.requestHeaders?.length">
        <tr>
          <th></th>
          <th></th>
          <th>Name</th>
          <th>Value</th>
          <th>
            Url Filter
            <Tooltip>
              The pattern which is matched against the network request url
            </Tooltip>
          </th>
          <th>
            Domains

            <Tooltip> Single or comma separated domains </Tooltip>
          </th>
          <th></th>
        </tr>
        <tr v-for="header in tab.requestHeaders">
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
            />
          </td>
          <td class="table__short text-right">
            <button
              class="btn-icon"
              @click="deleteRequestHeader(header)"
              title="Delete"
            >
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
          </td>
        </tr>
      </table>

      <button class="btn mt10" @click="addRequestHeader()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-plus-lg"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
          />
        </svg>
        Add
      </button>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Response headers
        <div class="badge">{{ responseHeaderTotal }}</div>
      </h3>
      <div class="empty" v-if="!tab.responseHeaders?.length">
        No response headers
      </div>

      <table class="table" v-if="tab.responseHeaders?.length">
        <tr>
          <th></th>
          <th></th>
          <th>Name</th>
          <th>Value</th>
          <th>
            Url Filter
            <Tooltip>
              The pattern which is matched against the network request url
            </Tooltip>
          </th>
          <th>
            Domains
            <Tooltip>Single or comma separated domains</Tooltip>
          </th>
          <th></th>
        </tr>
        <tr v-for="header in tab.responseHeaders">
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
            />
          </td>
          <td class="table__short text-right">
            <button
              class="btn-icon"
              @click="deleteResponseHeader(header)"
              title="Delete"
            >
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
          </td>
        </tr>
      </table>

      <button class="btn mt10" @click="addResponseHeader()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-plus-lg"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
          />
        </svg>
        Add
      </button>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Block requests
        <div class="badge">{{ blockedTotal }}</div>
      </h3>
      <div class="empty" v-if="!tab.blockedRequests?.length">
        No blocked requests
      </div>

      <table v-if="tab.blockedRequests?.length" class="table">
        <tr>
          <th class="table__short"></th>
          <th>Type</th>
          <th>
            Url Filter
            <Tooltip>
              The pattern which is matched against the network request url
            </Tooltip>
          </th>
          <th>
            Domains
            <Tooltip> Single or comma separated domains</Tooltip>
          </th>
          <th class="table__short"></th>
        </tr>
        <tr v-for="request in tab.blockedRequests">
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
            />
          </td>
          <td class="table__short text-right">
            <button class="btn-icon" @click="deleteBlockRequest(request)">
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
          </td>
        </tr>
      </table>

      <button class="mt10 btn" @click="addBlockedRequest()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-plus-lg"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
          />
        </svg>
        Add
      </button>
    </div>

    <div class="panel">
      <h3 class="mb10">
        Redirect requests
        <div class="badge">{{ redirectedTotal }}</div>
      </h3>
      <div class="empty" v-if="!tab.redirectRequests?.length">
        No redirect requests
      </div>

      <table v-if="tab.redirectRequests?.length" class="table">
        <tr>
          <th class="table__short"></th>
          <th>
            Url Filter
            <Tooltip>
              The pattern which is matched against the network request url
            </Tooltip>
          </th>
          <th>
            Domains
            <Tooltip> Single or comma separated domains</Tooltip>
          </th>
          <th>
            Destination
            <Tooltip> An absolute destination Url </Tooltip>
          </th>
          <th class="table__short"></th>
        </tr>
        <tr v-for="request in tab.redirectRequests">
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
            <Editor
              v-model="request.condition.requestDomains"
              placeholder="Request domains"
              :fallback="tab.requestDomains"
              :domains="true"
            />
          </td>
          <td>
            <Editor v-model="request.url" placeholder="Url" />
          </td>
          <td class="table__short text-right">
            <button class="btn-icon" @click="deleteRedirectRequest(request)">
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
          </td>
        </tr>
      </table>

      <button class="mt10 btn" @click="addRedirectRequest()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-plus-lg"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
          />
        </svg>
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
import Tooltip from "./Tooltip.vue";

const props = defineProps({
  tab: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["deleteTab", "cloneTab"]);

const { tab } = toRefs(props);
const tabName: Ref<HTMLInputElement | null> = ref(null);

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

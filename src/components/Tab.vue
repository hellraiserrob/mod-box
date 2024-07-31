<template>
  <div class="tab" :class="{'tab--active' : tab.active }">
    <button @click="showSettings = !showSettings" class="btn mb20" :class="{ 'btn--active': showSettings }">
      Tab settings
    </button>

    <div v-if="showSettings" class="panel">
      <h2 class="mb20">Tab settings</h2>

      <div class="field mb20">
        <label class="field__label">Tab name</label>
        <input class="field__input" type="text" v-model="tab.name" placeholder="Tab name">
      </div>
      <div>
        <button @click="deleteTab" class="btn">
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
            <path
              d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z" />
          </svg>
          Delete tab
        </button>
      </div>
    </div>

    <div class="panel">
      <h2 class="mb20">Block requests <div class="badge">{{ blockedTotal }}</div></h2>
      <div class="empty" v-if="!tab.blockedRequests.length">No blocked requests</div>

      <table v-if="tab.blockedRequests.length" class="table">
        <tr>
          <th>Enabled</th>
          <th>Url Filter</th>
          <th>Domains</th>
          <th></th>
        </tr>
        <tr v-for="(request) in tab.blockedRequests">
          <td>
            <button class="toggle toggle--large" @click="request.active = !request.active"
              :class="{ 'toggle--active': request.active }">
              <div class="toggle__text">
                {{ request.active ? "On" : "Off" }}
              </div>
            </button>
          </td>
          <td>
            <div class="field field--table">
              <input class="field__input" type="text" v-model="request.condition.urlFilter" placeholder="urlFilter" />
            </div>
          </td>
          <td>
            <div class="field field--table">
              <input class="field__input" type="text" v-model="request.condition.requestDomains"
                placeholder="request domains" />
            </div>
          </td>
          <td class="text-right">
            <button class="btn" @click="deleteBlockRequest(request)">
              Delete
            </button>
          </td>
        </tr>
      </table>

      <button class="mt20 btn" @click="addBlockedRequest(tab)">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
          <path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z" />
        </svg>
        Add request
      </button>
    </div>

    <div class="panel">
      <h2 class="mb20">Request headers  <div class="badge">{{ requestHeaderTotal }}</div></h2>
      <div class="empty" v-if="!tab.requestHeaders.length">
        No request headers
      </div>

      <table class="table" v-if="tab.requestHeaders.length">
        <tr>
          <th>Enabled</th>
          <th>Header name</th>
          <th>Header value</th>
          <th>Url Filter</th>
          <th></th>
        </tr>
        <tr v-for="(header) in tab.requestHeaders">
          <td>
            <div class="field">
              <button class="toggle toggle--large" @click="header.active = !header.active"
                :class="{ 'toggle--active': header.active }">
                <div class="toggle__text">
                  {{ header.active ? "On" : "Off" }}
                </div>
              </button>
            </div>
          </td>
          <td>
            <div class="field field--table">
              <input class="field__input" type="text" v-model="header.name" placeholder="Header name" />
            </div>
          </td>
          <td>
            <div class="field field--table">
              <input class="field__input" type="text" v-model="header.value" placeholder="Header value" />
            </div>
          </td>
          <td>
            <div class="field field--table">
              <input class="field__input" type="text" v-model="header.condition.urlFilter" placeholder="urlFilter" />
            </div>
          </td>
          <td>
            <button class="btn-icon" @click="deleteRequestHeader(header)" title="Delete">
              <svg width="30" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m22 6c0-.552-.448-1-1-1h-12.628c-.437 0-.853.191-1.138.523-1.078 1.256-3.811 4.439-4.993 5.815-.16.187-.241.419-.241.651 0 .231.08.463.24.651 1.181 1.38 3.915 4.575 4.994 5.835.285.333.701.525 1.14.525h12.626c.552 0 1-.448 1-1 0-2.577 0-9.423 0-12zm-13.628.5h12.128v11h-12.126l-4.715-5.51zm5.637 4.427 1.71-1.71c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.384-.219.531l-1.711 1.711 1.728 1.728c.147.147.22.339.22.53 0 .427-.349.751-.75.751-.192 0-.384-.073-.531-.219l-1.728-1.729-1.728 1.729c-.146.146-.339.219-.531.219-.401 0-.75-.324-.75-.751 0-.191.073-.383.22-.53l1.728-1.728-1.788-1.787c-.146-.148-.219-.339-.219-.532 0-.425.346-.749.751-.749.192 0 .384.073.53.219z" fill-rule="nonzero"/></svg>
            </button>
          </td>
        </tr>
      </table>

      <button class="btn mt20" @click="addRequestHeader(tab)">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
          <path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z" />
        </svg>
        Add request header
      </button>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed } from "vue"
const props = defineProps(['tab'])
const emit = defineEmits(["deleteTab"])


const tab = props.tab;

/**
 * reactive
 */
const showSettings = ref(false);

/**
 * computed
 */
const blockedTotal = computed(() => {
  return tab.blockedRequests.filter((request:any) => request.active).length;
})

const requestHeaderTotal = computed(() => {
  return tab.requestHeaders.filter((request:any) => request.active).length;
})

/**
 * methods
 */
function deleteTab() {
  emit("deleteTab", tab)
}

function addRequestHeader(tab: any) {
  tab.requestHeaders.push({
    active: true,
    name: "",
    value: "",
    condition: {
      urlFilter: ""
    }
  })
}

function addBlockedRequest(tab: any) {
  tab.blockedRequests.push({
    active: true,
    condition: {
      urlFilter: ""
    }
  })
}

function deleteRequestHeader(targetHeader: any) {
  tab.requestHeaders = tab.requestHeaders.filter((header: any) => header !== targetHeader)
}

function deleteBlockRequest(targetRequest: any) {
  tab.blockedRequests = tab.blockedRequests.filter((request: any) => request !== targetRequest)
}

</script>
<script setup>
import { ref } from 'vue'
import { HeroProvider } from 'hero-motion'
import { Tab, Tabs } from './components/Tabs'

const activeTab = ref('A')

function onSelect(value) {
  activeTab.value = value
}
</script>

<template>
  <HeroProvider>
    <div class="p-6 flex flex-col gap-3">
      <Tabs>
        <Tab :is-active="activeTab === 'A'" @click="onSelect('A')">
          TabA
        </Tab>
        <Tab :is-active="activeTab === 'B'" @click="onSelect('B')">
          TabB
        </Tab>
      </Tabs>

      <RouterView />
    </div>
  </HeroProvider>
</template>

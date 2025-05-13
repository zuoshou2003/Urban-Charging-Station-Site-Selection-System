<template>
  <div class="app">
    <MapView ref="mapView" />
  </div>
</template>

<script>
import MapView from './components/MapView.vue'

export default {
  name: 'App',
  components: {
    MapView
  }
}
</script>

<style>
.app {
  height: 100%;
}
</style>

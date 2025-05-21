<template>
  <div class="tab-panel">
    <div class="title-container">
      <div class="decorative-line"></div>
      <h2 class="title">Raw Power</h2>
    </div>
    <div class="content">
      <p class="description">
        1996-2000 featured unrestricted 3.0L V10 engines
        reaching 19,000 RPM, until 1998 regulations
        mandated narrower 1.6m-wide cars and grooved
        tires, cutting mechanical grip by 20%.
      </p>
      <div class="year-range">1999-2000</div>
      <img
        src="/path/to/f1-car-image.png"
        alt="F1 Car"
        class="f1-car-image"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
}
const props = withDefaults(defineProps<Props>(), {
  label: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()
</script>

<style scoped lang="sass">
.tab-panel
  background-color: #1a1a1a // Dark background similar to image
  color: #fff // White text
  padding: 20px
  font-family: sans-serif
  border-left: 2px solid #444 // Simulating the left border/line

.title-container
  display: flex
  align-items: center
  margin-bottom: 15px

.decorative-line
  width: 2px
  height: 40px // Adjust as needed
  background-color: #fff
  margin-right: 10px
  position: relative
  // This is a simplified line, the one in image is more complex with a dot
  &::before
    content: ''
    position: absolute
    top: -5px // Adjust to center the dot
    left: -4px // Adjust to center the dot
    width: 10px
    height: 10px
    background-color: #fff
    border-radius: 50%
    border: 2px solid #1a1a1a // To make it look like a ring if needed or match bg

.title
  border: 1px solid #fff
  padding: 5px 10px
  font-size: 1.5em
  margin: 0 // Reset margin

.content
  padding-left: 20px // Indent content from the decorative line

.description
  font-size: 0.9em
  line-height: 1.6
  margin-bottom: 10px

.year-range
  font-size: 1.2em
  font-weight: bold
  margin-bottom: 15px
  color: #aaa // Lighter text for the year

.f1-car-image
  width: 150px // Adjust as needed
  height: auto
  display: block // To allow margin auto if needed or just to be a block
</style>

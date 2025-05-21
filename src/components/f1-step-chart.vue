<!-- <template></template> -->

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
</style>

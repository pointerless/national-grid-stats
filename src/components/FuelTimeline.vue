
<script>
import { Line } from "vue-chartjs";

  export default {
    extends: Line,
    name: "FuelTimeline",
    props: {
      chartData: Object,
      options: Object
    },
    mounted(){
      this.renderChart(this.chartData, this.options)
    }
  }
</script>

<style scoped>

</style>
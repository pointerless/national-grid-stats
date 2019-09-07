
<script>
import { Pie, mixins } from "vue-chartjs";

export default {
  mixins: [mixins.reactiveProp],
  extends: Pie,
  name: 'FuelPie',
  props: {
    options: Object
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
  }
}
</script>

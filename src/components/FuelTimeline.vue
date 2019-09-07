
<script>
import { Line, mixins } from "vue-chartjs";

  export default {
    mixins: [mixins.reactiveProp],
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

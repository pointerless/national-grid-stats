
<script>
import { Line, mixins } from "vue-chartjs";
import zoom from 'chartjs-plugin-zoom';

  export default {
    mixins: [mixins.reactiveProp],
    extends: Line,
    name: "FuelTimeline",
    props: {
      options: Object
    },
    mounted(){
      this.addPlugin(zoom);
      this.renderChart(this.chartData, this.options)
    }
  }
</script>

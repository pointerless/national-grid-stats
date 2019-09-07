<template>
  <div id="app">
    <h2>Fuel Generation for UK National Grid ({{loadedTime}})</h2>
    <b-tabs v-if="loaded">
      <b-tab title="Current" active>
        <h3>Data for {{ dateGen }} {{ timeGen }}</h3>
        <FuelPie class="small-pie" :chart-data="generationDataOut" :options="pieOptions"/>
      </b-tab>
      <b-tab title="Past 24h">
        <h1></h1>
        <FuelTimeline class="fuel-timeline" :chart-data="timelineDataOut" :options="lineOptions"/>
      </b-tab>
    </b-tabs>
    <div class="text-center" v-if="!loaded">
      <b-spinner variant="primary" style="width: 20vh; height: 20vh"></b-spinner>
    </div>
  </div>
</template>

<script>
import cron from "node-cron";
import FuelPie from "@/components/FuelPie";
import FuelTimeline from "@/components/FuelTimeline";
import {getGeneration, fuelColor, fuelSort, getGenerationTimeline} from "@/services/CarbonIntensityAPI";

export default {
  name: 'app',
  data() {
    return {
      loadedTime: "",
      loaded: false,
      lineOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
                max: 100,
              },
              stacked: true
            }
          ],
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'hour'
              }
            }
          ]
        }
      },
      dateLineStart: "",
      dateLineEnd: "",
      timeGen: "",
      dateGen: "",
      timelineData: {
        datasets: [

        ]
      },
      generationData: {
        datasets: [{
          data: [],
          backgroundColor: []
        }],
        labels: [
        ]
      },
      pieOptions: {
        responsive: true,
        maintainAspectRatio: true,
      },
    }
  },
  computed: {
    generationDataOut(){
      return this.generationData;
    },
    timelineDataOut(){
      return this.timelineData;
    }
  },
  components: {
    FuelPie,
    FuelTimeline
  },
  methods: {
    async generationLoad(){
      console.log("Reloading Current");
      await getGeneration()
        .then(value => {
          if(value !== null) {
            const tempGenData = {
              datasets: [{
                data: [],
                backgroundColor: []
              }],
              labels: []
            };
            const fromTemp = new Date(value["data"]["from"]);
            const toTemp = new Date(value["data"]["to"]);
            if(fromTemp.toLocaleDateString() === toTemp.toLocaleDateString())
              this.dateGen = fromTemp.toLocaleDateString();
            else
              this.dateGen = `${fromTemp.toLocaleDateString()}/${toTemp.toLocaleDateString()}`;
            this.timeGen = `${fromTemp.toLocaleTimeString()} - ${toTemp.toLocaleTimeString()}`;
            value["data"]["generationmix"].sort((a, b) => {
              return fuelSort(a["fuel"]) - fuelSort(b["fuel"]);
            }).forEach(fuelType => {
              tempGenData.datasets[0].data.push(fuelType["perc"]);
              tempGenData.datasets[0].backgroundColor.push(fuelColor(fuelType["fuel"]));
              tempGenData.labels.push(fuelType["fuel"]);
            });
            this.generationData = tempGenData;
          }
        });
      return Promise.resolve(true);
    },
    async timelineLoad(){
      console.log("Reloading 24h");
      await getGenerationTimeline()
        .then(value => {
          if(value !== null) {
            const tempTimData = {
              datasets: []
            };
            let indexStore = {};
            value["data"].forEach(dataEntry => {
              dataEntry["generationmix"].forEach(fuelType => {
                if(!(fuelType["fuel"] in indexStore)){
                  tempTimData.datasets.push({
                    label: fuelType["fuel"],
                    data: [{x: new Date(dataEntry["to"]), y: fuelType["perc"]}],
                    backgroundColor: fuelColor(fuelType["fuel"])
                  });
                  indexStore[fuelType["fuel"]] = tempTimData.datasets.length-1;
                } else {
                  tempTimData.datasets[indexStore[fuelType["fuel"]]]["data"]
                    .push({x: new Date(dataEntry["to"]), y: fuelType["perc"]})
                }
              });
            });
            tempTimData.datasets.sort((a, b) => {
              return fuelSort(a["label"]) - fuelSort(b["label"]);
            });
            this.timelineData = tempTimData;
          }
        });
      return Promise.resolve(true);
    },
    async refreshData(){
      const dateNow = new Date();
      this.loadedTime = `${dateNow.toLocaleDateString()} ${dateNow.toLocaleTimeString()}`;
      await Promise.all([this.generationLoad(), this.timelineLoad()])
        .then((results) => {
          if(results[0] && results[1]) this.loaded = true;
        });
    }
  },
  async mounted() {
    this.loaded = false;
    this.refreshData();
    cron.schedule("1,31 * * * *", this.refreshData, {});
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.small-pie {
  margin: 0 auto;
  width: 70vh;
}
.fuel-timeline{
  position: relative;
  height: 75vh;
  width: 99%;
}
</style>

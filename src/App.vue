<template>
  <div id="app">
    <h2>Fuel Generation for UK National Grid ({{loadedTime}})</h2>
    <b-tabs v-if="loaded">
      <b-tab title="Current" active>
        <h3>Data for {{ dateGen }} {{ timeGen }}</h3>
        <FuelPie class="small-pie" :chart-data="generationDataOut" :options="pieOptions"/>
      </b-tab>
      <b-tab title="Past 24h">
        <FuelTimeline class="fuel-timeline" :chart-data="timelineDataOut" :options="lineOptions"/>
      </b-tab>
      <b-tab title="Date Range">
        <b-container>
          <b-row>
            <b-col>
              <b-form-datepicker v-model="adjustStart" id="adjust-start" placeholder="Start Date" value-as-date
                                :min="minAdjust" :max="adjustEnd"/>
            </b-col>
            <b-col>
              <h5>Max. 30 days. Future is predicted</h5>
            </b-col>
            <b-col>
              <b-form-datepicker v-model="adjustEnd" id="adjust-end" placeholder="End Date" value-as-date
                                 :min="adjustStart" :max="maxAdjust"/>
            </b-col>
          </b-row>
        </b-container>
        <FuelTimeline class="fuel-timeline-adjust" :chart-data="adjustTimelineDataOut" :options="lineOptions"/>
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
import {getGeneration, fuelColor, fuelSort, getGenerationTimeline, getGenerationAdjustTimeline} from "@/services/CarbonIntensityAPI";

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
                fontColor: "wheat"
              },
              stacked: true
            }
          ],
          xAxes: [
            {
              ticks: {
                fontColor: "wheat"
              },
              type: 'time',
              time: {
                unit: 'hour'
              }
            }
          ]
        },
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              rangeMin: {
              },
              rangeMax: {
              }
            },
            zoom: {
              enabled: true,
              mode: 'x',
              rangeMin: {
              },
              rangeMax: {

              }
            }
          }
        },
        legend: {
          labels: {
            fontColor: "wheat",
          }
        }
      },
      lineOptionsAdjust: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
                max: 100,
                fontColor: "wheat"
              },
              stacked: true
            }
          ],
          xAxes: [
            {
              ticks: {
                fontColor: "wheat"
              },
              type: 'time',
              time: {
                unit: 'dayhour',
                displayFormats:{
                  dayhour: 'DD h:mm'
                }
              }
            }
          ]
        },
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              rangeMin: {
              },
              rangeMax: {
              }
            },
            zoom: {
              enabled: true,
              mode: 'x',
              rangeMin: {
              },
              rangeMax: {

              }
            }
          }
        },
        legend: {
          labels: {
            fontColor: "wheat",
          }
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
      adjustTimelineData: {
        datasets: [

        ]
      },
      adjustStart: null,
      adjustEnd: null,
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
        legend: {
          labels: {
            fontColor: "wheat",
          }
        }
      },
    }
  },
  computed: {
    generationDataOut(){
      return this.generationData;
    },
    timelineDataOut(){
      return this.timelineData;
    },
    adjustTimelineDataOut(){
      return this.adjustTimelineData;
    },
    minAdjust(){
      let date = null;
      if(this.adjustEnd){
         date = new Date(this.adjustEnd.valueOf());
         date.setDate(date.getDate() - 30);
      }
      return date
    },
    maxAdjust(){
      let date = null;
      if(this.adjustStart){
        date = new Date(this.adjustStart.valueOf());
        date.setDate(date.getDate() + 30);
      }
      return date
    }
  },
  watch:{
    adjustStart() {
      this.adjustRefresh();
    },
    adjustEnd() {
      this.adjustRefresh();
    }
  },
  components: {
    FuelPie,
    FuelTimeline
  },
  methods: {
    async generationLoad(){
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
    },
    async adjustRefresh(){
      if(this.adjustStart && this.adjustEnd){
        await getGenerationAdjustTimeline(this.adjustStart, this.adjustEnd)
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
              this.adjustTimelineData = tempTimData;
            }
          })
      }
      return Promise.resolve(true);
    }
  },
  async mounted() {
    this.loaded = false;
    await this.refreshData();
    cron.schedule("1,31 * * * *", this.refreshData, {});
  }
}
</script>

<style>
html, #app{
  background-color: #2c3e50;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: wheat;
  margin-top: 40px;
}

.small-pie {
  margin: 0 auto;
  max-width: 100vw;
  width: 70vh;
}
.fuel-timeline{
  position: relative;
  margin: auto;
  height: calc(100vh - 150px);
  width: 99%;
}
.fuel-timeline-adjust{
  position: relative;
  margin: auto;
  height: calc(100vh - 200px);
  width: 99%;
}
</style>

import Vue from 'vue'
import App from './App.vue'

import BootstrapVue from "bootstrap-vue";
import datePicker from 'vue-bootstrap-datetimepicker';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

Vue.use(BootstrapVue);
Vue.use(datePicker);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');

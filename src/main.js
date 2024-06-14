import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import "primevue/resources/themes/lara-light-green/theme.css";
import 'primeicons/primeicons.css';
import 'primevue/resources/primevue.min.css';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Card from 'primevue/card';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

const app = createApp(App);
app.use(PrimeVue);
app.component('InputText', InputText);
app.component('Button', Button);
app.component('Skeleton', Skeleton);
app.component('Card', Card);
app.component('Message', Message);
app.component('ProgressSpinner', ProgressSpinner);
app.mount("#app");


import {Chart, LinearScale, CategoryScale, LineController, LineElement, PointElement, Tooltip, Title, Legend, SubTitle} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin, LinearScale, CategoryScale, LineController, LineElement, PointElement, Tooltip, Title, Legend, SubTitle);
window.ChartJS = Chart;

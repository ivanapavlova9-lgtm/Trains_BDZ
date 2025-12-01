window.onload = async () => {
  document.getElementById('loading').style.display = 'flex';

  const from = localStorage.getItem('from') || 'Не е избрано';
  const to = localStorage.getItem('to') || 'Не е избрано';
  const time = localStorage.getItem('time') || '12:30';

  document.getElementById('fromBox').textContent = from;
  document.getElementById('toBox').textContent = to;
  document.getElementById('timeBox').textContent = time;

  const map = L.map('map').setView([42.6977, 23.3219], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  const res = await fetch(`http://localhost:5000/api/routes?from=${from}&to=${to}`);
  const routes = await res.json();

  const colors = ['green', 'blue', 'orange', 'pink', 'purple'];
  const routesDiv = document.getElementById('routes');
  routesDiv.innerHTML = '';

  routes.forEach((route, index) => {
    const arrival = calculateArrival(route.departure, route.duration);

    routesDiv.innerHTML += `
      <div style="background:white; color:black; margin-bottom:5px; border-radius:5px; padding:5px;">
        <strong>${route.departure} - ${arrival}</strong><br/>
        ${route.from} - ${route.to} (${route.duration} мин)<br/>
        ${route.type}
      </div>
    `;

    L.polyline(route.path, { color: colors[index] }).addTo(map);
  });

  const legendDiv = document.querySelector('.legend');
  legendDiv.innerHTML = '';
  routes.forEach((route, i) => {
    legendDiv.innerHTML += `
      <p><span class="color-box ${colors[i]}"></span> ${ordinal(i+1)} най-бърз маршрут</p>
    `;
  });

  document.getElementById('loading').style.display = 'none';
};

function calculateArrival(startTime, duration) {
  const [h, m] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m + duration);
  return date.toTimeString().slice(0,5);
}

function ordinal(n) {
  if (n === 1) return 'Най-бърз';
  if (n === 2) return 'Втори';
  if (n === 3) return 'Трети';
  if (n === 4) return 'Четвърти';
  if (n === 5) return 'Пети';
  return `${n}-ти`;
}

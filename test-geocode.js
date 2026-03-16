// test-geocode.js
const addresses = [
  "Rua Eduardo de Oliveira, Uberlândia, Brasil",
  "Afonso Pena, Uberlândia, Brasil",
  "Rua das Flores, Uberlândia, Minas Gerais, Brasil",
  "Avenida Rondon Pacheco, Uberlândia, MG, Brasil",
  "XV de Novembro, Centro, Uberlândia, Brasil",
  "Rua Quintino Bocaiúva, Martins, Uberlândia, Brasil"
];

async function testGeocode(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=br`,
      { headers: { 'User-Agent': 'PointDoPastel/1.0' } }
    );
    const data = await res.json();
    console.log(`\nAddress: ${address}`);
    if (data.length > 0) {
      console.log(`Found: lat ${data[0].lat}, lng ${data[0].lon || data[0].lng}`);
      console.log(`Display: ${data[0].display_name}`);
    } else {
      console.log('NOT FOUND');
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

async function run() {
  for (const a of addresses) {
    await testGeocode(a);
    await new Promise(r => setTimeout(r, 1100));
  }
}

run();

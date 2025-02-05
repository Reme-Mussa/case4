const UNSPLASH_API_URL = "https://images-api.nasa.gov/search";
const API_KEY = "zmacDQ2gaEeygkfE1dxaeCadFPgjl00KCZMb7Pas"; //  API key
let aktuellaResultat = [];

document.getElementById('sokKnapp').addEventListener('click', hanteraSök);

function hanteraSök() {
    const sökterm = document.getElementById('sokInput').value.trim();
    if (sökterm) {
        hämtaBilder(sökterm);
    }
}

async function hämtaBilder(sökterm) {
    try {
        const response = await fetch(`${UNSPLASH_API_URL}?q=${sökterm}&media_type=image`);
        const data = await response.json();
        aktuellaResultat = data.collection.items;
        visaBilder(aktuellaResultat);
    } catch (error) {
        console.error('Fel vid hämtning av bilder:', error);
    }
}

function visaBilder(bilder) {
    const huvudinnehall = document.getElementById('huvudinnehall');
    huvudinnehall.innerHTML = '';

    bilder.forEach(bild => {
        const bildData = bild.data[0];
        const bildLänk = bild.links[0].href;

        const bildkort = document.createElement('div');
        bildkort.classList.add('bildkort');
        
        bildkort.innerHTML = `
            <img src="${bildLänk}" alt="${bildData.title || 'NASA-bild'}">
            <div class="bildinfo">
                <h3 class="bildtitel">${bildData.title || 'Ingen titel'}</h3>
                <p class="bildbeskrivning">${(bildData.description || 'Ingen beskrivning').substring(0, 100)}...</p>
            </div>
        `;

        huvudinnehall.appendChild(bildkort);
    });
}
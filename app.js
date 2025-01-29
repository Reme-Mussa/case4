const NASA_API_URL = "https://images-api.nasa.gov/search";

let aktuellaResultat = [];

document.getElementById('sokKnapp').addEventListener('click', hanteraSök);

function hanteraSök() {
    const sökterm = document.getElementById('sokInput').value.trim();
    if (sökterm) {
        window.location.hash = `#/sök?query=${encodeURIComponent(sökterm)}`;
        hämtaBilder(sökterm);
    }
}

async function hämtaBilder(sökterm) {
    try {
        const url = new URL(NASA_API_URL);
        url.searchParams.append('q', sökterm);
        url.searchParams.append('media_type', 'image');
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors.join(', '));
        }
        
        const data = await response.json();
        visaBilder(data.collection.items);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

function visaBilder(bilder) {
    const huvudinnehall = document.getElementById('huvudinnehall');
    huvudinnehall.innerHTML = '';
    bilder.forEach(bild => {
        const bildElement = document.createElement('div');
        bildElement.classList.add('bild');
        bildElement.innerHTML = `
            <img src="${bild.links[0].href}" alt="${bild.data[0].title}">
            <p>${bild.data[0].title || 'Ingen beskrivning'}</p>
        `;
        huvudinnehall.appendChild(bildElement);
    });
}

// Fetch and display initial images on page load
document.addEventListener('DOMContentLoaded', () => {
    hämtaBilder('mars'); // Default search term
});

async function renderaSökresultat(sökterm) {
    const huvudInnehåll = document.getElementById('huvudinnehall');
    huvudInnehåll.innerHTML = `<div class="laddningsspinner"></div>`;
    
    try {
        aktuellaResultat = await hämtaBilder(sökterm);
        
        if (aktuellaResultat.length > 0) {
            huvudInnehåll.innerHTML = `
                <h2 class="sök-resultat-rubrik">Results for "${sökterm}"</h2>
                <div class="bildgalleri">
                    ${aktuellaResultat.map((bild, index) => `
                        <div class="bildkort" data-id="${bild.id}">
                            <img src="${bild.urls.small}" 
                                 alt="${bild.alt_description || 'Image'}" 
                                 loading="lazy">
                            <div class="bildinfo">
                                <p>${bild.alt_description?.substring(0, 50) || 'No description'}</p>
                                <small>Photo by: ${bild.user.name}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            
            document.querySelectorAll('.bildkort').forEach(kort => {
                kort.addEventListener('click', () => {
                    window.location.hash = `#/detaljer?id=${kort.dataset.id}`;
                });
            });
        } else {
            huvudInnehåll.innerHTML = `<p class="fel">No results found for "${sökterm}"</p>`;
        }
    } catch (error) {
        huvudInnehåll.innerHTML = `<p class="fel">${error.message}</p>`;
    }
}

function renderaBilddetaljer(bildId) {
    const bild = aktuellaResultat.find(b => b.id === bildId);
    const huvudInnehåll = document.getElementById('huvudinnehall');
    
    if (bild) {
        huvudInnehåll.innerHTML = `
            <article class="detaljer">
                <button onclick="window.history.back()">← Back</button>
                <img src="${bild.urls.regular}" 
                     alt="${bild.alt_description || 'Image'}" 
                     loading="lazy">
                <div class="detalj-info">
                    <h2>${bild.alt_description || 'Untitled'}</h2>
                    <p>Photographer: ${bild.user.name}</p>
                    ${bild.description ? `<p>${bild.description}</p>` : ''}
                </div>
            </article>
        `;
    } else {
        huvudInnehåll.innerHTML = `<p class="fel">Image not found</p>`;
    }
}

function router() {
    const sökväg = window.location.hash.substring(1).split('?')[0];
    const parametrar = new URLSearchParams(window.location.hash.split('?')[1]);
    
    switch(sökväg) {
        case '/sök':
            renderaSökresultat(parametrar.get('query'));
            break;
        case '/detaljer':
            renderaBilddetaljer(parametrar.get('id'));
            break;
        default:
            renderaStartsida();
    }
}

function renderaStartsida() {
    const huvudInnehåll = document.getElementById('huvudinnehall');
    huvudInnehåll.innerHTML = `
        <section class="välkommen">
            <h1>Welcome to BildSök</h1>
            <p>Search for images using the bar above</p>
        </section>
    `;
}

function konfigureraHändelser() {
    document.getElementById('sokKnapp').addEventListener('click', hanteraSök);
    document.getElementById('sokInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') hanteraSök();
    });
}


function initiera() {
    konfigureraHändelser();
    router();
    window.addEventListener('hashchange', router);
}

document.addEventListener('DOMContentLoaded', initiera);
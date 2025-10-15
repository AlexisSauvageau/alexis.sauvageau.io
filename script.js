/* ---------- Sample data ---------- */
import { initialProjects } from "./projects.js";

let projects = [...initialProjects];

const grid = document.getElementById('grid');
const qInput = document.getElementById('q');
const filters = document.querySelectorAll('[data-filter]');
const backdrop = document.getElementById('backdrop');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalEnterprise = document.getElementById('modalEnterprise');
const modalYear = document.getElementById('modalYear');
const modalTools = document.getElementById('modalTools');
const modalToolsList = document.getElementById('modalToolsList');
const modalLanguages = document.getElementById('modalLanguages');
const modalLangList = document.getElementById('modalLangList');
const modalTeam = document.getElementById('modalTeam');
const modalTeamCount = document.getElementById('modalTeamCount');
const modalImages = document.getElementById('modalImages');

function renderCard(p){
    const el = document.createElement('article');
    el.className = 'card';
    el.setAttribute('tabindex',0);

    // On vérifie si p.image existe, sinon on met une image par défaut
    const thumbHTML = p.icon
        ? `<img src="${p.icon}" alt="aperçu ${escapeHTML(p.title)}" class="thumb-img">`
        : `<div class="thumb placeholder"></div>`;

    el.innerHTML = `
    <div class="meta">
        <div class="thumb">${thumbHTML}</div>
        <div style="flex:1">
        <div class="title">${escapeHTML(p.title)}</div>
        <div class="desc">${escapeHTML(p.desc)}</div>
        <div class="tags" aria-hidden>
            ${p.tags.map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}
        </div>
        </div>
    </div>
    <div class="card-footer">
        <div class="pill ${p.area}">${p.area} • ${p.year}</div>
        <div style="display:flex;gap:8px;align-items:center">
        <button class="btn detail" data-action="open" data-id="${p.id}">Détails</button>
        <div class="pill">${p.type}</div>
        </div>
    </div>`;

    // keyboard access to details
    el.addEventListener('keydown', e=>{ if(e.key==='Enter') openModal(p.id); });
    el.querySelector('[data-action="open"]').addEventListener('click', ()=>openModal(p.id));
    return el;
}

function escapeHTML(s){
    return String(s).replace(/[&<>\"][\u00A0-\u9999<>&]/gim,function(i){return '&#'+i.charCodeAt(0)+';';});
}

function escapeInitials(s){ 
    return s.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase(); 
}

function renderGrid(list){
    grid.innerHTML='';
    if(list.length===0){ 
        grid.innerHTML = '<div class="empty">Aucun projet trouvé — essayez d\'enlever des filtres.</div>'; return; 
    }
    const frag = document.createDocumentFragment();
    list.forEach(p=>frag.appendChild(renderCard(p)));
    grid.appendChild(frag);
}

function openModal(id){
    const p = projects.find(x=>x.id==id); 
    if(!p){
        return;
    }
    modalTitle.innerHTML = `<span class="lightblue">${p.title}</span> • ${p.type}`;
    modalDesc.textContent = p.desc; 
    modalYear.textContent = p.year;

    if(p.enterprise){
        modalEnterprise.innerHTML = `<div class="tag">${p.enterprise}</div>`;
    }
    else{
        modalEnterprise.innerHTML = ``;
    }

    // Taille de l'équipe
    if (p.team && p.team > 0) {
        modalTeamCount.textContent = `${p.team} participant${p.team > 1 ? 's' : ''}`;
        modalTeam.style.display = 'block';
    } else {
        modalTeam.style.display = 'none';
    }

    // Langages utilisés
    if (p.languages && p.languages.length > 0) {
        modalLangList.innerHTML = p.languages.map(lang => `<li>${lang}</li>`).join('');
        modalLanguages.style.display = 'block';
    } else {
        modalLanguages.style.display = 'none';
    }

    // Outils utilisés
    if (p.tools && p.tools.length > 0) {
        modalToolsList.innerHTML = p.tools.map(tool => `<li>${tool}</li>`).join('');
        modalTools.style.display = 'block';
    } else {
        modalTools.style.display = 'none';
    }

    // Images du projet
    if (p.images && p.images.length > 0) {
        modalImages.innerHTML = p.images
        .map(src => `<img src="images/${src}" alt="Image du projet ${p.title}">`)
        .join('');
        modalImages.style.display = 'flex';
    } else {
        modalImages.innerHTML = '';
        modalImages.style.display = 'none';
    }

    backdrop.style.display='flex'; 
    backdrop.setAttribute('aria-hidden','false');
}

document.getElementById('closeModal').addEventListener('click', ()=> { 
    backdrop.style.display='none'; backdrop.setAttribute('aria-hidden','true'); 
});

backdrop.addEventListener('click', e=>{ 
    if(e.target===backdrop) { 
        backdrop.style.display='none'; 
        backdrop.setAttribute('aria-hidden','true'); 
    } 
});

// --------- Filtering & Searching ---------
function applyFilters(){
    const q = qInput.value.trim().toLowerCase();
    const active = Array.from(document.querySelectorAll('.filters .btn')).filter(b=>b.classList.contains('active')).map(b=>b.dataset.filter);
    let list = projects.slice();
    
    if(active.length>0 && !active.includes('all')){
        list = list.filter(p=> active.some(f=> String(p.year)===f || p.area===f ));
    }
    if(q){ 
        list = list.filter(p=> (p.title+p.languages+p.tools+p.tags.join(' ')+p.area).toLowerCase().includes(q)); 
    }
    renderGrid(list);
}

// toggle filter buttons
document.querySelectorAll('.filters .btn').forEach(b=>{
    b.addEventListener('click', ()=>{
    // single-select except 'all'
    if(b.dataset.filter==='all'){
        document.querySelectorAll('.filters .btn').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
    } else {
        document.querySelector('[data-filter="all"]').classList.remove('active');
        b.classList.toggle('active');
    }
    applyFilters();
    });
});

// clear filters
document.getElementById('clearFilters').addEventListener('click', ()=>{
    document.querySelectorAll('.filters .btn').forEach(x=>x.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    qInput.value='';
    renderGrid(projects);
});

// search
qInput.addEventListener('input', applyFilters);

// init
document.querySelector('[data-filter="all"]').classList.add('active');
renderGrid(projects);

// keyboard escape to close modal
document.addEventListener('keydown', e=>{ 
    if(e.key==='Escape'){ 
        backdrop.style.display='none'; 
        backdrop.setAttribute('aria-hidden','true'); 
    } 
});
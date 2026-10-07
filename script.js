const BASE_URL = "https://pokeapi.co/api/v2/";
const PAGE_SIZE = 20;
const MAX_STAT_VALUE = 255;

let pokemonCache = {};
let loadedPokemon = [];
let nextOffset = 0;
let currentIndex = 0;
let isLoading = false;
let activeTab = "main";

async function init() {
    await loadPokemon();
}

async function loadPokemon() {
    if (isLoading) return;
    setLoading(true);
    try {
        const newPokemon = await fetchNextPokemonPage();
        loadedPokemon.push(...newPokemon);
        nextOffset += PAGE_SIZE;
        renderPokemonList();
    } catch (error) {
        showStatusMessage(getErrorTemplate());
    } finally {
        setLoading(false);
    }
}

async function fetchNextPokemonPage() {
    const url = `${BASE_URL}pokemon?limit=${PAGE_SIZE}&offset=${nextOffset}`;
    const pageData = await fetchJson(url);
    const names = pageData.results.map((entry) => entry.name);
    return getPokemonDetails(names);
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
}

function getPokemonDetails(names) {
    return Promise.all(names.map(getPokemon));
}

async function getPokemon(name) {
    if (!pokemonCache[name]) {
        const data = await fetchJson(`${BASE_URL}pokemon/${name}`);
        pokemonCache[name] = simplifyPokemon(data);
    }
    return pokemonCache[name];
}

function simplifyPokemon(data) {
    return {
    id: data.id,
    name: data.name,
    types: data.types.map((entry) => entry.type.name),
    image: data.sprites.other["official-artwork"].front_default,
    height: data.height / 10,
    weight: data.weight / 10,
    baseExperience: data.base_experience,
    abilities: data.abilities.map((entry) => entry.ability.name),
    stats: data.stats.map((entry) => ({ name: entry.stat.name, value: entry.base_stat })),
    speciesUrl: data.species.url,
    };
}

function renderPokemonList() {
    showStatusMessage("");
    const listElement = document.getElementById("pokemonList");
    listElement.innerHTML = loadedPokemon.map(getPokemonCardTemplate).join("");
}

function setLoading(loading) {
    isLoading = loading;
    document.getElementById("loadingScreen").classList.toggle("d-none", !loading);
    document.getElementById("loadMoreButton").disabled = loading;
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatName(text) {
    return text.split("-").map(capitalize).join(" ");
}

function showStatusMessage(html) {
    document.getElementById("statusMessage").innerHTML = html;
}

/* ---------- Dialog ---------- */

function openDialog(index) {
    currentIndex = index;
    activeTab = "main";
    renderDialog();
    document.getElementById("pokemonDialog").showModal();
    document.body.classList.add("no-scroll");
}

function renderDialog() {
    const pokemon = loadedPokemon[currentIndex];
    const dialog = document.getElementById("pokemonDialog");
    dialog.innerHTML = getDialogTemplate(pokemon);
    dialog.setAttribute("aria-label", `Details for ${capitalize(pokemon.name)}`);
    showTab(activeTab);
}

function closeDialog() {
    document.getElementById("pokemonDialog").close();
}

function handleDialogClose() {
    document.body.classList.remove("no-scroll");
}

function handleDialogClick(event) {
    if (event.target.id === "pokemonDialog") {
        closeDialog();
    }
}

/* ---------- Tabs ---------- */

function showTab(tabName) {
    activeTab = tabName;
    markActiveTab(tabName);
    const pokemon = loadedPokemon[currentIndex];
    if (tabName === "main") setTabContent(getMainTabTemplate(pokemon));
    if (tabName === "stats") setTabContent(getStatsTabTemplate(pokemon.stats));
}

function markActiveTab(tabName) {
    document.querySelectorAll(".tab-button").forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabName);
    });
}

function setTabContent(html) {
    document.getElementById("tabContent").innerHTML = html;
}

function getStatPercent(value) {
    return Math.min(100, Math.round((value / MAX_STAT_VALUE) * 100));
}
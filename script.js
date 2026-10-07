const BASE_URL = "https://pokeapi.co/api/v2/";
const PAGE_SIZE = 20;
const MAX_STAT_VALUE = 255;
const MIN_SEARCH_LENGTH = 3;
const MAX_SEARCH_RESULTS = 20;

let pokemonCache = {};
let speciesCache = {};
let evolutionCache = {};

let loadedPokemon = [];
let displayedPokemon = [];
let allPokemonNames = [];

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
        renderPokemonList(loadedPokemon);
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
    image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
    height: data.height / 10,
    weight: data.weight / 10,
    baseExperience: data.base_experience ?? "-",
    abilities: data.abilities.map((entry) => entry.ability.name),
    stats: data.stats.map((entry) => ({ name: entry.stat.name, value: entry.base_stat })),
    speciesUrl: data.species.url,
    };
}

function renderPokemonList(pokemonList) {
    displayedPokemon = pokemonList;
    showStatusMessage("");
    const listElement = document.getElementById("pokemonList");
    listElement.innerHTML = pokemonList.map(getPokemonCardTemplate).join("");
}

function setLoading(loading) {
    isLoading = loading;
    document.getElementById("loadingScreen").classList.toggle("d-none", !loading);
    document.getElementById("loadMoreButton").disabled = loading;
    updateSearchButton();
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
    const pokemon = displayedPokemon[currentIndex];
    const dialog = document.getElementById("pokemonDialog");
    dialog.innerHTML = getDialogTemplate(pokemon, currentIndex, displayedPokemon.length);
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
    const pokemon = displayedPokemon[currentIndex];
    if (tabName === "main") setTabContent(getMainTabTemplate(pokemon));
    if (tabName === "stats") setTabContent(getStatsTabTemplate(pokemon.stats));
    if (tabName === "evolution") showEvolutionTab(pokemon);
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

async function getEvolutionStages(speciesUrl) {
    const chainUrl = await getEvolutionChainUrl(speciesUrl);
    if (!evolutionCache[chainUrl]) {
        const evolutionData = await fetchJson(chainUrl);
        evolutionCache[chainUrl] = collectEvolutionStages(evolutionData.chain);
    }
    return evolutionCache[chainUrl];
}

async function getEvolutionChainUrl(speciesUrl) {
    if (!speciesCache[speciesUrl]) {
        const species = await fetchJson(speciesUrl);
        speciesCache[speciesUrl] = species.evolution_chain.url;
    }
    return speciesCache[speciesUrl];
}

function collectEvolutionStages(chainLink, depth = 0, stages = []) {
    stages[depth] = stages[depth] || [];
    stages[depth].push(createEvolutionEntry(chainLink.species));
    chainLink.evolves_to.forEach((next) => collectEvolutionStages(next, depth + 1, stages));
    return stages;
}

function createEvolutionEntry(species) {
    const id = species.url.split("/").filter(Boolean).pop();
    const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    return { name: species.name, image: image };
}

async function showEvolutionTab(pokemon) {
    setTabContent(getTabLoadingTemplate());
    try {
        const stages = await getEvolutionStages(pokemon.speciesUrl);
        if (isStillShowing(pokemon)) {
            setTabContent(getEvolutionTabTemplate(stages));
        }
    } catch (error) {
        if (isStillShowing(pokemon)) setTabContent(getErrorTemplate());
    }
}

function isStillShowing(pokemon) {
    return displayedPokemon[currentIndex] === pokemon && activeTab === "evolution";
}

function showNextPokemon() {
    currentIndex = (currentIndex + 1) % displayedPokemon.length;
    renderDialog();
}

function showPreviousPokemon() {
    currentIndex = (currentIndex - 1 + displayedPokemon.length) % displayedPokemon.length;
    renderDialog();
}

function getSearchQuery() {
    return document.getElementById("searchInput").value.trim().toLowerCase();
}

function handleSearchInput() {
    updateSearchButton();
    if (getSearchQuery().length === 0 && isSearchActive()) {
        clearSearch();
    }
}

function updateSearchButton() {
    const tooShort = getSearchQuery().length < MIN_SEARCH_LENGTH;
    document.getElementById("searchButton").disabled = tooShort || isLoading;
    document.getElementById("searchHint").classList.toggle("hidden", !tooShort);
}

async function searchPokemon(event) {
    event.preventDefault();
    const query = getSearchQuery();
    if (query.length < MIN_SEARCH_LENGTH || isLoading) return;
    setLoading(true);
    try {
        const matchingNames = await findMatchingNames(query);
        showSearchResults(await getPokemonDetails(matchingNames));
    } catch (error) {
        showStatusMessage(getErrorTemplate());
    } finally {
        setLoading(false);
    }
}

async function findMatchingNames(query) {
    if (allPokemonNames.length === 0) {
        const data = await fetchJson(`${BASE_URL}pokemon?limit=100000&offset=0`);
        allPokemonNames = data.results.map((entry) => entry.name);
    }
    const matches = allPokemonNames.filter((name) => name.includes(query));
    return matches.slice(0, MAX_SEARCH_RESULTS);
}

function showSearchResults(results) {
    setSearchMode(true);
    renderPokemonList(results);
    if (results.length === 0) {
        showStatusMessage(getNotFoundTemplate());
    }
}

function clearSearch() {
    document.getElementById("searchInput").value = "";
    updateSearchButton();
    setSearchMode(false);
    renderPokemonList(loadedPokemon);
}

function setSearchMode(active) {
    document.getElementById("loadMoreButton").classList.toggle("d-none", active);
    document.getElementById("clearSearchButton").classList.toggle("d-none", !active);
}

function isSearchActive() {
    return !document.getElementById("clearSearchButton").classList.contains("d-none");
}
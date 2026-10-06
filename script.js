const BASE_URL = "https://pokeapi.co/api/v2/";
const PAGE_SIZE = 20;

let pokemonCache = {};
let loadedPokemon = [];
let nextOffset = 0;

async function init() {
    await loadPokemon();
}

async function loadPokemon() {
    try {
        const url = `${BASE_URL}pokemon?limit=${PAGE_SIZE}&offset=${nextOffset}`;
        const pageData = await fetchJson(url);
        const names = pageData.results.map((entry) => entry.name);
        const newPokemon = await getPokemonDetails(names);
        loadedPokemon.push(...newPokemon);
        nextOffset += PAGE_SIZE;
        renderPokemonList();
    } catch (error) {
        console.error("Loading Pokémon failed:", error);
    }
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
    };
}


function renderPokemonList() {
    const listElement = document.getElementById("pokemonList");
    listElement.innerHTML = loadedPokemon.map(getPokemonCardTemplate).join("");
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}


function getPokemonCardTemplate(pokemon) {
    const name = capitalize(pokemon.name);
    return `
        <li class="pokemon-list-item">
            <button class="pokemon-card" aria-label="Show details for ${name}" data-id="card">
                <div class="card-header"><span>#${pokemon.id}</span><span class="card-name">${name}</span></div>
                <div class="card-image-wrapper type-bg-${pokemon.types[0]}">
                    <img src="${pokemon.image}" alt="${name}" loading="lazy" data-id="card-image">
                </div>
                <div class="type-list">${getTypeBadgesTemplate(pokemon.types)}</div>
            </button>
        </li>`;
}

function getTypeBadgesTemplate(types) {
    return types.map((type) => `<span class="type-badge type-bg-${type}">${capitalize(type)}</span>`).join("");
}

function getErrorTemplate() {
    return `<p class="status-text">Something went wrong while loading data. Please try again.</p>`;
}
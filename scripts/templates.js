function getPokemonCardTemplate(pokemon, index) {
    const name = capitalize(pokemon.name);
    return `
        <li class="pokemon-list-item">
            <button class="pokemon-card" onclick="openDialog(${index})" aria-label="Show details for ${name}" data-id="card">
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

function getDialogTemplate(pokemon) {
    const name = capitalize(pokemon.name);
    return `
        <div class="dialog-card" data-id="overlay-pokemon-name">
            ${getDialogHeaderTemplate(pokemon.id, name)}
            <div class="dialog-image-wrapper type-bg-${pokemon.types[0]}">
                <img src="${pokemon.image}" alt="${name}" data-id="dialog-image">
            </div>
            <div class="type-list">${getTypeBadgesTemplate(pokemon.types)}</div>
            <div id="tabContent" class="tab-content"></div>
        </div>`;
}


function getDialogHeaderTemplate(id, name) {
    return `
        <div class="dialog-header">
            <span>#${id}</span>
            <h2>${name}</h2>
            <button class="close-button" onclick="closeDialog()" aria-label="Close details" data-id="close-dialog-button">&#10005;</button>
        </div>`;
}
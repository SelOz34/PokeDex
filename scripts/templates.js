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

function getDialogTemplate(pokemon, index, total) {
    const name = capitalize(pokemon.name);
    return `
        <div class="dialog-card" data-id="overlay-pokemon-name">
            ${getDialogHeaderTemplate(pokemon.id, name)}
            <div class="dialog-image-wrapper type-bg-${pokemon.types[0]}">
                <img src="${pokemon.image}" alt="${name}" data-id="dialog-image">
            </div>
            <div class="type-list">${getTypeBadgesTemplate(pokemon.types)}</div>
            ${getTabNavigationTemplate()}
            <div id="tabContent" class="tab-content"></div>
            ${getDialogNavigationTemplate(index, total)}
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

function getTabNavigationTemplate() {
    return `
        <div class="tab-navigation">
            <button class="tab-button" data-tab="main" onclick="showTab('main')" aria-label="Show main info">main</button>
            <button class="tab-button" data-tab="stats" onclick="showTab('stats')" aria-label="Show stats">stats</button>
            <button class="tab-button" data-tab="evolution" onclick="showTab('evolution')" aria-label="Show evolution chain">evo chain</button>
            </div>`;
}

function getDialogNavigationTemplate(index, total) {
    return `
        <div class="dialog-navigation">
            <button class="arrow-button" onclick="showPreviousPokemon()" aria-label="Show previous Pokémon" data-id="prev-button">&#10094;</button>
            <span class="dialog-counter">${index + 1} / ${total}</span>
            <button class="arrow-button" onclick="showNextPokemon()" aria-label="Show next Pokémon" data-id="next-button">&#10095;</button>
        </div>`;
}

function getMainTabTemplate(pokemon) {
    return `
        <table class="info-table">
            <tr><th>Height</th><td>${pokemon.height} m</td></tr>
            <tr><th>Weight</th><td>${pokemon.weight} kg</td></tr>
            <tr><th>Base experience</th><td>${pokemon.baseExperience}</td></tr>
            <tr><th>Abilities</th><td>${pokemon.abilities.map(formatName).join(", ")}</td></tr>
        </table>`;
}

function getStatsTabTemplate(stats) {
    return `<div class="stats-list">${stats.map(getStatRowTemplate).join("")}</div>`;
}

function getStatRowTemplate(stat) {
    return `
        <div class="stat-row">
            <span class="stat-name">${stat.name}</span>
            <span class="stat-value">${stat.value}</span>
            <div class="stat-bar"><div class="stat-bar-fill" style="width: ${getStatPercent(stat.value)}%"></div></div>
        </div>`;
}

function getEvolutionTabTemplate(stages) {
    const stageHtml = stages.map((stage) => `<div class="evo-stage">${stage.map(getEvolutionEntryTemplate).join("")}</div>`);
    return `<div class="evo-chain">${stageHtml.join('<span class="evo-arrow" aria-hidden="true">&raquo;</span>')}</div>`;
}

function getEvolutionEntryTemplate(entry) {
    const name = formatName(entry.name);
    return `
        <figure class="evo-entry">
            <img src="${entry.image}" alt="${name}" loading="lazy">
            <figcaption>${name}</figcaption>
        </figure>`;
}

function getTabLoadingTemplate() {
    return `<div class="tab-loading"><div class="spinner small"></div></div>`;
}
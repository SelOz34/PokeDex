function getPokemonCardTemplate(pokemon) {
    const name = capitalize(pokemon.name);
    return `
        <li class="pokemon-list-item">
            <button class="pokemon-card" aria-label="Show details for ${name}" data-id="card">
                <div class="card-header">
                    <span>#${pokemon.id}</span>
                    <span class="card-name">${name}</span>
                </div>
                <img src="${pokemon.image}" alt="${name}" loading="lazy" data-id="card-image">
                <p class="card-types">${pokemon.types.join(", ")}</p>
            </button>
        </li>`;
}
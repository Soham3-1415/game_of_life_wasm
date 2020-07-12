import init from './wasm/game_of_life_wasm.js';

const run = async (): Promise<void> => {
    await init();
}

run()
    .catch(() => console.log('Error running app.'));
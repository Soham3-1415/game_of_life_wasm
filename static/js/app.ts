import init, {greet} from './wasm/game_of_life_wasm.js';

const run = async (): Promise<void> => {
    await init();

    greet();
}

run();
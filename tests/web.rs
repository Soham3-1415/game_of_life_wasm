//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate game_of_life_wasm;
extern crate wasm_bindgen_test;

use wasm_bindgen_test::*;

use game_of_life_wasm::CellCollection;

wasm_bindgen_test_configure!(run_in_browser);

fn simple_cell_collection() -> CellCollection {
	let mut game = CellCollection::new(20, 20);
	let width = game.width();
	let height = game.height();
	for row in 0..height {
		for column in (0..width).step_by(2) {
			game.activate_cell(row, column);
		}
	}
	for row in 0..height {
		game.kill_cell(row, 2);
	}

	game
}

#[wasm_bindgen_test]
fn simple_tick_test() {
	let mut game = simple_cell_collection();
	for _ in 0..5 {
		game.tick();
	}

	let mut expected_game = CellCollection::new(20, 20);
	let width = game.width();
	let height = game.height();
	for row in 0..height {
		for column in 0..width {
			expected_game.activate_cell(row, column);
		}
	}
	for row in 0..height {
		for &column in [2u16, 6, 9, 11, 13, 15, 18].iter() {
			expected_game.kill_cell(row, column);
		}
	}

	assert_eq!(expected_game, game)
}

#[wasm_bindgen_test]
fn simple_reset_test() {
	let mut game = simple_cell_collection();
	game.reset();

	let expected_game = CellCollection::new(20, 20);

	assert_eq!(expected_game, game)
}
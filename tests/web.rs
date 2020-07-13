//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate game_of_life_wasm;
extern crate wasm_bindgen_test;

use wasm_bindgen_test::*;

use game_of_life_wasm::{CellCollection, CellState};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn simple_tick_test() {
	let mut game = CellCollection::new(10, 10);
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
	for _ in 0..5 {
		game.tick();
	}

	let mut expected_game = CellCollection::new(10, 10);
	for row in 0..height {
		for column in 0..width {
			expected_game.activate_cell(row, column);
		}
	}
	for row in 0..height {
		for &column in [2u16, 6, 911, 13, 15, 18].iter() {
			game.kill_cell(row, column);
		}
	}

	assert_eq!(expected_game, game)
}
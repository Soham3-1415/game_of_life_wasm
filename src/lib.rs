extern crate wasm_bindgen;

use wasm_bindgen::__rt::core::fmt::{self, Debug, Formatter};
use wasm_bindgen::__rt::core::ops::{Index, Not};
use wasm_bindgen::prelude::*;

mod utils;

const BITS_IN_BYTE: u8 = 8;

const DEFAULT_WIDTH: u16 = 64;
const DEFAULT_HEIGHT: u16 = 64;

#[wasm_bindgen]
pub struct CellCollection {
	cells: Vec<u8>,
	temp_state: Vec<u8>,
	height: u16,
	width: u16,
	toggle_x: Vec<u16>,
	toggle_y: Vec<u16>,
}

impl Eq for CellCollection {}

impl PartialEq for CellCollection {
	fn eq(&self, other: &Self) -> bool {
		if self.height != other.height || self.width != other.width {
			return false;
		}

		for (a, b) in self.into_iter().zip(other.into_iter()) {
			if a != b {
				return false;
			}
		}

		true
	}
}

pub struct CellCollectionIterator<'a> {
	cell_collection: &'a CellCollection,
	cells: u32,
	byte: u32,
	bit: u8,
}

impl Iterator for CellCollectionIterator<'_> {
	type Item = CellState;

	fn next(&mut self) -> Option<Self::Item> {
		let byte = self.byte;
		let bit = self.bit;

		if byte * 8 + bit as u32 >= self.cells {
			return None;
		}

		let state = Some(*self.cell_collection.state_from_bit_byte(byte, bit));

		let mut bit = bit + 1;
		if bit >= BITS_IN_BYTE {
			bit = 0;
			self.byte = byte + 1;
		}
		self.bit = bit;

		state
	}

	fn nth(&mut self, n: usize) -> Option<Self::Item> {
		let n = n as u32;
		self.byte = self.byte.saturating_add(n / 8);
		self.bit += (n % BITS_IN_BYTE as u32) as u8;
		if self.bit >= BITS_IN_BYTE {
			self.bit -= BITS_IN_BYTE;
			self.byte = self.byte.saturating_add(1);
		}

		self.next()
	}
}

impl Not for CellState {
	type Output = CellState;

	fn not(self) -> Self::Output {
		match self {
			Self::ALIVE => Self::DEAD,
			Self::DEAD => Self::ALIVE,
		}
	}
}

impl<'a> IntoIterator for &'a CellCollection {
	type Item = CellState;
	type IntoIter = CellCollectionIterator<'a>;

	fn into_iter(self) -> Self::IntoIter {
		CellCollectionIterator {
			cell_collection: self,
			cells: self.width as u32 * self.height as u32,
			byte: 0,
			bit: 0,
		}
	}
}

impl Index<(u16, u16)> for CellCollection {
	type Output = CellState;

	fn index(&self, (row, column): (u16, u16)) -> &Self::Output {
		let (byte, bit) = self.bit_byte_index(row, column);

		self.state_from_bit_byte(byte, bit)
	}
}

impl Debug for CellCollection {
	fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
		let mut out = String::from("[");
		for cell in self {
			out.push_str(&format!("{:?}, ", cell));
		}
		out.push_str("]");
		write!(f, "{}", out)
	}
}

#[repr(u8)]
#[wasm_bindgen]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum CellState {
	DEAD = 0,
	ALIVE = 1,
}

#[wasm_bindgen]
impl CellCollection {
	pub fn new(height: u16, width: u16) -> Self {
		utils::set_panic_hook();

		let cells = height as u32 * width as u32;
		let mut bytes = cells / 8;
		if cells % 8 > 0 {
			bytes += 1;
		}

		CellCollection {
			cells: vec![0; bytes as usize],
			temp_state: vec![0; bytes as usize],
			height,
			width,
			toggle_x: Vec::new(),
			toggle_y: Vec::new(),
		}
	}

	pub fn cells(&self) -> *const u8 {
		self.cells.as_ptr()
	}

	pub fn toggle_x(&self) -> *const u16 {
		self.toggle_x.as_ptr()
	}

	pub fn toggle_y(&self) -> *const u16 {
		self.toggle_y.as_ptr()
	}

	pub fn toggle_updates(&self) -> u32 {
		self.toggle_x.len() as u32
	}

	pub fn height(&self) -> u16 {
		self.height
	}

	pub fn width(&self) -> u16 {
		self.width
	}

	pub fn tick(&mut self) {
		self.toggle_x.clear();
		self.toggle_y.clear();

		for row in 0..self.height {
			for column in 0..self.width {
				let old_state = self.read_cell_state(row, column);
				let live_neighbors = self.live_neighbor_count(row, column);
				let new_state = old_state.apply_rules(live_neighbors);

				let (byte, bit) = self.bit_byte_index(row, column);
				Self::write_cell_state_to_vec(byte, bit, new_state, &mut self.temp_state);

				if new_state != old_state {
					self.toggle_x.push(row);
					self.toggle_y.push(column);
				}
			}
		}

		std::mem::swap(&mut self.temp_state, &mut self.cells);
	}

	pub fn activate_cell(&mut self, row: u16, column: u16) {
		self.write_cell_state(row, column, CellState::ALIVE)
	}

	pub fn kill_cell(&mut self, row: u16, column: u16) {
		self.write_cell_state(row, column, CellState::DEAD)
	}

	pub fn toggle_cell(&mut self, row: u16, column: u16) {
		self.write_cell_state(row, column, !self[(row, column)])
	}

	pub fn read_cell_state(&mut self, row: u16, column: u16) -> CellState {
		self[(row, column)]
	}

	pub fn write_cell_state(&mut self, row: u16, column: u16, cell_state: CellState) {
		let (byte, bit) = self.bit_byte_index(row, column);
		Self::write_cell_state_to_vec(byte, bit, cell_state, &mut self.cells)
	}
}

impl CellCollection {
	fn write_cell_state_to_vec(byte: u32, bit: u8, cell_state: CellState, vec: &mut [u8]) {
		let mask = !(1 << bit);
		let dat = match cell_state {
			CellState::ALIVE => 1,
			CellState::DEAD => 0,
		} << bit;

		vec[byte as usize] = (vec[byte as usize] & mask) + dat;
	}

	fn state_from_bit_byte(&self, byte: u32, bit: u8) -> &CellState {
		if self.cells[byte as usize] & (1 << bit) != 0 {
			&CellState::ALIVE
		} else {
			&CellState::DEAD
		}
	}

	fn bit_byte_index(&self, row: u16, column: u16) -> (u32, u8) {
		let raw_index = row as u32 * self.width as u32 + column as u32;
		let byte = raw_index / 8;
		let bit = (raw_index % 8) as u8;
		(byte, bit)
	}

	fn neighbors(&self, row: u16, column: u16) -> [(u16, u16); 8] {
		let up = if row == 0 {
			self.height - 1
		} else {
			row - 1
		};

		let down = if row == self.height - 1 {
			0
		} else {
			row + 1
		};

		let left = if column == 0 {
			self.width - 1
		} else {
			column - 1
		};

		let right = if column == self.width - 1 {
			0
		} else {
			column + 1
		};

		[
			(up, left),
			(up, column),
			(up, right),
			(row, left),
			(row, right),
			(down, left),
			(down, column),
			(down, right),
		]
	}

	fn live_neighbor_count(&self, row: u16, column: u16) -> u8 {
		let neighbors = self.neighbors(row, column);

		let mut count = 0;
		for neighbor in neighbors.iter() {
			if self[*neighbor] == CellState::ALIVE {
				count += 1;
			}
		}

		count
	}
}

impl CellState {
	fn apply_rules(self, live_neighbors: u8) -> Self {
		match self {
			Self::DEAD if live_neighbors == 3 => Self::ALIVE,
			Self::ALIVE if 2 <= live_neighbors && live_neighbors <= 3 => Self::ALIVE,
			_ => Self::DEAD,
		}
	}
}

impl Default for CellCollection {
	fn default() -> Self {
		Self::new(DEFAULT_HEIGHT, DEFAULT_WIDTH)
	}
}
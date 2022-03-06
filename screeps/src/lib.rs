// This is to mitigate clippy issue with `wasm_bindgen`
#![allow(clippy::unused_unit)]

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_internal(s: &str);
}

macro_rules! log {
    ($($t:tt)*) => (log_internal(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn run() {
    log!("Hello from Rust!");
}

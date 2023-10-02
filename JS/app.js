// Controller

// imports from the View and Model files
import View from "./view.js";
import Store from "./store.js";

// array of players with their properties

const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
];

// initializing function
function init() {
  // vars assigned to the default exports from the imported files
  const view = new View();
  const store = new Store("live-t3-storage-key", players);

  // Current tab state changes
  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  // Different tab state changes
  window.addEventListener("storage", () => {
    console.log("state changed from another tab");
    view.render(store.game, store.stats);
  });

  // First load of the document
  view.render(store.game, store.stats);

  // Reset
  view.bindGameResetEvent((event) => {
    store.reset();
  });

  // New Round
  view.bindNewRoundEvent((event) => {
    store.newRound();
  });

  // Game Move (State Change)
  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // Advance to the next state by pushing a move to the moves array.
    store.playerMove(+square.id);
  });
}

// load event
window.addEventListener("load", init);

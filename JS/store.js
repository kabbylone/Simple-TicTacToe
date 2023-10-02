// Model

// defining intial state as empty array of moves.
const initialValue = {
  currentGameMoves: [],
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

export default class Store extends EventTarget {
  // constructor method which will be initialized at the time when the class is called.
  constructor(key, players) {
    super();
    this.storageKey = key;
    this.players = players;
  }

  // stats getter method for the scoreboard
  get stats() {
    const state = this.#getState();

    return {
      // using the map method to archive the wins of the particular player in the history property
      playerWithStats: this.players.map((player) => {
        const wins = state.history.currentRoundGames.filter(
          (game) => game.status.winner?.id === player.id
        ).length;

        return {
          ...player, // spread operator
          wins,
        };
      }),

      // same method to archive game ties
      ties: state.history.currentRoundGames.filter(
        (game) => game.status.winner === null
      ).length,
    };
  }

  // getter method to pass the state of the game to the controller and tell which player's turn it is currently.
  get game() {
    // assigning the return value of the getState function to the state var.
    const state = this.#getState();

    // modulo function which will only pass 0 or 1 that will identify is it player 1's or 2's turn.
    const currentPlayer = this.players[state.currentGameMoves.length % 2];

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    for (const player of this.players) {
      // only selecting the moves of the current player using the filter method passing on the player's id property.
      const selectedSquareIds = state.currentGameMoves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId); //map the resulting array and grab the squareId off of the individual moves.

      // if every move of the player matches any of the winning patterns then that player is declared the winner.
      for (const pattern of winningPatterns) {
        if (pattern.every((v) => selectedSquareIds.includes(v))) {
          winner = player;
        }
      }
    }

    // returns the moves performed by the current player
    return {
      moves: state.currentGameMoves,
      currentPlayer,
      status: {
        isComplete: winner != null || state.currentGameMoves.length === 9,
        winner,
      },
    };
  }

  playerMove(squareId) {
    // stateClone that will be mutated to change the state of the game.
    const stateClone = structuredClone(this.#getState());

    stateClone.currentGameMoves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateClone);
  }

  // reset method that pushes the moves and status of the current game into the history property
  reset() {
    const { status, moves } = this.game;
    const stateClone = structuredClone(this.#getState());

    if (this.game.status.isComplete) {
      stateClone.history.currentRoundGames.push({
        moves,
        status,
      });
    }

    stateClone.currentGameMoves = [];

    this.#saveState(stateClone);
  }

  newRound() {
    this.reset();

    // use a stateClone so that you dont update state directly (good practice)
    const stateClone = structuredClone(this.#getState());
    // populate all games with the recent currentGames
    stateClone.history.allGames.push(...stateClone.history.currentRoundGames);
    // setting currentRoundGames to an empty array
    stateClone.history.currentRoundGames = [];

    this.#saveState(stateClone);
  }

  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialValue;
  }

  #saveState(stateOrFn) {
    const prevState = this.#getState();

    let newState;

    switch (typeof stateOrFn) {
      case "function":
        newState = stateOrFn(prevState);
        break;
      case "object":
        newState = stateOrFn;
        break;
      default:
        throw new Error("Invalid argument passed to saveState");
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
    this.dispatchEvent(new Event("statechange"));
  }
}

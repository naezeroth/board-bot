const { App } = require("@slack/bolt");
const store = require("./store");

// Creating the Slack Application
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  endpoints: {
    events: "/slack/events",
    commands: "/slack/commands"
  }
});

// Global variables for the player (X or O), the number of moves made, and the board state
let player = "X";
let numMoves = 0;
let board = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];

let botConversations = {};

// Fetch conversations using the conversations.list method
async function fetchBotConversations() {
  try {
    // Call the conversations.list method using the built-in WebClient
    const result = await app.client.conversations.list({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN
    });
    const channelsBelongedTo = [];
    result.channels.forEach(function(channel, index) {
      if (channel.is_member) {
        channelsBelongedTo.push(channel);
      }
    });
    saveConversations(channelsBelongedTo);
  } catch (error) {
    console.error(error);
  }
}

// Put conversations into the JavaScript object
function saveConversations(conversationsArray) {
  let conversationId = "";
  conversationsArray.forEach(function(conversation) {
    // Key conversation info on its unique ID
    conversationId = conversation["id"];

    // Store the entire conversation object (you may not need all of the info)
    botConversations[conversationId] = conversation;
  });
}

let totalParticipants = ["U01FY0KTQUX", "U01GCUHHC4T", "U01GCNF08KC", "U01G9KU8NBX", "U01GCNT7UHY", "U01H2HRTVEU"];
// Sam, Ben, Rach, Matty, Burny, Mariya

// Fetch conversations using the conversations.list method
async function fetchPlayers(channelID) {
  try {
    // Call the conversations.list method using the built-in WebClient
    const result = await app.client.conversations.members({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelID
    });
    // console.log(result);
    //totalParticipants = result.members.filter(id => id != "U01H2HRTVEU");
  } catch (error) {
    console.error(error);
  }
}

// Put conversations into the JavaScript object

function selectRandomPlayer(possiblePlayers) {
  return possiblePlayers[Math.floor(Math.random() * possiblePlayers.length)];
}

app.event("app_home_opened", async ({ event, say, logger, client }) => {
  // Look up the user from DB
  let user = store.getUser(event.user);
  await fetchBotConversations();
  await fetchPlayers("C01GCUCMKKM");
  // console.log("*****************");
  // console.log(selectRandomPlayer(totalParticipants));

  if (!user) {
    user = {
      user: event.user,
      channel: event.channel
    };
    store.addUser(user);
    try {
      // await say(`Hello world, and welcome <@${event.user}>!`);
      // U01H2HRTVEU
      // selectRandomPlayer(totalParticipants).toString()
      // const newChannel = await openConversation(
      //   client,
      //   selectRandomPlayer(totalParticipants)
      // );
      // const resp = await postToUser(
      //   client,
      //   newChannel.id,
      //   "Random Message to You!"
      // );
      // printBoard(client, newChannel.id, say);
    } catch (error) {
      logger.error(error);
    }
  } else {
    try {
      // await say("Hi again!");
      // // const board = createBoard(say);
      // // move(board, 1, 1, "X");
      // const newChannel = await openConversation(
      //   client,
      //   selectRandomPlayer(totalParticipants)
      // );
      // printBoard(client, newChannel.id, say);
    } catch (error) {
      logger.error(error);
    }
  }
});

// Get chosen move from user
// Command format - go# <row> <col>
app.event("message", async ({ event, say, client }) => {
  const move = event.text.toLowerCase();
  const validCommand = /^go# [a-c] [1-3]$/;
  if(move == "start#") {
    givePlayerBoard(client, say);
  } else if (!validCommand.test(move)) {
    await say("Invalid move! Use command 'go# <a | b | c> <1 | 2 | 3>'");
    return;
  } else {
    // Make a move and check it's a free square
    const [, r, c] = move.split(" ");
    const row = letterRefToNumberRef(r);
    const col = parseInt(c) - 1;
    if (!freeSquare(row, col)) {
      await say("Invalid move! Square is already taken.");
      return;
    } else {
      // Successful move
      await say("Thank you for making a move!");
      makeMove(row, col, say);
      // printBoard(client, event.channel, say);
      givePlayerBoard(client, say);
    }
  }
});

const givePlayerBoard = async (client, say) => {
  console.log('playerboard', board);
  const newChannel = await openConversation(
        client,
        selectRandomPlayer(totalParticipants)
    );
    printBoard(client, newChannel.id, say);
}

// app.event("message", async ({ event, say, client }) => {
//   const start = event.text;
//   if(start == "start#") {
//     const newChannel = await openConversation(
//         client,
//         selectRandomPlayer(totalParticipants)
//     );
//     printBoard(client, newChannel.id, say);
//     givePlayerBoard(client, say);
//   }
// });

// Listen for /start commands
// app.command("/start", async ({ event, say, ack, client, command, text}) => {
//   console.log("You've called the start function");
//   await ack();

//   let conv = await client.conversations.create({
//     token: process.env.SLACK_BOT_TOKEN,
//     name: "channelTESTTTTT-"+ Math.floor(Math.random() * Math.floor(1000))
//   });
//   //Check command.text is 1 other person
//   let person;
//   let res = text.split(" ");
//   console.log("OUTPUT", conv.channel.id, command.user_id + "," + res[0].slice(0,10))
//   if (res.length == 1 && res[0].include("<") && res[0].include(">")){
//     //check if valid use
//   //Invite yourself and 1 other person to channel.
//     //now invite\
//     console.log("OUTPUT", conv.channel.id, command.user_id + "," + res[0].slice(0,10))
//     client.conversations.invite({
//       token: process.env.SLACK_BOT_TOKEN,
//       channel: conv.channel.id,
//       users:  command.user_id + "," + res[0].slice(0,10)
//     })
//   }

//   await say("TESTING");
//   await say(`${command.text}`);

// });

// Start app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

// const createBoard = () => {
//   const arr = [["x", "x", "x"], ["x", "x", "x"], ["x", "x", "x"]];
//   return arr;
// };

const letterRefToNumberRef = letter => {
  switch (letter) {
    case "a":
      return 0;
    case "b":
      return 1;
    case "c":
      return 2;
    default:
      return undefined; // never hits here
  }
};

const freeSquare = (row, col) => {
  console.log(row, col);
  return board[row][col] == "-";
};

const makeMove = async (row, col, say) => {
  board[row][col] = player;
  // Check if player has won
  const win = winCondition(say);
  if (win) {
    say("Player " + player + " wins!");
    restartGame();
    return;
  }
  changePlayer();
  numMoves += 1;

  if (noMoreMoves()) {
    say("Game over!");
    restartGame();
  }
};

const changePlayer = () => {
  if (player == "X") {
    player = "O";
  } else {
    player = "X";
  }
};

const printBoard = async (client, channelId, say) => {
  // await say("Here's your board!");
  await postToUser(
    client,
    channelId,
    "Here's your board! You are player " + player
  );
  let outputMessage = "";

  // await say("~      1       |       2       |       3      ~");
  await postToUser(
    client,
    channelId,
    "~      1       |       2       |       3      ~"
  );
  for (let row = 0; row < board.length; row++) {
    let formattedRow = "";

    if (row == 0) {
      formattedRow = "a  ";
    } else if (row == 1) {
      formattedRow = "b  ";
    } else if (row == 2) {
      formattedRow = "c  ";
    }

    formattedRow =
      formattedRow +
      "`   " +
      board[row][0] +
      "   |   " +
      board[row][1] +
      "   |   " +
      board[row][2] +
      "   `\n";
    outputMessage = outputMessage + formattedRow;
  }
  await postToUser(client, channelId, outputMessage);
  // await say(outputMessage);
};

const winCondition = () => {
  // Checking rows have 3 X's or 3 O's
  for (let i = 0; i < 3; i++) {
    let numX = 0;
    let numO = 0;
    for (let j = 0; j < 3; j++) {
      if (board[i][j] == "X") {
        numX++;
      } else if (board[i][j] == "O") {
        numO++;
      }
    }
    if (numX == 3 || numO == 3) {
      return true;
    }
  }

  // Checking columns have 3 X's or 3 O's
  for (let i = 0; i < 3; i++) {
    let numX = 0;
    let numO = 0;
    for (let j = 0; j < 3; j++) {
      if (board[j][i] == "X") {
        numX++;
      } else if (board[j][i] == "O") {
        numO++;
      }
    }
    if (numX == 3 || numO == 3) {
      return true;
    }
  }

  // Check the diagonals
  if (board[0][0] != "-" && board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
    return true;
  }

  if (board[2][0] != "-" && board[2][0] == board[1][1] && board[1][1] == board[0][2]) {
    return true;
  }

  return false;
};

const restartGame = (client, say) => {
  board = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
  player = "X";
  numMoves = 0;
};

const noMoreMoves = () => {
  return numMoves == 9;
};

const postToUser = async (client, channelId, text) => {
  console.log(text);
  let conv = await client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    text: text
  });
  return conv;
};

// Function returns channelID to DM the user with id = userId or undefined if ERRORS
const openConversation = async (client, userId) => {
  let conv = await client.conversations.open({
    token: process.env.SLACK_BOT_TOKEN,
    users: userId
  });
  return conv.channel;
};

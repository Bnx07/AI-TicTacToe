let submitButton = document.getElementById('submit');
let field = document.getElementById('decision');
let showPlayer = document.getElementById('response');
let winsHTML = document.getElementById('wins');
let lostHTML = document.getElementById('lost');
let tiesHTML = document.getElementById('ties');
let wins = 0;
let lost = 0;
let ties = 0;

// TODO: Do with data as an object and then modify so data is a tensor

// ? Counter logic:
// * In round one AI picked rock
// * In round two user expects AI to pick paper, so chooses scissors

/*
let data = [
    [ // This is the rock
        0, // More comments
        0, 
        0, 
        0
    ],
    [ // This is the paper
        0, // A ton of comments
        0, 
        0, 
        0
    ],
    [ // This are the scissors
        0, // comments.txt
        0, 
        0, 
        0
    ],
    [ // Other things
        0, // What they are 
        0, 
        0, 
        0
    ]
]
*/

let data = {
    rock: {
        pickrate: 0, // ? Number of picks
        promedy: 0, // ? Promedy of picks in a row
        pickrow: 0, // ? How many times has been picked in a row (Currently)
        counterrate: 0 // ? Percentage based in how many times the player picked scissors as counter of the last play
    },
    paper: {
        pickrate: 0, // ? Number of picks
        promedy: 0, // ? Promedy of picks in a row
        pickrow: 0, // ? How many times has been picked in a row (Currently)
        counterrate: 0 // ? Percentage based in how many times the player picked rock as counter of the last play
    },
    scissors: {
        pickrate: 0, // ? Number of picks
        promedy: 0, // ? Promedy of picks in a row
        pickrow: 0, // ? How many times has been picked in a row (Currently)
        counterrate: 0 // ? Percentage based in how many times the player picked paper as counter of the last play
    },
    lastpick: 0, // ? What the users last move was
    iapicked: 0
}

const decision = () => {
    let value = field.value;
    value = parseInt(value);
    let ia = predict();
    console.log("IA: ", ia);
    console.log("Ju: ", value);
    updateData(value);

    // Winning logic
    let result;
    if (value == ia) {
        result = "Empate";
        ties += 1;
    } else if (
        (value == 0 && ia == 2) ||
        (value == 1 && ia == 0) ||
        (value == 2 && ia == 1)
    ) {
        result = "Ganaste";
        wins += 1;
    } else {
        result = "Perdiste";
        lost += 1;
    }

    showPlayer.innerHTML = result;
    winsHTML.innerHTML = wins;
    lostHTML.innerHTML = lost;
    tiesHTML.innerHTML = ties;
    //showPlayer.innerHTML = 'Ganaste' // O perdiste, etc
}

const prediction = () => {
    // ! Input layer
    // ? Is data

    // ! Hidden layer 1
    // * Part 1
    // ? Decides based in promedy picks in a row, picksrow and lastpick

    let lay1 = [];

    if (data.lastpick = 'rock') {
        if (data.rock.promedy > data.rock.pickrow) lay1.push(data.rock.promedy / data.rock.pickrow);
        else lay1.push(0);
    } else if (data.lastpick = 'paper') {
        if (data.paper.promedy > data.paper.pickrow) lay1.push(data.paper.promedy / data.paper.pickrow);
        else lay1.push(0);
    } else {
        if (data.scissors.promedy > data.scissors.pickrow) lay1.push(data.scissors.promedy / data.scissors.pickrow);
        else lay1.push(0);
    }

    // * Part 2
    // ? Decides based in counter rate and lastpick
    
    // ? Value goes from 0 to 1, being 1 the most probable case
    if (data.iapicked = 'rock') {
        lay1.push(1-2**data.rock.counterrate);
    } else if (data.iapicked = 'paper') {
        lay1.push(1-2**data.paper.counterrate);
    } else {
        lay1.push(1-2**data.scissors.counterrate);
    }

    // * Part 3
    // ? Decides based in pick rate

    let totalPickrates = data.rock.pickrate + data.paper.pickrate + data.scissors.pickrate;
    let weightedPickrates = [
        data.rock.pickrate / totalPickrates,
        data.paper.pickrate / totalPickrates,
        data.scissors.pickrate / totalPickrates
    ];

    // If hasn´t played yet, it sets nans to 1
    if (isNaN(weightedPickrates[0])) weightedPickrates[0] = 1;
    if (isNaN(weightedPickrates[1])) weightedPickrates[1] = 1;
    if (isNaN(weightedPickrates[2])) weightedPickrates[2] = 1;

    // TODO: Fix this part
    // ? The idea is to get two values, a possible pick and the level of security the AI has about it
    let weightedSum = weightedPickrates[0] + 2 * weightedPickrates[1] + 3 * weightedPickrates[2];
    let normalizedWeightedSum = weightedSum / 6; // Normalize to the range [0, 1]

    lay1.push(normalizedWeightedSum);
    // // Adapt weightedSum and that part

    // ! Hidden layer 2
    // * Part 1
    // ? Compares picks in a row with pick rate

    // * Part 2
    // ? Compares counterrate with pick rate

    // ! Output layer
    // * Result
    // ? Compare layer 2 data

    return
}

const updateData = (dec) => { // Dec is the players decision
    // Reset others actual count
    if (dec == 2) {
        data[0][3] = 0;
        data[1][3] = 0;
    } else if (dec == 1) {
        data[0][3] = 0;
        data[2][3] = 0;
    } else {
        data[1][3] = 0;
        data[2][3] = 0;
    }
    
    // Update pick values
    data[dec][0] += 1; // Pickrate
    data[dec][3] += 1; // Actual count
    data[dec][1] = (data[dec][1] * data[dec][2] + data[0][3]) / (data[dec][2] + 1); // Pick promedy
    data[dec][2] += 1; // Number of items        

    // Counter rate
    if (data[3][3] == 0) { // Last was rock so it is waiting paper, throws scissors
        if (dec == 2) { // If threw rock, add 1 to counter rate
            data[3][0] += 1;
        } else { // If wasn't rock, discount 1
            data[3][0] -= 1;
        }
    } else if (data[3][3] == 1) { // Last was paper so it is waiting scissors, throws rock
        if (dec == 0) { // If threw rock, add 1 to counter rate
            data[3][1] += 1;
        } else { // If wasn't rock, discount 1
            data[3][1] -= 1;
        }
    } else {
        if (dec == 1) { // If threw rock, add 1 to counter rate
            data[3][2] += 1;
        } else { // If wasn't rock, discount 1
            data[3][2] -= 1;
        }
    }

    data[3][3] = dec;
}
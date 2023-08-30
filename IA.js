let submitButton = document.getElementById('submit');
let field = document.getElementById('decision');
let showPlayer = document.getElementById('response');
let winsHTML = document.getElementById('wins');
let lostHTML = document.getElementById('lost');
let tiesHTML = document.getElementById('ties');
let wins = 0;
let lost = 0;
let ties = 0;

let data = [ // Rock paper scissors, pick percentage, promedy, number of items, counter rate
// 0 = rock, 1 = paper, 2 = scissors
//  Pickrate, continued promedy, number of items promedy, actual count
    [0, 0, 0, 0], // Rock
    [0, 0, 0, 0], // Paper
    [0, 0, 0, 0], // Scissors
    [0, 0, 0, 0]  // Counter rate & last pick
];

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

const predict = () => {
    // Input layer
    // The inputs are located in data

    // Hidden layer 1
    let lay1 = [];

    // Consider last decision with continued promedy and actual count
    if (data[data[3][3]][3] < data[data[3][3]][1]) { // If promedy is bigger than the actual streak, calculates a value, if not, its 0 (Basically a semi-sigmoid)
        // Calculate ratio
        lay1.push(data[data[3][3]][1] / data[data[3][3]][3]);
    } else { // I dont know if delete the if and always do the calculation
        lay1.push(0);
    }
    
    // Consider counter rate and last pick
    lay1.push(1 + 0.5 * data[3][data[3][3]]); // Basic calculation about counter rate based in the last pick

    // Consider pickrates
    let totalPickrates = data[0][0] + data[1][0] + data[2][0];
    let weightedPickrates = [
        data[0][0] / totalPickrates,
        data[1][0] / totalPickrates,
        data[2][0] / totalPickrates
    ];

    // If hasn´t played yet, it sets nans to 1
    if (isNaN(weightedPickrates[0])) {
        weightedPickrates[0] = 1;
        weightedPickrates[1] = 1;
        weightedPickrates[2] = 1;
    }

    // Calculate weightedSum and normalize
    let weightedSum = weightedPickrates[0] + 2 * weightedPickrates[1] + 3 * weightedPickrates[2];
    let normalizedWeightedSum = weightedSum / 6; // Normalize to the range [0, 1]

    lay1.push(normalizedWeightedSum);

    // Hidden layer 2
    let lay2 = [];

    // Consider if counter rate is bigger or if promedy is bigger
    lay2.push(lay1[1] - lay1[0]);

    // Consider pick rates with layer 1 last decision
    let expected; // Doesn't work, is always 1
    if (lay1[2] < 0.25) expected = 0; // Verifies if expected is 0
    else if (lay1[2] > 0.75) expected = 2; // Verifies if expected is 2
    else expected = 1; // If both others are unexpected, is 1

    if (lay1[2] * 2 < expected - 0.1) lay2.push(lay1[2] * 2 + expected * 0.2); // Lo acerca al valor estimado si es muy bajo
    else if (lay1[2] * 2 > expected + 0.1) lay2.push(lay1[2] * 2 - expected * 0.2); // Lo acerca al valor estimado si es muy alto

    // Output layer
    let output;
    console.log(lay2[1])
    if (lay2[0] < -0.2) {
        output = data[0][0] > data[2][0] ? 1 : Math.round(lay2[1]);
        console.log("Minor")
        console.log(output)
    } else if (lay2[0] > 0.2) {
        output = data[2][0] > data[1][0] ? 0 : Math.round(lay2[1]);
        console.log("Bigger")
    } else {
        output = Math.round(lay2[1]);
    }
    // Verifica el ratio y su tendencia a alterar la decision 
    // Calculate decision
    return output;
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
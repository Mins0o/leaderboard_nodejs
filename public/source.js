var g_elo_lookup = {};
var g_match_record = {};

const g_table = document.getElementById("match_records");
const g_win_prob_template = [[1,1,1],
                            [0,1,1],
                            [0,0,1],
                            [0,0,0]];
const g_form = document.querySelector('form');

function get_data_from_server(){
  fetch('/rummikub/data')
     .then(response => response.json()) // Parse the response as JSON
     .then(data => {
        console.log(JSON.stringify(data));
  g_match_record=data;
     })
     .catch(error => {
        console.error(error);
     })
}

function populate_table(){
  g_match_record["match_data"].forEach(row => {
    let new_row = g_table.insertRow(-1);
    let date_cell = new_row.insertCell(0);
    let p1_cell = new_row.insertCell(1);
    let p2_cell = new_row.insertCell(2);
    let p3_cell = new_row.insertCell(3);
    let p4_cell = new_row.insertCell(4);

    date_cell.textContent = row["date"];
    p1_cell.textContent = row["p1"];
    p2_cell.textContent = row["p2"];
    p3_cell.textContent = row["p3"];
    p4_cell.textContent = row["p4"];
  });
}

function exp10(x){
    return Math.exp(Math.log(10) * x);
}

function get_win_probability(rating_a, rating_b){
    let q_a = exp10(rating_a/400);
    let q_b = exp10(rating_b/400);
    let expected_a = q_a/(q_a+ q_b);
    let expected_b = 1 - expected_a;
    return ([expected_a, expected_b]);
}

function get_win_probabilities(elo_array){
    let number_of_players = elo_array.length;
    let win_prob_array = manual_copy(g_win_prob_template);
    for(let ii=0; ii<number_of_players; ii++){
        for(let jj=ii-1; jj>=0; jj--){
            let win_prob = get_win_probability(elo_array[jj],elo_array[ii]);
            win_prob_array[jj][ii-1] = win_prob[0];
            win_prob_array[ii][jj] = win_prob[1];
        }
    }
    console.log(g_elo_lookup);
    return win_prob_array;
}

function get_elo(player){
    if(g_elo_lookup[player] == null ){ // may be null, undefined
        g_elo_lookup[player] = 1500; // create the new player
    }
    return g_elo_lookup[player];
}


function send_suggestion(date, p1, p2, p3, p4){
  let data_to_send = {
    "date":date,
    "p1":p1,
    "p2":p2,
    "p3":p3,
    "p4":p4
  }
  fetch('/rummikub/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data_to_send)
  })
  .then(response => response.text())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });
}

// Add an event listener for the form submission
g_form.addEventListener('submit', (event) => {
  // Prevent the default behavior of the form submission
  event.preventDefault();

  // Get the input element
  let date_input = document.getElementById('date_input');
  let p1_input = document.getElementById('p1_input');
  let p2_input = document.getElementById('p2_input');
  let p3_input = document.getElementById('p3_input');
  let p4_input = document.getElementById('p4_input');

  // Check if the input value is not empty
  if (date_input.value) {
    // Send a POST request to the server with the input value as the request body

    send_suggestion(date_input.value,
                    p1_input.value,
                    p2_input.value,
                    p3_input.value,
                    p4_input.value
                    )
    // let sendData = {
    //    "inputField1": inputValue
    // };
    // console.log("Sending this data", sendData);
    // fetch('/rummikub/data', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(sendData)
    // })
    //   .then(response => response.text()) // Parse the response as text
    //   .then(data => {
    //     // Use the data in your logic
    //     console.log(data); // Log the data to the console
    //     // Clear the input value
    //     input.value = '';
    //     // Reload the page to fetch the updated data
    //     window.location.reload();
    //   })
    //   .catch(error => {
    //     // Handle any errors
    //     console.error(error); // Log the error to the console
    //   });
  }
});


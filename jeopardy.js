// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const cluesQty = 5;
const categoryQty = 6;
const categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  try {
    const res = await axios.get("https://jservice.io/api/categories", {
      params: {
        count: 100,
      },
    });

    const ids = res.data.filter((el) => {
      // make sure it has enough clues
      return el.clues_count >= cluesQty;
    });

    return selectRandom(ids, categoryQty);
  } catch (e) {
    alert(`Oops something went wrong!
    ${e}`);
  }
}

/*
Filter Category Ids to five random Ids
*/
function selectRandom(data, limit) {
  // create a array with random ids
  let set = new Set();

  while (set.size < limit) {
    let i = randomIdx(100);
    // check if it is not undefined
    if (data[i]) {
      set.add(data[i]);
    }
  }

  return Array.from(set);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(id) {
  // make a get request for each id
  const res = await axios.get("https://jservice.io/api/clues", {
    params: {
      category: id.id,
    },
  });
  const clues = selectRandom(res.data, cluesQty).map((el) => {
    return {
      answer: el.answer,
      question: el.question,
      showing: null,
    };
  });

  return {
    title: res.data[0].category.title,
    clues,
  };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable(categories) {
  const thead = document.querySelector("thead");
  const tbody = document.querySelector("tbody");

  // Create table head
  for (let col = 0; col < categoryQty; col++) {
    const th = document.createElement("th");
    th.innerText = categories[col].title;
    thead.append(th);
  }

  // Create table data
  for (let row = 0; row < cluesQty; row++) {
    const newRow = document.createElement("tr");
    for (let col = 0; col < categoryQty; col++) {
      const cell = document.createElement("td");
      cell.innerHTML = "<i class='fas fa-question-circle fa-3x'></i>";

      // Extract question from categories
      const clue = categories[col].clues[row];
      clue.cell = cell;

      const handler = (e) => handleClick(e, clue);
      cell.addEventListener("click", handler);
      newRow.append(cell);
    }
    tbody.append(newRow);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

// question =  {answer: "moo goo gai pan", question: "I'll have this Chinese dish of sliced chicken stir-fried with mushrooms & vegetables, to go", showing: null}
function handleClick(e, clue) {
  const { answer, question, showing, cell } = clue;

  if (showing === null) {
    cell.innerHTML = question;
    clue.showing = "clue";
  } else if (showing === "clue") {
    cell.innerHTML = answer;
    cell.removeEventListener("click", handleClick);
  }
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  clearData();
  startLoading();
  const ids = await getCategoryIds();

  for (id of ids) {
    categories.push(await getCategory(id));
  }

  fillTable(categories);
  endLoading();
}

/*
Generate a random number
*/
function randomIdx(limit) {
  return Math.floor(Math.random() * limit);
}

function clearData() {
  $("#jeopardy thead").children().remove();
  $("#jeopardy tbody").children().remove();

  categories.length = 0;
}

function startLoading() {
  $("#restart").off("click", setupAndStart);
  $("#jeopardy").toggleClass("hide");
  $("#loading-icon").toggleClass("hide");
}

function endLoading() {
  $("#jeopardy").toggleClass("hide");
  $("#loading-icon").toggleClass("hide");
  $("#restart").on("click", setupAndStart);
}

/** On click of restart button, restart game. */

// TODO

/** On page load, setup and start & add event handler for clicking clues */

// TODO

// Event Listeners
$("#restart").on("click", setupAndStart);

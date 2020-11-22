let currentGame = null
let initialValues = null
let currentValues = null
let currentPopover = null

let selectedRow = null
let selectedCol = null

function getBoardElement(row, col) {
    // returns the element at a specific row & col
    const board = document.querySelector('#board').children[0] // child 0 to select body of table
    const board_row = board.children[row - 1]
    const element = board_row.children[col - 1]
    return element
}

function setVal(row, col, val) {
    getBoardElement(row, col).innerHTML = val
    currentValues[row - 1][col - 1] = val
}

function getVal(row, col) {
    return getBoardElement(row, col).innerHTML
}

function fillCounts() {
    const counts = {'1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0}

    // get current counts
    for (let row = 1; row < 10; row++) {
        for (let col = 1; col < 10; col++) {
            counts[getVal(row, col)]++
        }
    }

    // fill in counts on page
    const counters = document.querySelector('#counters').children[0].children[1].children[0]
    for (let num = 1; num < 10; num++) {
        counters.children[num].innerHTML = counts[num]
    }
}

function newGame(difficulty) {
    currentGame = sudoku.generate(difficulty)
    currentValues = sudoku.board_string_to_grid(currentGame)
    initialValues = currentValues

    let val = ''
    for (let row = 1; row < 10; row++) {
        for (let col = 1; col < 10; col++) {
            val = currentValues[row - 1][col - 1]
            if (val == '.') {
                val = ''
                markNotPermanent(row, col)
            } else {
                markPermanent(row, col)
            }

            setVal(row, col, val)
        }
    }
    fillCounts()
    setupEventListeners()
    document.querySelector('#gameDifficulty').innerHTML = difficulty.replace('-', ' ')
}

function markPermanent(row, col) {
    getBoardElement(row, col).classList.add('permanent')
}

function markNotPermanent(row, col) {
    getBoardElement(row, col).classList.remove('permanent')
}

function checkForMistakes() {
    const right_answers = sudoku.board_string_to_grid(sudoku.solve(currentGame))
    
    let correct = true
    outer_loop:
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (right_answers[row][col] != currentValues[row][col]) {
                correct = false
                break outer_loop;
            }
        }
    }
    if (correct) {
        console.log('Finished');
    } else {
        console.log('not finished yet');
    }
}

function get_row_and_col(td) {
    const row_element = td.parentElement
    const table_element = row_element.parentElement

    const col = [...row_element.children].indexOf(td) + 1  // +1 because first index is 0 but first row is 1
    const row = [...table_element.children].indexOf(row_element) + 1

    return [row, col]
}

function chooseVal(num) {
    setVal(selectedRow, selectedCol, num)
    fillCounts()
    closePopover()
}

function closePopover() {
    if (currentPopover) {
        $(currentPopover).popover('hide')
    }    
}

// document.addEventListener("DOMContentLoaded", () => {
function setupEventListeners() {
    document.querySelectorAll('td').forEach(cell => {
        // remove any previous listeners and popovers
        $(cell).off()
        $(cell).popover('dispose')

        // add listener to any cell on the board that is NOT permanent
        if (cell.closest('table').id == 'board' && !cell.classList.contains('permanent')) {
            cell.addEventListener('click', event => {
                closePopover();
                [selectedRow, selectedCol] = get_row_and_col(event.target)
                currentPopover = event.target    
            })

            let elem = '<div id="selectNumber">'
            for (let num = 1; num < 10; num++) {
                elem += `<button onclick="chooseVal(${num});">${num}</button>`
                if (num % 3 == 0) {
                    elem += '<br>'
                }
            }
            elem +='<button onclick="chooseVal(``);">Blank</button></div>'
            
            $(cell).popover({
                animation: true, 
                content: elem, 
                html: true,
                sanitize: false,
                placement: 'bottom'
            });
        } 
    })
}



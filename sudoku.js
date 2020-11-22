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
    mark(row, col, 'mistake', false)
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
                mark(row, col, 'permanent', false)
            } else {
                mark(row, col, 'permanent')
            }

            setVal(row, col, val)
        }
    }
    fillCounts()
    setupEventListeners()
    document.querySelector('#gameDifficulty').innerHTML = difficulty.replace('-', ' ')
}

function mark(row, col, label, toAdd=true) {
    if (toAdd) {
        getBoardElement(row, col).classList.add(label)
    } else {
        getBoardElement(row, col).classList.remove(label)
    }

}

function checkForMistakes() {
    removeAllHighlights()
    const right_answers = sudoku.board_string_to_grid(sudoku.solve(currentGame))
    
    let count_mistakes = 0;
    let count_blanks = 0;
    let row;
    let col;

    for (row = 0; row < 9; row++) {
        for (col = 0; col < 9; col++) {
            if (right_answers[row][col] != currentValues[row][col]) {
                if (currentValues[row][col] == '') {
                    count_blanks++
                } else {
                    count_mistakes++
                    mark(row + 1, col + 1, 'mistake')
                }
            }
        }
    }
    const message_div = document.querySelector('#mistakesMessages')
    if (count_mistakes == 0 && count_blanks == 0) {
        message_div.innerHTML = 'You Won!'
    } else {
        message_div.innerHTML = `You have ${count_mistakes} mistakes and ${count_blanks} blanks.`
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

function removeAllHighlights() {
    document.querySelectorAll('.highlight').forEach(cell => {
        cell.classList.remove('highlight')
    })
    document.querySelectorAll('.softHighlight').forEach(cell => {
        cell.classList.remove('softHighlight')
    })
}

// setup highlight buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.highlightBtn').forEach(cell => {
        cell.addEventListener('click', event => {
            removeAllHighlights()

            const valToHighlight = event.target.innerHTML
            for (let row = 1; row < 10; row++) {
                for (let col = 1; col < 10; col++) {
                    if (getVal(row, col) == valToHighlight) {
                        mark(row, col, 'highlight')
                        for (let each = 1; each < 10; each++) {
                            if (each != col) {
                                mark(row, each, 'softHighlight')
                            }
                            if (each != row ) {
                                mark(each, col, 'softHighlight')
                            }
                        }

                        let startingRow;
                        if (row < 4) {
                            startingRow = 1
                        } else if (row < 7) {
                            startingRow = 4
                        } else {
                            startingRow = 7
                        }
                        let staringCol;
                        if (col < 4) {
                            staringCol = 1
                        } else if (col < 7) {
                            staringCol = 4
                        } else {
                            staringCol = 7
                        }
                        for (let r = startingRow; r < startingRow + 3; r++) {
                            for (let c = staringCol; c < staringCol + 3; c++) {
                                if (r != row && c != col) {
                                    mark(r, c, 'softHighlight')
                                }
                            }   
                        }

                    }
                }
            }
        })
    })
})

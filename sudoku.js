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
    togglePotentials()
    togglePotentials()
}

function getVal(row, col) {
    return currentValues[row - 1][col - 1]
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

function isUnique(game) {
    const filtered = [...game].filter(function(char) {
        if ('123456789'.includes(char)) {
            return char
        }
    })
    if (filtered.length < 17) {
        return false
    }
       
    return sudoku.solve(game) == sudoku.solve(game, reverse=true)
}

function generateUniqueGame(difficulty) {
    let game = sudoku.generate(difficulty)
    let unique = isUnique(game)
    let count = 0;

    while (!unique && count < 1000) {
        game = sudoku.generate(difficulty)
        unique = isUnique(game)
        count++
    }
    if (!unique) {
        difficulty = `${difficulty} (Not Unique)`
    }

    return [game, difficulty]
}

function markPermanentNumbers() {
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
}

function setMistakesMessage(message) {
    document.querySelector('#mistakesMessages').innerHTML = message;
}

function newGame(difficulty) {
    if (difficulty == 'user-input') {
        const input_elem = document.querySelector('#userInputString')
        currentGame = [...input_elem.value].filter(function(char) {
            if ('123456789.'.includes(char)) {
                return char
            }
        })
        $('userInputModal').modal('hide')
    } else {
        [currentGame, difficulty] = generateUniqueGame(difficulty)
    }
    currentValues = sudoku.board_string_to_grid(currentGame)
    initialValues = currentValues
    removeAllHighlights()
    markPermanentNumbers()
    fillCounts()
    fillGameDifficulty(difficulty)
    setupEventListeners()
    setMistakesMessage('')
}

function fillGameDifficulty(difficulty) {
    document.querySelector('#gameDifficulty').innerHTML = difficulty.replace('-', ' ')
}

function mark(row, col, label, toAdd=true) {
    const elem = getBoardElement(row, col)
    if (toAdd) {
        if (!elem.classList.contains(label)) {
            elem.classList.add(label)
        }
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
    if (count_mistakes == 0 && count_blanks == 0) {
        setMistakesMessage('You Won!')
    } else {
        setMistakesMessage(`You have ${count_mistakes} mistakes and ${count_blanks} blanks.`)
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

            // setup popover
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

function highlight(valToHighlight) {
    removeAllHighlights()
    for (let row = 1; row < 10; row++) {
        for (let col = 1; col < 10; col++) {
            // check if it is the val to highlight
            if (getVal(row, col) == valToHighlight) {
                mark(row, col, 'highlight')
                
                // soft highlight row & col
                for (let each = 1; each < 10; each++) {
                    if (each != col) {
                        mark(row, each, 'softHighlight')
                    }
                    if (each != row ) {
                        mark(each, col, 'softHighlight')
                    }
                }
                
                // soft highlight family
                const startingRow = getStarting(row);
                const startingCol = getStarting(col);
                for (let r = startingRow; r < startingRow + 3; r++) {
                    for (let c = startingCol; c < startingCol + 3; c++) {
                        if (r != row && c != col) {
                            mark(r, c, 'softHighlight')
                        }
                    }   
                }
            } 

            // soft highlight any answered cells
            if (valToHighlight != '#' && getVal(row, col) != valToHighlight && getVal(row, col) != '') {
                mark(row, col, 'softHighlight')
            }
        }
    }

}

// setup highlight buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.highlightBtn').forEach(cell => {
        cell.addEventListener('click', event => {
            highlight(event.target.innerHTML)
        })
    })
})

function getStarting(row) {
    if (row < 4) {
        return 1
    } else if (row < 7) {
        return 4
    } else {
        return 7
    }
}

function getPotentials(row, col) {
    let potentials = [1,2,3,4,5,6,7,8,9]
    
    if (getVal(row, col) != '') {
        return [getVal(row, col)]
    }

    for (let each = 1; each < 10; each++) {
        // check row
        if (col != each) {
            potentials = potentials.filter(function(val, indx, arr) {
                return getVal(row, each) != val
            })
        }
        // check col
        if (row != each) {
            potentials = potentials.filter(function(val, indx, arr) {
                return getVal(each, col) != val
            })
        }
        // check family
        const startingRow = getStarting(row)
        const startingCol = getStarting(col);
        for (let r = startingRow; r < startingRow + 3; r++) {
            for (let c = startingCol; c < startingCol + 3; c++) {
                potentials = potentials.filter(function(val, indx, arr) {
                    return getVal(r, c) != val
                })
            }   
        }
    }
    return potentials;
}

function fillSinglePotentials() {
    document.querySelectorAll('.glow').forEach(cell => {
        cell.classList.remove('glow')
    })

    for (let row = 1; row < 10; row++) {
        for (let col = 1; col < 10; col++) {
            let potentials = getPotentials(row, col)
            if (potentials.length == 1 && getVal(row, col) == '') {
                setVal(row, col, potentials[0])
                mark(row, col, 'glow')
            }
        }
    }
}

function togglePotentials() {
    // if any potential elements exist, remove them
    potentials = document.querySelectorAll('.potential')
    if (potentials.length > 0) {
        potentials.forEach(elem => {
            elem.remove()
        })
        // rename button
        document.querySelector('#potentialsBtn').innerHTML = 'Show Potentials'
        // hide button
        document.querySelector('#fillSinglePotentialsBtn').hidden = true
    } else {
        // else, add them
        for (let row = 1; row < 10; row++) {
            for (let col = 1; col < 10; col++) {
                if (getVal(row, col) == '') {
                    const potentials = getPotentials(row, col)
                    const elem = document.createElement('div')
                    elem.innerHTML = potentials
                    elem.classList.add('potential')
                    getBoardElement(row, col).appendChild(elem)              
                }
            }
        }
        
        // rename button
        document.querySelector('#potentialsBtn').innerHTML = 'Hide Potentials'
        // show button
        document.querySelector('#fillSinglePotentialsBtn').hidden = false
    }
}

function checkUserInput() {
    const input_elem = document.querySelector('#userInputString')
    const submit_btn = document.querySelector('#userInputSubmit')
    const has_valid_count = document.querySelector('#numValid')
    const is_valid = document.querySelector('#validBoard')
    const has_unique = document.querySelector('#hasUnique')

    const game = [...input_elem.value].filter(function(char) {
        if ('123456789.'.includes(char)) {
            return char
        }
    })

    // check if total count is right
    const total_count = game.length  
    const valid_count = total_count == 81;
    if (valid_count) {
        has_valid_count.innerHTML = '&#10003 '.concat(total_count)
    } else {
        has_valid_count.innerHTML = '&#10005 '.concat(total_count)  
    }

    // check if is a valid board
    let valid_board = false
    let valid_board_msg = ''
    if (valid_count) {
        valid_board = true
        for (let num = 1; num < 10; num++) {
            let count = game.filter(function(each) {
                return each == String(num)
            }).length

            if (count > 9) {
                valid_board = false
                valid_board_msg += `Too many ${num}s were found. (Must be < 10). `
            }
        }
    }

    if (valid_board) {
        is_valid.innerHTML = '&#10003 Is a valid board.'
    } else {
        is_valid.innerHTML = `&#10005 Is not a valid board: ${valid_board_msg}`
    }

    // check if has unique solution
    let is_unique = false 
    if (valid_board) {
        is_unique = isUnique(game)
    }
    if (is_unique) {
        has_unique.innerHTML = '&#10003 Has a unique solution.'
        submit_btn.disabled = false
    } else {
        has_unique.innerHTML = '&#10005 Does not have a unique solution.'
        submit_btn.disabled = true
    }
}
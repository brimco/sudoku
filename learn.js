function showPage(page_num) {
    console.log(`show page ${page_num}`)
    // show the right page, hide the others
    document.querySelectorAll('.page').forEach(page => {
        if (page.id == page_num) {
            page.hidden = false
        } else {
            page.hidden = true
        }
    })

    // color the buttons (outline for pages you aren't on.)
    const selected_class = 'btn-secondary'
    const unselected_class = 'btn-outline-secondary'

    document.querySelectorAll('.pageBtn').forEach(btn => {
        if (btn.id == page_num) {
            btn.classList.remove(unselected_class)
            btn.classList.add(selected_class)
        } else {
            btn.classList.remove(selected_class)
            btn.classList.add(unselected_class)
        }
    })
}
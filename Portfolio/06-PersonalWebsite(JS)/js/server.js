const scheduleForm = document.getElementById('scheduleForm');
const tBody = document.getElementById('tableSchedule').getElementsByTagName('tbody')[0];

scheduleForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const data = Object.fromEntries(formData.entries());

    console.log(data);

    const typeSelect = event.target.querySelector('select[name="type"]');
    if (typeSelect) {
        const selectedText = typeSelect.options[typeSelect.selectedIndex].text;
        data.selectedText = selectedText;
    }
    const newRow = tBody.insertRow();

    const makeCell = (row, x, label, content, last = false) => {
        const cell = row.insertCell(x);
        cell.setAttribute('data-label', label);
        if (last) cell.innerHTML = content; else cell.textContent = content || '';
        return cell;
    };

    makeCell(newRow, 0, 'Date', data.date);
    makeCell(newRow, 1, 'Start', data.start);
    makeCell(newRow, 2, 'End', data.end);
    makeCell(newRow, 3, 'Description', data.activity);
    makeCell(newRow, 4, 'Place', data.place);
    makeCell(newRow, 5, 'Type', data.selectedText);
    makeCell(newRow, 6, 'Notes', data.notes);
    makeCell(newRow, 7, 'With', data.partner);
    let status;
    if (data.freebusy === 'busy') {
        status = '<img src="images/busy.png" alt="Busy" class="icon-24">';
    } else {
        status = '<img src="images/free.png" alt="Free" class="icon-24">';
    }
    makeCell(newRow, 8,'Status', status, true);

    scheduleForm.reset();

});

const addBtn = document.getElementById('liveToastBtn');
if (addBtn) {
    addBtn.addEventListener('click', () => {
        if (typeof scheduleForm.requestSubmit === 'function') {
            scheduleForm.requestSubmit();
        } 
    });
}


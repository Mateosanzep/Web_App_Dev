    const form = document.getElementById('nameForm');
    const taskForm = document.getElementById('taskForm');
    const greetingMessageDiv = document.getElementById('greetingMessage');
    const namesList = document.getElementById('namesList');
    const todoList = document.getElementById('todoList');

    try {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.value = '';
        if (greetingMessageDiv) greetingMessageDiv.innerHTML = '';
    } catch (e) {
        console.warn('Could not initialize inputs:', e && e.message);
    }

    let tasksList = document.getElementById('tasksList');
    if (!tasksList) {
        tasksList = document.createElement('div');
        tasksList.id = 'tasksList';
        todoList.appendChild(tasksList);
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const nameInput = document.getElementById('name');
        const name = nameInput.value.trim();
        if (!name) return;

            await fetch('/greet/' + encodeURIComponent(name), { method: 'PUT' });

            if (nameInput) nameInput.value = '';

            if (greetingMessageDiv) {
                greetingMessageDiv.innerHTML = '';
                const p = document.createElement('p');
                p.textContent = 'Hello, ';
                const strong = document.createElement('strong');
                strong.textContent = name;
                p.appendChild(strong);
                p.appendChild(document.createTextNode('! Thanks for registering.'));
                greetingMessageDiv.appendChild(p);
            }

            try { await loadNames(); } catch (e) { }
        });

    async function loadNames() {
        try {
            const res = await fetch('/names');
            const json = await res.json();
            const names = json.names || [];
            namesList.innerHTML = '';
            names.forEach((n, i) => {
                const div = document.createElement('div');
                div.innerHTML = `<p>Person ${i + 1}: <a href="/wazzup.html?name=${encodeURIComponent(n)}">${n}</a> — registered to the app.</p>`;
                namesList.appendChild(div);
            });
        } catch (e) {
            console.warn('Could not load names', e);
        }
    }

    loadNames();

    
    taskForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const taskInput = taskForm.elements['task'];
        const task = taskInput.value.trim();
        if (!task) return;

        const res = await fetch('/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task })
        });
        await showTasks();
        taskInput.value = '';
    });
    showTasks();
        async function showTasks() {
        const res = await fetch('/task');
        const json = await res.json();
        const tasks = json.tasks || [];
        tasksList.innerHTML = '';
        tasks.forEach((t, i) => {
            const item = document.createElement('div');
            item.innerHTML = `<p>Task: ${t}   <button>▲</button> <button>▼</button> <button data-action="delete" data-index="${i}">Delete</button></p>`;
            tasksList.appendChild(item);
        });

        tasksList.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', async function () {
                const idx = this.getAttribute('data-index');
                await fetch('/task/' + idx, { method: 'DELETE' });
                await showTasks();
            });
        });
    }
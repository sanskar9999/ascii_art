document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const createGridBtn = document.getElementById('create-grid-btn');
    const clearGridBtn = document.getElementById('clear-grid-btn'); // New
    const gridContainer = document.getElementById('grid-container');
    const outputArea = document.getElementById('output');
    const palette = document.getElementById('palette'); // New
    const copyBtn = document.getElementById('copy-btn'); // New

    // Application State
    let gridState = [];
    let isDrawing = false;
    let selectedChar = '#'; // Default character
    const EMPTY_CHAR = ' ';

    function createGrid(width, height) {
        const w = Math.max(1, Math.min(150, parseInt(width, 10)));
        const h = Math.max(1, Math.min(150, parseInt(height, 10)));
        widthInput.value = w;
        heightInput.value = h;

        gridState = Array.from({ length: h }, () => Array(w).fill(EMPTY_CHAR));
        renderGrid();
        updateOutputText();
    }

    // ::NEW:: Renders the entire grid based on gridState
    function renderGrid() {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${gridState[0].length}, 1fr)`;

        for (let r = 0; r < gridState.length; r++) {
            for (let c = 0; c < gridState[r].length; c++) {
                const cell = document.createElement('span');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = gridState[r][c];
                gridContainer.appendChild(cell);
            }
        }
    }

    function updateOutputText() {
        const rawText = gridState.map(row => row.join('')).join('\n');
        // ::NEW:: Add backticks for code block formatting
        outputArea.value = `\`\`\`\n${rawText}\n\`\`\``;
    }

    function handleDraw(event) {
        if (!event.target.matches('span[data-row]')) return;

        const row = event.target.dataset.row;
        const col = event.target.dataset.col;

        // Prevent drawing the same character repeatedly
        if (gridState[row][col] === selectedChar) return;

        // Update state
        gridState[row][col] = selectedChar;

        // Update view (only the changed cell)
        event.target.textContent = selectedChar;
        updateOutputText();
    }

    // --- Event Listeners ---

    createGridBtn.addEventListener('click', () => {
        createGrid(widthInput.value, heightInput.value);
    });

    // ::NEW:: Clear Grid Button
    clearGridBtn.addEventListener('click', () => {
        createGrid(widthInput.value, heightInput.value);
    });

    // ::NEW:: Palette Logic
    palette.addEventListener('click', (e) => {
        if (e.target.classList.contains('tool')) {
            // Update selected character
            selectedChar = e.target.dataset.char;

            // Update active tool style
            palette.querySelector('.active-tool').classList.remove('active-tool');
            e.target.classList.add('active-tool');
        }
    });

    // ::NEW:: Copy Button Logic
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputArea.value).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000); // Reset text after 2 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });

    gridContainer.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevents text selection drag behavior
        isDrawing = true;
        handleDraw(e);
    });

    gridContainer.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            handleDraw(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    gridContainer.addEventListener('mouseleave', () => {
        isDrawing = false;
    });

    // Initial grid creation
    createGrid(widthInput.value, heightInput.value);
});

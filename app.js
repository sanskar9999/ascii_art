document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const createGridBtn = document.getElementById('create-grid-btn');
    const gridContainer = document.getElementById('grid-container');
    const outputArea = document.getElementById('output');

    // Application State
    let gridState = [];
    let isDrawing = false;
    const DRAW_CHAR = '#';
    const EMPTY_CHAR = ' ';

    function createGrid(width, height) {
        // 1. Sanitize and Validate Inputs
        const w = Math.max(1, Math.min(150, parseInt(width, 10)));
        const h = Math.max(1, Math.min(150, parseInt(height, 10)));
        widthInput.value = w;
        heightInput.value = h;

        // 2. Initialize the internal state (the "model")
        gridState = Array.from({ length: h }, () => Array(w).fill(EMPTY_CHAR));

        // 3. Prepare the view
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${w}, 1fr)`;

        // 4. Create grid cells (the "view")
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                const cell = document.createElement('span');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = EMPTY_CHAR;
                gridContainer.appendChild(cell);
            }
        }
        updateOutputText();
    }

    function updateOutputText() {
        const text = gridState.map(row => row.join('')).join('\n');
        outputArea.value = text;
    }

    function handleDraw(event) {
        if (!event.target.matches('span')) return;

        const row = event.target.dataset.row;
        const col = event.target.dataset.col;

        // Update state
        gridState[row][col] = DRAW_CHAR;

        // Update view
        event.target.textContent = DRAW_CHAR;
        updateOutputText();
    }

    // Event Listeners
    createGridBtn.addEventListener('click', () => {
        createGrid(widthInput.value, heightInput.value);
    });

    gridContainer.addEventListener('mousedown', (e) => {
        isDrawing = true;
        handleDraw(e);
    });

    gridContainer.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            handleDraw(e);
        }
    });

    // Stop drawing when mouse is released anywhere on the page or leaves the container
    document.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    gridContainer.addEventListener('mouseleave', () => {
        isDrawing = false;
    });


    // Initial grid creation
    createGrid(widthInput.value, heightInput.value);
});

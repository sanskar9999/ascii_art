document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const createGridBtn = document.getElementById('create-grid-btn');
    const clearGridBtn = document.getElementById('clear-grid-btn');
    const gridContainer = document.getElementById('grid-container');
    const outputArea = document.getElementById('output');
    const palette = document.getElementById('palette');
    const copyBtn = document.getElementById('copy-btn');
    const customCharInput = document.getElementById('custom-char-input');
    const addCharBtn = document.getElementById('add-char-btn');
    const linesPaletteContainer = document.getElementById('lines-palette');
    const blocksPaletteContainer = document.getElementById('blocks-palette');
    const expandablePalettes = document.querySelector('.expandable-palettes');

    // Application State
    let gridState = [];
    let isDrawing = false;
    const EMPTY_CHAR = ' ';

    // Tool state
    let activeTool = 'draw';
    let selectedChar = '█'; // Default character
    let boxStartX, boxStartY;
    let gridSnapshot = [];

    // History state
    let undoStack = [];
    let redoStack = [];
    const MAX_HISTORY_SIZE = 50;

    // ::NEW:: Character Sets
    const lineChars = [
        '─', '━', '│', '┃', '┄', '┅', '┆', '┇', '┈', '┉', '┊', '┋', '┌', '┍', '┎', '┏',
        '┐', '┑', '┒', '┓', '└', '┕', '┖', '┗', '┘', '┙', '┚', '┛', '├', '┝', '┞', '┟',
        '┠', '┡', '┢', '┣', '┤', '┥', '┦', '┧', '┨', '┩', '┪', '┫', '┬', '┭', '┮', '┯',
        '┰', '┱', '┲', '┳', '┴', '┵', '┶', '┷', '┸', '┹', '┺', '┻', '┼', '┽', '┾', '┿',
        '╀', '╁', '╂', '╃', '╄', '╅', '╆', '╇', '╈', '╉', '╊', '╋', '╌', '╍', '╎', '╏',
        '═', '║', '╒', '╓', '╔', '╕', '╖', '╗', '╘', '╙', '╚', '╛', '╜', '╝', '╞', '╟',
        '╠', '╡', '╢', '╣', '╤', '╥', '╦', '╧', '╨', '╩', '╪', '╫', '╬', '╭', '╮', '╯',
        '╰', '╱', '╲', '╳', '╴', '╵', '╶', '╷', '╸', '╹', '╺', '╻', '╼', '╽', '╾', '╿'
    ];

    const blockChars = [
        '▀', ' ', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▉', '▊', '▋', '▌', '▍', '▎', '▏',
        '▐', '░', '▒', '▓', '▔', '▕', '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟'
    ];

    // ::NEW:: Function to build a palette from a character array
    function populatePalette(container, charArray) {
        const fragment = document.createDocumentFragment();
        for (const char of charArray) {
            const tool = document.createElement('span');
            tool.className = 'tool';
            tool.dataset.tool = 'draw';
            tool.dataset.char = char;
            tool.textContent = char;
            fragment.appendChild(tool);
        }
        container.appendChild(fragment);
    }

    function getCharacterDimensions() {
        const tempSpan = document.createElement('span');
        tempSpan.textContent = 'W';
        tempSpan.style.fontFamily = '"Courier New", Courier, monospace';
        tempSpan.style.fontSize = '18px';
        tempSpan.style.position = 'absolute';
        tempSpan.style.visibility = 'hidden';
        document.body.appendChild(tempSpan);
        const rect = tempSpan.getBoundingClientRect();
        document.body.removeChild(tempSpan);
        return { width: rect.width, height: rect.height };
    }

    function saveStateForUndo() {
        redoStack = [];
        if (undoStack.length >= MAX_HISTORY_SIZE) {
            undoStack.shift();
        }
        undoStack.push(JSON.parse(JSON.stringify(gridState)));
    }

    function undo() {
        if (undoStack.length === 0) return;
        const lastState = undoStack.pop();
        redoStack.push(JSON.parse(JSON.stringify(gridState)));
        gridState = lastState;
        renderGridFromState();
        updateOutputText();
    }

    function redo() {
        if (redoStack.length === 0) return;
        const nextState = redoStack.pop();
        undoStack.push(JSON.parse(JSON.stringify(gridState)));
        gridState = nextState;
        renderGridFromState();
        updateOutputText();
    }

    function createGrid(width, height) {
        const w = Math.max(1, Math.min(150, parseInt(width, 10)));
        const h = Math.max(1, Math.min(150, parseInt(height, 10)));
        widthInput.value = w;
        heightInput.value = h;

        const charDimensions = getCharacterDimensions();
        gridContainer.style.setProperty('--cell-width', `${charDimensions.width}px`);
        gridContainer.style.setProperty('--cell-height', `${charDimensions.height}px`);

        gridState = Array.from({ length: h }, () => Array(w).fill(EMPTY_CHAR));
        renderGridFromState();
        updateOutputText();
        undoStack = [];
        redoStack = [];
    }

    function renderGridFromState() {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${gridState[0].length}, 1fr)`;

        const fragment = document.createDocumentFragment();
        for (let r = 0; r < gridState.length; r++) {
            for (let c = 0; c < gridState[r].length; c++) {
                const cell = document.createElement('span');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = gridState[r][c];
                fragment.appendChild(cell);
            }
        }
        gridContainer.appendChild(fragment);
    }

    function updateOutputText() {
        const rawText = gridState.map(row => row.join('')).join('\n');
        outputArea.value = `\`\`\`\n${rawText}\n\`\`\``;
    }

    function drawBox(x1, y1, x2, y2) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        for (let r = minY; r <= maxY; r++) {
            for (let c = minX; c <= maxX; c++) {
                let char = ' ';
                if (r === minY && c === minX) char = '┌';
                else if (r === minY && c === maxX) char = '┐';
                else if (r === maxY && c === minX) char = '└';
                else if (r === maxY && c === maxX) char = '┘';
                else if (r === minY || r === maxY) char = '─';
                else if (c === minX || c === maxX) char = '│';
                gridState[r][c] = char;
            }
        }
    }

    function handleDraw(event) {
        const cell = event.target.closest('span[data-row]');
        if (!cell) return;

        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        if (activeTool === 'draw') {
            if (gridState[row][col] === selectedChar) return;
            gridState[row][col] = selectedChar;
            cell.textContent = selectedChar;
            updateOutputText();
        } else if (activeTool === 'box' && isDrawing) {
            gridState = JSON.parse(JSON.stringify(gridSnapshot));
            drawBox(boxStartX, boxStartY, col, row);
            renderGridFromState();
            updateOutputText();
        }
    }

    // ::NEW:: Centralized function to handle tool selection
    function selectTool(toolElement) {
        if (!toolElement) return;

        // Deactivate previous tool
        document.querySelector('.tool.active-tool')?.classList.remove('active-tool');

        // Activate new tool
        toolElement.classList.add('active-tool');
        activeTool = toolElement.dataset.tool;

        if (activeTool === 'draw') {
            selectedChar = toolElement.dataset.char;
        }
    }

    // --- Event Listeners ---

    createGridBtn.addEventListener('click', () => createGrid(widthInput.value, heightInput.value));
    
    clearGridBtn.addEventListener('click', () => {
        saveStateForUndo();
        gridState = Array.from({ length: gridState.length }, () => Array(gridState[0].length).fill(EMPTY_CHAR));
        renderGridFromState();
        updateOutputText();
    });

    // ::MODIFIED:: Event delegation for all palettes
    palette.addEventListener('click', (e) => {
        const tool = e.target.closest('.tool');
        if (tool) selectTool(tool);
    });
    expandablePalettes.addEventListener('click', (e) => {
        const tool = e.target.closest('.tool');
        if (tool) selectTool(tool);
    });

    addCharBtn.addEventListener('click', () => {
        const char = customCharInput.value;
        if (char) {
            const newTool = document.createElement('span');
            newTool.className = 'tool';
            newTool.dataset.tool = 'draw';
            newTool.dataset.char = char;
            newTool.textContent = char;
            customCharInput.parentElement.appendChild(newTool);
            customCharInput.value = '';
            selectTool(newTool); // Select the newly added tool
        }
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputArea.value).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        }).catch(err => console.error('Failed to copy text: ', err));
    });

    gridContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!e.target.closest('span[data-row]')) return;
        saveStateForUndo();
        isDrawing = true;
        if (activeTool === 'box') {
            const cell = e.target.closest('span[data-row]');
            boxStartX = parseInt(cell.dataset.col, 10);
            boxStartY = parseInt(cell.dataset.row, 10);
            gridSnapshot = JSON.parse(JSON.stringify(gridState));
        }
        handleDraw(e);
    });

    gridContainer.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            handleDraw(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDrawing) {
            isDrawing = false;
            gridSnapshot = [];
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                undo();
            } else if (e.key === 'y') {
                e.preventDefault();
                redo();
            }
        }
    });

    // --- Initial Setup ---
    populatePalette(linesPaletteContainer, lineChars);
    populatePalette(blocksPaletteContainer, blockChars);
    createGrid(widthInput.value, heightInput.value);
});
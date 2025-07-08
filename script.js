// script.js

// --- 1. Seleccionar elementos del DOM ---
// Elementos del Generador de Paletas
const generateBtn = document.getElementById('generatePaletteBtn');
const colorPaletteDisplay = document.querySelector('.color-palette-display'); 
const typeButtons = document.querySelectorAll('.palette-type-controls .type-btn');

// Elementos del Conversor de Unidades CSS
const pxInput = document.getElementById('px-input');
const remInput = document.getElementById('rem-input');
const emInput = document.getElementById('em-input');
const vwInput = document.getElementById('vw-input');
const vhInput = document.getElementById('vh-input');
const copyCssUnitsBtn = document.getElementById('copy-css-units-btn');

// Elementos del Formateador/Validador JSON
const jsonInput = document.getElementById('json-input');
const formatJsonBtn = document.getElementById('format-json-btn');
const validateJsonBtn = document.getElementById('validate-json-btn');
const jsonOutput = document.getElementById('json-output');

// Elementos del Animador de Fondos CSS
const animSpeedInput = document.getElementById('anim-speed');
const animAngleInput = document.getElementById('anim-angle');
const animAngleDisplay = document.getElementById('anim-angle-display');
const animTypeSelect = document.getElementById('anim-type');
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const animatedBgPreview = document.querySelector('.animated-bg-preview');
const generateCssCodeBtn = document.getElementById('generate-css-code-btn');
const cssOutput = document.getElementById('css-output');

// Elementos del Visualizador de Algoritmos
const arraySizeInput = document.getElementById('array-size');
const generateArrayBtn = document.getElementById('generate-array-btn');
const sortArrayBtn = document.getElementById('sort-array-btn'); // Asume que es Bubble Sort por ahora
const algorithmDisplay = document.querySelector('.algorithm-display');
const comparisonCounter = document.getElementById('comparison-counter');
let currentArray = [];
let comparisons = 0;
let animationSpeed = 50; // ms por paso de animación

// Elementos del Generador de Ondas SVG
const waveHeightInput = document.getElementById('wave-height');
const waveCountInput = document.getElementById('wave-count');
const waveAmplitudeInput = document.getElementById('wave-amplitude');
const waveColor1Input = document.getElementById('wave-color1');
const waveColor2Input = document.getElementById('wave-color2');
const invertWaveBtn = document.getElementById('invert-wave-btn');
const svgWaveDisplay = document.getElementById('svg-wave-display');
const svgWaveGradient = document.getElementById('waveGradient');
const svgWavePath = svgWaveDisplay.querySelector('path');
const generateSvgCodeBtn = document.getElementById('generate-svg-code-btn');
const svgOutput = document.getElementById('svg-output');
let isWaveInverted = false;

// Elementos del Simulador de Eventos DOM
const domElementsContainer = document.querySelector('.dom-elements-container');
const parentDiv = document.getElementById('parent-div');
const childDiv = document.getElementById('child-div');
const grandchildDiv = document.getElementById('grandchild-div');
const domLogs = document.getElementById('dom-logs');
const domModeButtons = document.querySelectorAll('.dom-controls .toggle-mode-btn');
const clearDomLogsBtn = document.getElementById('clear-dom-logs-btn');
let currentDomEventMode = 'bubble'; // 'bubble' o 'capture'

// Elementos del Footer
const footerText = document.querySelector('.footer-section p');


// --- 2. Variables de estado y configuración (Generador de Paletas) ---
const NUM_COLORS = 5;
let currentPalette = [];
let lockedColors = new Array(NUM_COLORS).fill(false);
let activePaletteType = 'random';
let baseColor = null;


// --- 3. Funciones de Utilidad de Color (con chroma.js) ---

function getRandomHexColor() {
    return chroma.random().hex();
}

function getContrastTextColor(hex) {
    return chroma(hex).luminance() > 0.43 ? '#333' : '#FFF'; 
}

// --- 4. Lógica de Generación de Paletas Armónicas (usando chroma.js) ---

function generateHarmonicPalette(type, color) {
    let colors = [];
    let base = chroma(color);

    switch (type) {
        case 'monochromatic':
            colors = chroma.scale([base.darken(2), base, base.brighten(2)])
                           .mode('lch')
                           .colors(NUM_COLORS);
            break;
        case 'analogous':
            const h1 = base.hsl()[0];
            colors.push(base.hex());
            colors.push(base.set('hsl.h', (h1 + 30) % 360).hex());
            colors.push(base.set('hsl.h', (h1 - 30 + 360) % 360).hex());
            colors.push(chroma(colors[1]).darken(0.5).hex());
            colors.push(chroma(colors[2]).brighten(0.5).hex());
            break;
        case 'complementary':
            const hComp = base.hsl()[0];
            colors.push(base.hex());
            colors.push(base.set('hsl.h', (hComp + 180) % 360).hex());
            colors.push(base.brighten(1).hex());
            colors.push(base.darken(1).hex());
            colors.push(chroma(colors[1]).brighten(0.5).hex());
            break;
        case 'triadic':
            const hTriad = base.hsl()[0];
            colors.push(base.hex());
            colors.push(base.set('hsl.h', (hTriad + 120) % 360).hex());
            colors.push(base.set('hsl.h', (hTriad + 240) % 360).hex());
            colors.push(chroma(colors[1]).darken(0.5).hex());
            colors.push(chroma(colors[2]).brighten(0.5).hex());
            break;
        default:
            for (let i = 0; i < NUM_COLORS; i++) {
                colors.push(getRandomHexColor());
            }
            break;
    }
    while (colors.length < NUM_COLORS) {
        colors.push(getRandomHexColor());
    }
    return colors.slice(0, NUM_COLORS);
}


// --- 5. Funciones de Renderizado y Lógica Principal (Generador de Paletas) ---

function generatePalette() {
    colorPaletteDisplay.innerHTML = '';

    if (!baseColor || activePaletteType === 'random' || lockedColors.every(l => !l)) {
        baseColor = getRandomHexColor();
    }
    
    let newColors = [];
    if (activePaletteType === 'random') {
        for (let i = 0; i < NUM_COLORS; i++) {
            newColors.push(getRandomHexColor());
        }
    } else {
        newColors = generateHarmonicPalette(activePaletteType, baseColor);
    }

    for (let i = 0; i < NUM_COLORS; i++) {
        let color;
        if (lockedColors[i] && currentPalette[i]) {
            color = currentPalette[i];
        } else {
            color = newColors[i];
        }
        currentPalette[i] = color;

        const textColor = getContrastTextColor(color);

        const colorBox = document.createElement('div');
        colorBox.classList.add('color-box');
        colorBox.style.backgroundColor = color;
        
        if (lockedColors[i]) {
            colorBox.classList.add('locked');
            colorBox.setAttribute('data-locked', 'true');
        } else {
            colorBox.setAttribute('data-locked', 'false');
        }

        colorBox.innerHTML = `
            <span class="hex-code" style="color: ${textColor};">${color}</span>
            <i class="fas ${lockedColors[i] ? 'fa-lock' : 'fa-lock-open'} lock-icon" style="color: ${textColor === '#333' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'};"></i>
        `;

        colorPaletteDisplay.appendChild(colorBox);

        const hexCodeSpan = colorBox.querySelector('.hex-code');
        const lockIcon = colorBox.querySelector('.lock-icon');

        hexCodeSpan.addEventListener('click', () => {
            navigator.clipboard.writeText(color).then(() => {
                const originalText = hexCodeSpan.textContent;
                hexCodeSpan.textContent = '¡Copiado!';
                setTimeout(() => {
                    hexCodeSpan.textContent = originalText;
                }, 1000);
            }).catch(err => {
                console.error('Error al copiar el texto: ', err);
                alert('No se pudo copiar el color. Por favor, intente de nuevo.');
            });
        });

        lockIcon.addEventListener('click', () => {
            const index = Array.from(colorPaletteDisplay.children).indexOf(colorBox);
            lockedColors[index] = !lockedColors[index];
            colorBox.classList.toggle('locked', lockedColors[index]);
            colorBox.setAttribute('data-locked', lockedColors[index]);
            lockIcon.classList.toggle('fa-lock', lockedColors[index]);
            lockIcon.classList.toggle('fa-lock-open', !lockedColors[index]);
            console.log(`Color ${color} ${lockedColors[index] ? 'bloqueado' : 'desbloqueado'}`);
        });
    }
}


// --- 6. Event Listeners Globales (Generador de Paletas) ---

generateBtn.addEventListener('click', generatePalette);

typeButtons.forEach(button => {
    button.addEventListener('click', () => {
        typeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        activePaletteType = button.dataset.type;

        lockedColors.fill(false);
        
        if (activePaletteType !== 'random') {
            baseColor = getRandomHexColor();
        } else {
            baseColor = null;
        }

        console.log(`Tipo de paleta seleccionado: ${activePaletteType}`);
        generatePalette();
    });
});


// --- 7. Lógica para Nuevas Funcionalidades ---

// --- Conversor de Unidades CSS ---
const BASE_FONT_SIZE_PX = 16; 

function convertUnits(inputElement) {
    const value = parseFloat(inputElement.value);
    if (isNaN(value)) { // Limpiar otros campos si el valor no es un número
        [pxInput, remInput, emInput, vwInput, vhInput].forEach(input => {
            if (input !== inputElement) input.value = '';
        });
        return;
    }

    const id = inputElement.id;

    let px, rem, em, vw, vh;

    // Convertir de la unidad de entrada a PX primero para consistencia
    switch (id) {
        case 'px-input':
            px = value;
            break;
        case 'rem-input':
            px = value * BASE_FONT_SIZE_PX;
            break;
        case 'em-input':
            px = value * BASE_FONT_SIZE_PX;
            break;
        case 'vw-input':
            px = (value / 100) * window.innerWidth;
            break;
        case 'vh-input':
            px = (value / 100) * window.innerHeight;
            break;
    }

    // Convertir PX a todas las otras unidades
    rem = px / BASE_FONT_SIZE_PX;
    em = px / BASE_FONT_SIZE_PX;
    vw = (px / window.innerWidth) * 100;
    vh = (px / window.innerHeight) * 100;

    // Actualizar los otros campos, redondeando a 3 decimales
    if (id !== 'px-input') pxInput.value = px.toFixed(3);
    if (id !== 'rem-input') remInput.value = rem.toFixed(3);
    if (id !== 'em-input') emInput.value = em.toFixed(3);
    if (id !== 'vw-input') vwInput.value = vw.toFixed(3);
    if (id !== 'vh-input') vhInput.value = vh.toFixed(3);
}

// Añadir event listeners a todos los inputs del conversor
[pxInput, remInput, emInput, vwInput, vhInput].forEach(input => {
    input.addEventListener('input', () => convertUnits(input));
});

// Ajustar VW/VH en redimensionamiento de ventana
window.addEventListener('resize', () => {
    // Si el PX tiene un valor, recalculamos todo desde PX
    if (pxInput.value) {
        convertUnits(pxInput);
    }
});


// Función para copiar todas las unidades
copyCssUnitsBtn.addEventListener('click', () => {
    const textToCopy = `
        px: ${pxInput.value ? pxInput.value + 'px' : ''};
        rem: ${remInput.value ? remInput.value + 'rem' : ''};
        em: ${emInput.value ? emInput.value + 'em' : ''};
        vw: ${vwInput.value ? vwInput.value + 'vw' : ''};
        vh: ${vhInput.value ? vhInput.value + 'vh' : ''};
    `.split('\n').map(line => line.trim()).filter(line => line).join('\n'); // Limpiar líneas vacías

    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyCssUnitsBtn.textContent;
        copyCssUnitsBtn.textContent = '¡Copiado!';
        setTimeout(() => {
            copyCssUnitsBtn.textContent = originalText;
        }, 1500);
    }).catch(err => {
        console.error('Error al copiar el texto: ', err);
        alert('No se pudo copiar las unidades. Por favor, intente de nuevo.');
    });
});


// --- Formateador / Validador JSON ---

formatJsonBtn.addEventListener('click', () => {
    const jsonString = jsonInput.value.trim();
    if (!jsonString) {
        jsonOutput.textContent = 'Por favor, introduce un JSON.';
        jsonOutput.classList.add('error');
        return;
    }
    try {
        const parsedJson = JSON.parse(jsonString);
        jsonOutput.textContent = JSON.stringify(parsedJson, null, 2); // Formatear con 2 espacios
        jsonOutput.classList.remove('error');
        jsonOutput.style.color = ''; // Resetear color de éxito si estaba
        jsonOutput.style.borderColor = '';
    } catch (e) {
        jsonOutput.textContent = `Error de formato JSON: ${e.message}`;
        jsonOutput.classList.add('error');
    }
});

validateJsonBtn.addEventListener('click', () => {
    const jsonString = jsonInput.value.trim();
    if (!jsonString) {
        jsonOutput.textContent = 'Por favor, introduce un JSON.';
        jsonOutput.classList.add('error');
        return;
    }
    try {
        JSON.parse(jsonString);
        jsonOutput.textContent = '¡JSON válido!';
        jsonOutput.classList.remove('error');
        jsonOutput.style.color = '#66bb6a'; // Verde para éxito
        jsonOutput.style.borderColor = '#66bb6a';
        setTimeout(() => {
            jsonOutput.textContent = ''; // Limpiar después de un tiempo
            jsonOutput.style.color = '';
            jsonOutput.style.borderColor = '';
        }, 2000);
    } catch (e) {
        jsonOutput.textContent = `JSON inválido: ${e.message}`;
        jsonOutput.classList.add('error');
        jsonOutput.style.color = ''; // Asegurar que el error use el estilo CSS
        jsonOutput.style.borderColor = '';
    }
});


// --- Animador de Fondos CSS ---

function updateAnimatedBackground() {
    const speed = animSpeedInput.value;
    const angle = animAngleInput.value;
    const type = animTypeSelect.value;
    const color1 = color1Input.value;
    const color2 = color2Input.value;

    animAngleDisplay.textContent = `${angle}°`;

    let gradientCss = '';
    if (type === 'linear-gradient') {
        gradientCss = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    } else if (type === 'radial-gradient') {
        gradientCss = `radial-gradient(circle at center, ${color1}, ${color2})`;
    }
    
    animatedBgPreview.style.background = gradientCss;
    animatedBgPreview.style.animationDuration = `${speed}s`;
    animatedBgPreview.style.animationName = 'gradientMove'; // Asegura que la animación esté activa
}

// Event listeners para los controles del animador
animSpeedInput.addEventListener('input', updateAnimatedBackground);
animAngleInput.addEventListener('input', updateAnimatedBackground);
animTypeSelect.addEventListener('change', updateAnimatedBackground);
color1Input.addEventListener('input', updateAnimatedBackground);
color2Input.addEventListener('input', updateAnimatedBackground);

generateCssCodeBtn.addEventListener('click', () => {
    const speed = animSpeedInput.value;
    const angle = animAngleInput.value;
    const type = animTypeSelect.value;
    const color1 = color1Input.value;
    const color2 = color2Input.value;

    let gradientCss = '';
    if (type === 'linear-gradient') {
        gradientCss = `background: linear-gradient(${angle}deg, ${color1}, ${color2});`;
    } else if (type === 'radial-gradient') {
        gradientCss = `background: radial-gradient(circle at center, ${color1}, ${color2});`;
    }

    const cssCode = `
.my-animated-background {
    ${gradientCss}
    background-size: 400% 400%;
    animation: gradientMove ${speed}s ease infinite;
}

@keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
    `.trim();
    
    cssOutput.textContent = cssCode;
    cssOutput.classList.remove('error');
    cssOutput.style.color = '';
    cssOutput.style.borderColor = '';
});


// --- Visualizador de Algoritmos Básicos (Bubble Sort) ---

function generateRandomArray() {
    const size = parseInt(arraySizeInput.value);
    currentArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    renderArray(currentArray);
    comparisons = 0;
    comparisonCounter.textContent = comparisons;
}

function renderArray(arr, highlightIndices = [], sortedIndices = []) {
    algorithmDisplay.innerHTML = '';
    const maxVal = Math.max(...arr);
    const barWidth = 100 / arr.length - 2; // Ancho en porcentaje con gap

    arr.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('array-bar');
        bar.style.height = `${(value / maxVal) * 90 + 10}%`; // Altura relativa, min 10% para visibilidad
        bar.style.width = `${barWidth}%`;
        if (highlightIndices.includes(index)) {
            bar.classList.add('highlight');
        }
        if (sortedIndices.includes(index)) {
            bar.classList.add('sorted');
        }
        algorithmDisplay.appendChild(bar);
    });
}

// Algoritmo de Burbuja (asíncrono para animación)
async function bubbleSort(arr) {
    const n = arr.length;
    let swapped;
    let sortedIndices = [];

    for (let i = 0; i < n - 1; i++) {
        swapped = false;
        for (let j = 0; j < n - 1 - i; j++) {
            comparisons++;
            comparisonCounter.textContent = comparisons;

            renderArray(arr, [j, j + 1], sortedIndices); // Resaltar elementos siendo comparados
            await new Promise(resolve => setTimeout(resolve, animationSpeed)); // Pausar

            if (arr[j] > arr[j + 1]) {
                // Intercambiar
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
                renderArray(arr, [j, j + 1], sortedIndices); // Mostrar después del intercambio
                await new Promise(resolve => setTimeout(resolve, animationSpeed));
            }
        }
        sortedIndices.push(n - 1 - i); // Marcar el elemento más grande como ordenado
        if (!swapped) break; // Si no hubo intercambios, el array está ordenado
    }
    // Marcar el primer elemento como ordenado si solo quedó uno
    if (sortedIndices.length < n) {
        for(let k = 0; k < n - sortedIndices.length; k++) {
            sortedIndices.push(k);
        }
    }
    renderArray(arr, [], sortedIndices); // Renderizar array completamente ordenado
}

// Event Listeners para el visualizador de algoritmos
arraySizeInput.addEventListener('input', generateRandomArray);
generateArrayBtn.addEventListener('click', generateRandomArray);
sortArrayBtn.addEventListener('click', async () => {
    comparisons = 0; // Resetear contador al iniciar ordenamiento
    comparisonCounter.textContent = comparisons;
    sortArrayBtn.disabled = true; // Deshabilitar botón durante la animación
    generateArrayBtn.disabled = true;
    await bubbleSort([...currentArray]); // Usar una copia para no modificar el original directamente si se quiere reiniciar
    sortArrayBtn.disabled = false; // Habilitar de nuevo
    generateArrayBtn.disabled = false;
});


// --- Generador de Ondas SVG ---

function updateSvgWave() {
    const height = parseInt(waveHeightInput.value);
    const count = parseInt(waveCountInput.value);
    const amplitude = parseInt(waveAmplitudeInput.value);
    const color1 = waveColor1Input.value;
    const color2 = waveColor2Input.value;

    const viewBoxWidth = 800; // Ancho fijo del viewBox
    const segmentWidth = viewBoxWidth / (count * 2); // Cada curva tiene dos segmentos (Q y T)

    let pathD = `M0,${height}`; // Mover al inicio de la onda

    for (let i = 0; i < count; i++) {
        const x1 = i * segmentWidth * 2 + segmentWidth;
        const y1 = isWaveInverted ? (height + amplitude) : (height - amplitude);
        const x2 = i * segmentWidth * 2 + segmentWidth * 2;
        const y2 = height;

        pathD += ` Q${x1},${y1} ${x2},${y2}`;

        // Para la segunda parte del "T", el control point está "más allá"
        const x3 = x2 + segmentWidth;
        const y3 = isWaveInverted ? (height - amplitude) : (height + amplitude);
        const x4 = x2 + segmentWidth * 2;
        const y4 = height;
        pathD += ` T${x4},${y4}`;
    }

    pathD += ` V200 H0 Z`; // Cerrar la forma del SVG

    svgWavePath.setAttribute('d', pathD);

    // Actualizar los colores del degradado
    const stop1 = svgWaveGradient.querySelector('stop:nth-child(1)');
    const stop2 = svgWaveGradient.querySelector('stop:nth-child(2)');
    stop1.setAttribute('stop-color', color1);
    stop2.setAttribute('stop-color', color2);
}

// Event Listeners para el generador de ondas SVG
[waveHeightInput, waveCountInput, waveAmplitudeInput, waveColor1Input, waveColor2Input].forEach(input => {
    input.addEventListener('input', updateSvgWave);
});

invertWaveBtn.addEventListener('click', () => {
    isWaveInverted = !isWaveInverted;
    invertWaveBtn.textContent = isWaveInverted ? 'Desinvertir Onda' : 'Invertir Onda';
    updateSvgWave();
});

generateSvgCodeBtn.addEventListener('click', () => {
    const svgCode = `
<svg width="100%" height="${svgWaveDisplay.getAttribute('height')}" viewBox="${svgWaveDisplay.getAttribute('viewBox')}" preserveAspectRatio="none">
    <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${waveColor1Input.value}" />
            <stop offset="100%" style="stop-color:${waveColor2Input.value}" />
        </linearGradient>
    </defs>
    <path fill="url(#waveGradient)" d="${svgWavePath.getAttribute('d')}"></path>
</svg>
    `.trim();
    svgOutput.textContent = svgCode;
    svgOutput.classList.remove('error');
    svgOutput.style.color = '';
    svgOutput.style.borderColor = '';
});


// --- Simulador de Eventos DOM ---

function logEvent(e, phase) {
    const targetId = e.currentTarget.id || e.currentTarget.tagName;
    const logEntry = document.createElement('span');
    logEntry.innerHTML = `
        <span class="event-phase">${phase}</span>
        <span class="event-type">Click</span>
        en <span class="event-target">${targetId}</span>
    `;
    domLogs.appendChild(logEntry);
    domLogs.scrollTop = domLogs.scrollHeight; // Scroll automático al final
    domLogs.appendChild(document.createElement('br')); // Salto de línea
}

function attachDomEventListeners() {
    // Eliminar listeners previos para evitar duplicados al cambiar de modo
    parentDiv.removeEventListener('click', (e) => logEvent(e, 'Captura'), true);
    childDiv.removeEventListener('click', (e) => logEvent(e, 'Captura'), true);
    grandchildDiv.removeEventListener('click', (e) => logEvent(e, 'Captura'), true);

    parentDiv.removeEventListener('click', (e) => logEvent(e, 'Burbujeo'), false);
    childDiv.removeEventListener('click', (e) => logEvent(e, 'Burbujeo'), false);
    grandchildDiv.removeEventListener('click', (e) => logEvent(e, 'Burbujeo'), false);


    if (currentDomEventMode === 'capture') {
        parentDiv.addEventListener('click', (e) => logEvent(e, 'Captura'), true);
        childDiv.addEventListener('click', (e) => logEvent(e, 'Captura'), true);
        grandchildDiv.addEventListener('click', (e) => logEvent(e, 'Captura'), true);
    } else { // 'bubble'
        parentDiv.addEventListener('click', (e) => logEvent(e, 'Burbujeo'), false);
        childDiv.addEventListener('click', (e) => logEvent(e, 'Burbujeo'), false);
        grandchildDiv.addEventListener('click', (e) => logEvent(e, 'Burbujeo'), false);
    }
}

// Event Listeners para el simulador de eventos DOM
domModeButtons.forEach(button => {
    button.addEventListener('click', () => {
        domModeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentDomEventMode = button.dataset.mode;
        domLogs.textContent = ''; // Limpiar logs al cambiar de modo
        attachDomEventListeners(); // Re-adjuntar listeners con el nuevo modo
    });
});

clearDomLogsBtn.addEventListener('click', () => {
    domLogs.textContent = '';
});

// --- 8. Inicialización ---

window.onload = () => {
    footerText.innerHTML = 'Hecho por <strong>Saúl Hernández</strong>'; 
    generatePalette(); // Carga la paleta inicial
    updateAnimatedBackground(); // Inicializa el animador de fondos
    generateRandomArray(); // Genera un array inicial para el visualizador de algoritmos
    updateSvgWave(); // Inicializa la onda SVG
    attachDomEventListeners(); // Adjuntar listeners DOM inicialmente

    // Inicializar el conversor con valores por defecto
    pxInput.value = 16;
    remInput.value = 1;
    emInput.value = 1;
    vwInput.value = (16 / window.innerWidth * 100).toFixed(3);
    vhInput.value = (16 / window.innerHeight * 100).toFixed(3);
};

// Ajustar VW/VH en redimensionamiento de ventana
window.addEventListener('resize', () => {
    if (pxInput.value) { // Solo si hay un valor en px
        convertUnits(pxInput);
    }
    // Si tienes alguna otra funcionalidad que dependa del tamaño de la ventana
    // podrías llamarla aquí también, ej: updateSvgWave();
});

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

// Elementos del Footer
const footerText = document.querySelector('.footer-section p');


// --- 2. Variables de estado y configuración ---
const NUM_COLORS = 5; // Número de colores en la paleta
let currentPalette = []; // Almacena los colores actuales de la paleta
let lockedColors = new Array(NUM_COLORS).fill(false); // Estado de bloqueo para cada color
let activePaletteType = 'random'; // Tipo de paleta activa (por defecto 'random')
let baseColor = null; // Color base para generar paletas armónicas


// --- 3. Funciones de Utilidad de Color (con chroma.js) ---

function getRandomHexColor() {
    return chroma.random().hex();
}

function getContrastTextColor(hex) {
    // Ajustado el umbral para mejor contraste en fondos claros/oscuros
    return chroma(hex).luminance() > 0.43 ? '#333' : '#FFF'; 
}

// --- 4. Lógica de Generación de Paletas Armónicas (usando chroma.js) ---

function generateHarmonicPalette(type, color) {
    let colors = [];
    let base = chroma(color);

    switch (type) {
        case 'monochromatic':
            colors = chroma.scale([base.darken(2), base, base.brighten(2)])
                           .mode('lch') // Lch mode para transiciones más suaves
                           .colors(NUM_COLORS);
            break;
        case 'analogous':
            // Genera colores análogos (30 grados de diferencia en el hue)
            const h1 = base.hsl()[0];
            colors.push(base.hex());
            colors.push(base.set('hsl.h', (h1 + 30) % 360).hex());
            colors.push(base.set('hsl.h', (h1 - 30 + 360) % 360).hex());
            // Añade variaciones de luminosidad para completar los 5 colores
            colors.push(chroma(colors[1]).darken(0.5).hex());
            colors.push(chroma(colors[2]).brighten(0.5).hex());
            break;
        case 'complementary':
            // Genera colores complementarios y sus variaciones
            const hComp = base.hsl()[0];
            colors.push(base.hex());
            colors.push(base.set('hsl.h', (hComp + 180) % 360).hex());
            colors.push(base.brighten(1).hex());
            colors.push(base.darken(1).hex());
            colors.push(chroma(colors[1]).brighten(0.5).hex());
            break;
        case 'triadic':
            // Genera colores triádicos y sus variaciones
            const hTriad = base.hsl()[0];
            colors.push(base.hex());
            colors.push(base.set('hsl.h', (hTriad + 120) % 360).hex());
            colors.push(base.set('hsl.h', (hTriad + 240) % 360).hex());
            colors.push(chroma(colors[1]).darken(0.5).hex());
            colors.push(chroma(colors[2]).brighten(0.5).hex());
            break;
        default: // Fallback a aleatorio si el tipo no es reconocido
            for (let i = 0; i < NUM_COLORS; i++) {
                colors.push(getRandomHexColor());
            }
            break;
    }
    // Asegura que siempre haya NUM_COLORS, rellenando con aleatorios si es necesario
    while (colors.length < NUM_COLORS) {
        colors.push(getRandomHexColor());
    }
    return colors.slice(0, NUM_COLORS); // Recorta al número exacto de colores
}


// --- 5. Funciones de Renderizado y Lógica Principal (Generador de Paletas) ---

function generatePalette() {
    colorPaletteDisplay.innerHTML = ''; // Limpiar paleta anterior

    // Si no hay color base o el tipo es aleatorio, o no hay colores bloqueados, genera un nuevo color base
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
            color = currentPalette[i]; // Mantiene el color bloqueado
        } else {
            color = newColors[i]; // Asigna un nuevo color
        }
        currentPalette[i] = color; // Actualiza la paleta actual

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

        // Event listener para copiar el código HEX
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

        // Event listener para bloquear/desbloquear el color
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

        // Desbloquear todos los colores al cambiar el tipo de paleta
        lockedColors.fill(false);
        
        // Si el tipo no es aleatorio, se necesita un nuevo color base
        if (activePaletteType !== 'random') {
            baseColor = getRandomHexColor();
        } else {
            baseColor = null; // No se necesita un color base para paletas aleatorias
        }

        console.log(`Tipo de paleta seleccionado: ${activePaletteType}`);
        generatePalette();
    });
});


// --- 7. Lógica para Nuevas Funcionalidades ---

// --- Conversor de Unidades CSS ---
const BASE_FONT_SIZE_PX = 16; // Tamaño de fuente base común para conversiones

function convertUnits(inputElement) {
    const value = parseFloat(inputElement.value);
    if (isNaN(value)) return;

    const id = inputElement.id;

    let px, rem, em, vw, vh;

    switch (id) {
        case 'px-input':
            px = value;
            rem = px / BASE_FONT_SIZE_PX;
            em = px / BASE_FONT_SIZE_PX; // Asumiendo que 1em = 16px por defecto
            vw = (px / window.innerWidth) * 100;
            vh = (px / window.innerHeight) * 100;
            break;
        case 'rem-input':
            rem = value;
            px = rem * BASE_FONT_SIZE_PX;
            em = rem; // rem y em son iguales si la base es la misma
            vw = (px / window.innerWidth) * 100;
            vh = (px / window.innerHeight) * 100;
            break;
        case 'em-input':
            em = value;
            px = em * BASE_FONT_SIZE_PX;
            rem = em;
            vw = (px / window.innerWidth) * 100;
            vh = (px / window.innerHeight) * 100;
            break;
        case 'vw-input':
            vw = value;
            px = (vw / 100) * window.innerWidth;
            rem = px / BASE_FONT_SIZE_PX;
            em = px / BASE_FONT_SIZE_PX;
            vh = (px / window.innerHeight) * 100; // Esto no es estrictamente correcto, pero mantiene la proporción
            break;
        case 'vh-input':
            vh = value;
            px = (vh / 100) * window.innerHeight;
            rem = px / BASE_FONT_SIZE_PX;
            em = px / BASE_FONT_SIZE_PX;
            vw = (px / window.innerWidth) * 100; // Esto no es estrictamente correcto
            break;
    }

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

// Función para copiar todas las unidades
copyCssUnitsBtn.addEventListener('click', () => {
    const textToCopy = `
        px: ${pxInput.value}px;
        rem: ${remInput.value}rem;
        em: ${emInput.value}em;
        vw: ${vwInput.value}vw;
        vh: ${vhInput.value}vh;
    `.trim();

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
        jsonOutput.style.color = '#4CAF50'; // Verde para éxito
        jsonOutput.style.borderColor = '#4CAF50';
        setTimeout(() => {
            jsonOutput.style.color = ''; // Resetear color
            jsonOutput.style.borderColor = ''; // Resetear borde
        }, 2000);
    } catch (e) {
        jsonOutput.textContent = `JSON inválido: ${e.message}`;
        jsonOutput.classList.add('error');
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
    cssOutput.classList.remove('error'); // Limpiar cualquier estilo de error previo
    cssOutput.style.color = ''; // Resetear color de texto
    cssOutput.style.borderColor = ''; // Resetear color de borde
});


// --- 8. Inicialización ---

window.onload = () => {
    footerText.innerHTML = 'Hecho por <strong>Saúl Hernández</strong>'; 
    generatePalette(); // Carga la paleta inicial
    updateAnimatedBackground(); // Inicializa el animador de fondos
    
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
});

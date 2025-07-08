// script.js

// --- 1. Seleccionar elementos del DOM ---
// Elementos del Generador de Paletas
const generateBtn = document.getElementById('generatePaletteBtn');
// Selector actualizado para el contenedor de los colores dentro de su módulo
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
    colorPaletteDisplay.innerHTML = ''; // Limpiar paleta anterior

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


// --- 7. Lógica para Nuevas Funcionalidades (Se implementará en el siguiente paso) ---

// Conversor de Unidades CSS
// ... (Aquí irá el código JavaScript para el conversor)

// Formateador / Validador JSON
// ... (Aquí irá el código JavaScript para el JSON)

// Animador de Fondos CSS
// ... (Aquí irá el código JavaScript para el animador)


// --- 8. Inicialización ---

window.onload = () => {
    footerText.innerHTML = 'Hecho por <strong>Saúl Hernández</strong>'; 
    generatePalette(); // Carga la paleta inicial
    
    // Aquí podrías inicializar otras herramientas si tienen un estado inicial
    // Por ejemplo, cargar un ejemplo en el JSON input.
};

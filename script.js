// script.js

// --- 1. Seleccionar elementos del DOM ---
const generateBtn = document.getElementById('generatePaletteBtn');
const colorPaletteContainer = document.querySelector('.color-palette-container');
const typeButtons = document.querySelectorAll('.type-btn');
const footerText = document.querySelector('.footer-section p');

// --- 2. Variables de estado y configuración ---
const NUM_COLORS = 5; // Número de colores en la paleta
let currentPalette = []; // Almacena los colores actuales de la paleta
let lockedColors = new Array(NUM_COLORS).fill(false); // Estado de bloqueo para cada color
let activePaletteType = 'random'; // Tipo de paleta activa (por defecto 'random' si no se selecciona nada)

// --- 3. Funciones de Utilidad de Color ---

// Función para generar un color HEX aleatorio
function getRandomHexColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// Función para convertir HEX a RGB
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    // Manejar formato corto (e.g., #FFF)
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
}

// Función para calcular la luminosidad de un color (para determinar si el texto debe ser blanco o negro)
function getLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    // Fórmula de luminosidad relativa (perceptual)
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Función para obtener el color de texto de contraste (blanco o negro)
function getContrastTextColor(hex) {
    return getLuminance(hex) > 0.5 ? '#333' : '#FFF'; // Si es claro, texto oscuro; si es oscuro, texto claro
}

// --- 4. Funciones de Renderizado y Lógica Principal ---

// Función para generar una paleta de colores (inicialmente aleatoria)
function generatePalette() {
    colorPaletteContainer.innerHTML = ''; // Limpiar paleta anterior

    for (let i = 0; i < NUM_COLORS; i++) {
        let color;
        if (lockedColors[i] && currentPalette[i]) {
            color = currentPalette[i]; // Mantener el color bloqueado
        } else {
            // Aquí es donde la lógica para tipos de paleta se volvería más compleja.
            // Por ahora, solo generamos colores aleatorios.
            // Para "monocromática", "análoga", etc., se necesitaría una librería como 'chroma.js'
            // o funciones matemáticas de teoría del color.
            color = getRandomHexColor();
        }
        currentPalette[i] = color; // Actualizar el color en la paleta actual

        const textColor = getContrastTextColor(color); // Obtener color de texto de contraste

        const colorBox = document.createElement('div');
        colorBox.classList.add('color-box');
        colorBox.style.backgroundColor = color;
        // Establecer el estado de bloqueo para el CSS
        if (lockedColors[i]) {
            colorBox.classList.add('locked');
        }

        colorBox.innerHTML = `
            <span class="hex-code" style="color: ${textColor};">${color}</span>
            <i class="fas ${lockedColors[i] ? 'fa-lock' : 'fa-lock-open'} lock-icon" style="color: ${textColor === '#333' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'};"></i>
        `;

        colorPaletteContainer.appendChild(colorBox);

        // Añadir Event Listeners a los nuevos elementos
        const hexCodeSpan = colorBox.querySelector('.hex-code');
        const lockIcon = colorBox.querySelector('.lock-icon');

        // Copiar HEX al clickear
        hexCodeSpan.addEventListener('click', () => {
            navigator.clipboard.writeText(color).then(() => {
                // Pequeño feedback visual
                const originalText = hexCodeSpan.textContent;
                hexCodeSpan.textContent = '¡Copiado!';
                setTimeout(() => {
                    hexCodeSpan.textContent = originalText;
                }, 1000);
            }).catch(err => {
                console.error('Error al copiar el texto: ', err);
            });
        });

        // Bloquear/Desbloquear color
        lockIcon.addEventListener('click', () => {
            lockedColors[i] = !lockedColors[i]; // Invertir el estado de bloqueo
            colorBox.classList.toggle('locked', lockedColors[i]); // Añadir/Quitar clase CSS
            lockIcon.classList.toggle('fa-lock', lockedColors[i]);
            lockIcon.classList.toggle('fa-lock-open', !lockedColors[i]);
            console.log(`Color ${color} ${lockedColors[i] ? 'bloqueado' : 'desbloqueado'}`);
        });
    }
}

// --- 5. Event Listeners Globales ---

// Botón de Generar Paleta
generateBtn.addEventListener('click', generatePalette);

// Botones de tipo de paleta
typeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remover 'active' de todos
        typeButtons.forEach(btn => btn.classList.remove('active'));
        // Añadir 'active' al clickeado
        button.classList.add('active');
        activePaletteType = button.dataset.type; // Obtener el tipo de paleta del atributo data
        console.log(`Tipo de paleta seleccionado: ${activePaletteType}`);

        // AQUI: Si tuvieras la lógica para generar diferentes tipos de paletas,
        // llamarías a una función específica aquí, o pasarías 'activePaletteType'
        // a 'generatePalette()' para que se encargara.
        // Por ahora, solo genera aleatoriamente, independientemente del tipo seleccionado.
        generatePalette();
    });
});

// --- 6. Inicialización ---

// Cargar una paleta inicial al cargar la página
window.onload = () => {
    generatePalette();
    // Actualizar el texto del footer (cambiar "OpenAI" por tu nombre)
    footerText.innerHTML = 'Hecho por <strong>Tu Nombre</strong>'; // <--- ¡IMPORTANTE! Cambia "Tu Nombre"
};

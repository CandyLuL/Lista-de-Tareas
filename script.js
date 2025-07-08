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
let activePaletteType = 'random'; // Tipo de paleta activa (por defecto 'random')
let baseColor = null; // Color base para generar paletas armónicas

// --- 3. Funciones de Utilidad de Color (con chroma.js) ---

// Función para obtener un color HEX aleatorio
function getRandomHexColor() {
    return chroma.random().hex();
}

// Función para obtener el color de texto de contraste (blanco o negro) usando chroma.js
function getContrastTextColor(hex) {
    // Usamos el umbral 0.5 para la luminosidad, pero 0.43 a veces es mejor para el texto oscuro sobre fondo claro
    return chroma(hex).luminance() > 0.43 ? '#333' : '#FFF'; 
}

// --- 4. Lógica de Generación de Paletas Armónicas (usando chroma.js) ---

function generateHarmonicPalette(type, color) {
    let colors = [];
    let base = chroma(color);

    switch (type) {
        case 'monochromatic':
            // Genera una gama de tonos del mismo color, ajustando la luminosidad
            colors = chroma.scale([base.darken(2), base, base.brighten(2)])
                           .mode('lch') // Usa el modo LCH para transiciones más suaves
                           .colors(NUM_COLORS);
            break;
        case 'analogous':
            // Colores adyacentes en la rueda de color (60 grados de diferencia en total)
            // Generamos 3 principales y 2 variaciones de brillo/oscuridad
            const h1 = base.hsl()[0];
            colors.push(base.hex()); // Color base
            colors.push(base.set('hsl.h', (h1 + 30) % 360).hex()); // +30 grados
            colors.push(base.set('hsl.h', (h1 - 30 + 360) % 360).hex()); // -30 grados
            
            // Añadir variaciones de luminosidad
            colors.push(chroma(colors[1]).darken(0.5).hex());
            colors.push(chroma(colors[2]).brighten(0.5).hex());
            break;
        case 'complementary':
            // Colores opuestos en la rueda de color
            const hComp = base.hsl()[0];
            colors.push(base.hex()); // Color base
            colors.push(base.set('hsl.h', (hComp + 180) % 360).hex()); // Complementario
            
            // Añadir variaciones de luminosidad
            colors.push(base.brighten(1).hex());
            colors.push(base.darken(1).hex());
            colors.push(chroma(colors[1]).brighten(0.5).hex()); // Complementario más claro
            break;
        case 'triadic':
            // Tres colores equidistantes en la rueda (120 grados de diferencia)
            const hTriad = base.hsl()[0];
            colors.push(base.hex()); // Color base
            colors.push(base.set('hsl.h', (hTriad + 120) % 360).hex()); // Triádico 1
            colors.push(base.set('hsl.h', (hTriad + 240) % 360).hex()); // Triádico 2

            // Añadir variaciones de luminosidad
            colors.push(chroma(colors[1]).darken(0.5).hex());
            colors.push(chroma(colors[2]).brighten(0.5).hex());
            break;
        default: // 'random'
            for (let i = 0; i < NUM_COLORS; i++) {
                colors.push(getRandomHexColor());
            }
            break;
    }
    // Asegurarse de que siempre haya NUM_COLORS colores y cortar/rellenar si es necesario
    while (colors.length < NUM_COLORS) {
        colors.push(getRandomHexColor()); // Rellenar con aleatorios si no hay suficientes
    }
    return colors.slice(0, NUM_COLORS); // Cortar si se generaron demasiados
}


// --- 5. Funciones de Renderizado y Lógica Principal ---

// Función para generar y mostrar la paleta de colores
function generatePalette() {
    colorPaletteContainer.innerHTML = ''; // Limpiar paleta anterior

    // Si no hay un color base (primera carga o tipo aleatorio), elige uno.
    // O si todos los colores están desbloqueados y el tipo es armónico, elige un nuevo baseColor.
    if (!baseColor || activePaletteType === 'random' || lockedColors.every(l => !l)) {
        baseColor = getRandomHexColor();
    }
    
    let newColors = [];

    // Generar la paleta según el tipo activo
    if (activePaletteType === 'random') {
        for (let i = 0; i < NUM_COLORS; i++) {
            newColors.push(getRandomHexColor());
        }
    } else {
        // Generar una paleta armónica con el baseColor
        newColors = generateHarmonicPalette(activePaletteType, baseColor);
    }

    // Aplicar los colores, respetando los bloqueados
    for (let i = 0; i < NUM_COLORS; i++) {
        let color;
        if (lockedColors[i] && currentPalette[i]) {
            color = currentPalette[i]; // Mantener el color bloqueado
        } else {
            color = newColors[i]; // Usar el color generado o aleatorio
        }
        currentPalette[i] = color; // Actualizar el color en la paleta actual

        const textColor = getContrastTextColor(color); // Obtener color de texto de contraste

        const colorBox = document.createElement('div');
        colorBox.classList.add('color-box');
        colorBox.style.backgroundColor = color;
        
        // Establecer el estado de bloqueo para el CSS y el data-attribute
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
                alert('No se pudo copiar el color. Por favor, intente de nuevo.');
            });
        });

        // Bloquear/Desbloquear color
        lockIcon.addEventListener('click', () => {
            const index = Array.from(colorPaletteContainer.children).indexOf(colorBox); // Obtener el índice del colorBox
            lockedColors[index] = !lockedColors[index]; // Invertir el estado de bloqueo
            colorBox.classList.toggle('locked', lockedColors[index]); // Añadir/Quitar clase CSS
            colorBox.setAttribute('data-locked', lockedColors[index]); // Actualizar data-attribute
            lockIcon.classList.toggle('fa-lock', lockedColors[index]);
            lockIcon.classList.toggle('fa-lock-open', !lockedColors[index]);
            console.log(`Color ${color} ${lockedColors[index] ? 'bloqueado' : 'desbloqueado'}`);
        });
    }
}

// --- 6. Event Listeners Globales ---

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

        // Si se cambia el tipo de paleta, se recomienda desbloquear todos los colores
        // y generar una nueva paleta desde cero con el nuevo tipo.
        lockedColors.fill(false); // Desbloquear todos los colores
        
        // Si el tipo no es 'random', elegimos un nuevo color base
        if (activePaletteType !== 'random') {
            baseColor = getRandomHexColor();
        } else {
            baseColor = null; // Reiniciar baseColor para tipo aleatorio
        }

        console.log(`Tipo de paleta seleccionado: ${activePaletteType}`);
        generatePalette();
    });
});

// --- 7. Inicialización ---

// Cargar una paleta inicial al cargar la página
window.onload = () => {
    // Establecer el texto del footer con tu nombre
    footerText.innerHTML = 'Hecho por <strong>Saúl Hernández</strong>'; 
    generatePalette();
};

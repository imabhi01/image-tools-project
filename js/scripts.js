
// Utility Functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Image Compressor
let compressOriginalFile = null;
let compressedDataUrl = null;

const compressUpload = document.getElementById('compressUpload');
const compressFile = document.getElementById('compressFile');
const quality = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const compressPreview = document.getElementById('compressPreview');

quality.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
});

compressUpload.addEventListener('click', () => compressFile.click());
compressUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    compressUpload.classList.add('dragover');
});
compressUpload.addEventListener('dragleave', () => {
    compressUpload.classList.remove('dragover');
});
compressUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    compressUpload.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        compressFile.files = e.dataTransfer.files;
        handleCompressFile(e.dataTransfer.files[0]);
    }
});

compressFile.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleCompressFile(e.target.files[0]);
    }
});

function handleCompressFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    compressOriginalFile = file;
    compressBtn.disabled = false;
    document.getElementById('originalSize').textContent = formatBytes(file.size);
}

compressBtn.addEventListener('click', () => {
    if (!compressOriginalFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const q = quality.value / 100;
            compressedDataUrl = canvas.toDataURL('image/jpeg', q);

            const compressedSize = Math.round((compressedDataUrl.length - 22) * 3 / 4);
            const saved = compressOriginalFile.size - compressedSize;
            const savedPercent = ((saved / compressOriginalFile.size) * 100).toFixed(1);

            document.getElementById('compressedSize').textContent = formatBytes(compressedSize);
            document.getElementById('savedSize').textContent = `${savedPercent}%`;
            document.getElementById('compressedImage').src = compressedDataUrl;
            compressPreview.classList.add('show');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(compressOriginalFile);
});

document.getElementById('downloadCompressed').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = compressedDataUrl;
    a.download = 'compressed-image.jpg';
    a.click();
});

// Image Scaler
let scaleOriginalFile = null;
let scaledDataUrl = null;
let originalWidth = 0;
let originalHeight = 0;

const scaleUpload = document.getElementById('scaleUpload');
const scaleFile = document.getElementById('scaleFile');
const scaleBtn = document.getElementById('scaleBtn');
const scalePreview = document.getElementById('scalePreview');
const scaleModeRadios = document.querySelectorAll('input[name="scaleMode"]');
const percentageInputs = document.getElementById('percentageInputs');
const pixelInputs = document.getElementById('pixelInputs');
const maintainAspect = document.getElementById('maintainAspect');
const scaleWidth = document.getElementById('scaleWidth');
const scaleHeight = document.getElementById('scaleHeight');

scaleModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'percentage') {
            percentageInputs.style.display = 'block';
            pixelInputs.style.display = 'none';
        } else {
            percentageInputs.style.display = 'none';
            pixelInputs.style.display = 'block';
        }
    });
});

scaleWidth.addEventListener('input', () => {
    if (maintainAspect.checked && originalWidth > 0) {
        const ratio = originalHeight / originalWidth;
        scaleHeight.value = Math.round(scaleWidth.value * ratio);
    }
});

scaleHeight.addEventListener('input', () => {
    if (maintainAspect.checked && originalHeight > 0) {
        const ratio = originalWidth / originalHeight;
        scaleWidth.value = Math.round(scaleHeight.value * ratio);
    }
});

scaleUpload.addEventListener('click', () => scaleFile.click());
scaleUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    scaleUpload.classList.add('dragover');
});
scaleUpload.addEventListener('dragleave', () => {
    scaleUpload.classList.remove('dragover');
});
scaleUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    scaleUpload.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        scaleFile.files = e.dataTransfer.files;
        handleScaleFile(e.dataTransfer.files[0]);
    }
});

scaleFile.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleScaleFile(e.target.files[0]);
    }
});

function handleScaleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    scaleOriginalFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalWidth = img.width;
            originalHeight = img.height;
            scaleWidth.value = img.width;
            scaleHeight.value = img.height;
            scaleBtn.disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

scaleBtn.addEventListener('click', () => {
    if (!scaleOriginalFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            let newWidth, newHeight;
            const mode = document.querySelector('input[name="scaleMode"]:checked').value;

            if (mode === 'percentage') {
                const percent = document.getElementById('scalePercent').value / 100;
                newWidth = Math.round(img.width * percent);
                newHeight = Math.round(img.height * percent);
            } else {
                newWidth = parseInt(scaleWidth.value);
                newHeight = parseInt(scaleHeight.value);
            }

            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            scaledDataUrl = canvas.toDataURL('image/png');
            document.getElementById('scaledImage').src = scaledDataUrl;
            document.getElementById('scaleDimensions').textContent = 
                `Original: ${img.width}×${img.height} → Scaled: ${newWidth}×${newHeight}`;
            scalePreview.classList.add('show');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(scaleOriginalFile);
});

document.getElementById('downloadScaled').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = scaledDataUrl;
    a.download = 'scaled-image.png';
    a.click();
});

// QR Code Generator
const qrText = document.getElementById('qrText');
const qrSize = document.getElementById('qrSize');
const qrForeground = document.getElementById('qrForeground');
const qrForegroundText = document.getElementById('qrForegroundText');
const qrBackground = document.getElementById('qrBackground');
const qrBackgroundText = document.getElementById('qrBackgroundText');
const generateQR = document.getElementById('generateQR');
const qrPreview = document.getElementById('qrPreview');
const qrCanvas = document.getElementById('qrCanvas');

qrForeground.addEventListener('input', (e) => {
    qrForegroundText.value = e.target.value;
});

qrForegroundText.addEventListener('input', (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        qrForeground.value = e.target.value;
    }
});

qrBackground.addEventListener('input', (e) => {
    qrBackgroundText.value = e.target.value;
});

qrBackgroundText.addEventListener('input', (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        qrBackground.value = e.target.value;
    }
});

function generateQRCode(text, size, fgColor, bgColor) {
    const qr = {
        typeNumber: 0,
        errorCorrectLevel: 'M',
        make: function() {
            const length = text.length;
            if (length <= 20) this.typeNumber = 1;
            else if (length <= 38) this.typeNumber = 2;
            else if (length <= 61) this.typeNumber = 3;
            else if (length <= 90) this.typeNumber = 4;
            else if (length <= 122) this.typeNumber = 5;
            else if (length <= 154) this.typeNumber = 6;
            else this.typeNumber = 7;
        }
    };

    qr.make();
    const moduleCount = (qr.typeNumber * 4) + 17;
    const cellSize = size / moduleCount;

    qrCanvas.width = size;
    qrCanvas.height = size;
    const ctx = qrCanvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    const data = generateQRData(text, qr.typeNumber);
    
    ctx.fillStyle = fgColor;
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (data[row] && data[row][col]) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
}

function generateQRData(text, typeNum) {
    const size = (typeNum * 4) + 17;
    const matrix = Array(size).fill(0).map(() => Array(size).fill(false));

    addFinderPatterns(matrix, size);
    addTimingPatterns(matrix, size);
    addDataPattern(matrix, size, text);

    return matrix;
}

function addFinderPatterns(matrix, size) {
    const positions = [[0, 0], [size - 7, 0], [0, size - 7]];
    
    positions.forEach(([startRow, startCol]) => {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                const r = startRow + i;
                const c = startCol + j;
                if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
                    matrix[r][c] = true;
                }
            }
        }
    });
}

function addTimingPatterns(matrix, size) {
    for (let i = 8; i < size - 8; i++) {
        matrix[6][i] = i % 2 === 0;
        matrix[i][6] = i % 2 === 0;
    }
}

function addDataPattern(matrix, size, text) {
    let charCode;
    for (let i = 0; i < text.length && i < 100; i++) {
        charCode = text.charCodeAt(i);
        const bits = charCode.toString(2).padStart(8, '0');
        
        let row = 8 + (i * 2) % (size - 16);
        let col = 8 + Math.floor(i / ((size - 16) / 2));
        
        for (let b = 0; b < 8; b++) {
            if (row < size && col < size && !matrix[row][col]) {
                matrix[row][col] = bits[b] === '1';
                row++;
                if (row >= size - 8) {
                    row = 8;
                    col++;
                }
            }
        }
    }
}

generateQR.addEventListener('click', () => {
    const text = qrText.value.trim();
    if (!text) {
        alert('Please enter text or URL');
        return;
    }

    const size = parseInt(qrSize.value);
    const fg = qrForeground.value;
    const bg = qrBackground.value;

    generateQRCode(text, size, fg, bg);
    qrPreview.classList.add('show');
});

document.getElementById('downloadQR').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = qrCanvas.toDataURL('image/png');
    a.download = 'qr-code.png';
    a.click();
});
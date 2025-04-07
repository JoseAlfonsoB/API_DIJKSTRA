// Almacenamiento de aristas y nodos
let aristas = [];

// Función para agregar nuevas aristas dinámicamente al formulario
function agregarArista() {
    const aristaGroup = document.createElement('div');
    aristaGroup.classList.add('arista-group');
    
    aristaGroup.innerHTML = `
        <input type="text" name="from[]" placeholder="Desde" required>
        <input type="text" name="to[]" placeholder="Hacia" required>
        <input type="number" name="weight[]" placeholder="Peso" required>
    `;
    
    document.getElementById('aristas-container').appendChild(aristaGroup);
}

// Calcular el algoritmo de Dijkstra
function calcularDijkstra(nodos, aristas, inicio, fin) {
    const distancias = {};
    const previos = {};
    const unvisitedNodes = new Set(nodos);
    
    nodos.forEach(nodo => {
        distancias[nodo] = Infinity;
        previos[nodo] = null;
    });
    distancias[inicio] = 0;

    while (unvisitedNodes.size > 0) {
        const nodoActual = [...unvisitedNodes].reduce((prev, curr) => distancias[prev] < distancias[curr] ? prev : curr);
        unvisitedNodes.delete(nodoActual);

        if (nodoActual === fin) break;

        aristas.filter(arista => arista.from === nodoActual).forEach(arista => {
            const nuevaDistancia = distancias[nodoActual] + arista.weight;
            if (nuevaDistancia < distancias[arista.to]) {
                distancias[arista.to] = nuevaDistancia;
                previos[arista.to] = nodoActual;
            }
        });
    }

    let camino = [];
    for (let nodo = fin; nodo; nodo = previos[nodo]) {
        camino.unshift(nodo);
    }

    return { distancia: distancias[fin], camino };
}

// Función para dibujar el grafo en el canvas
function drawGraph(nodos, aristas, camino, distancia) {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodeCoords = generateNodePositions(nodos);

    // Primero dibujamos las aristas, detrás de los nodos
    aristas.forEach(arista => {
        const from = nodeCoords[arista.from];
        const to = nodeCoords[arista.to];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Mostrar el peso al costado de la arista
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillStyle = '#aaa';
        ctx.fillText(arista.weight, midX + 10, midY + 10);  // Se desplaza un poco para mostrarlo al costado
    });


    // Resaltar el camino más corto
    if (camino.length > 1) {
        for (let i = 0; i < camino.length - 1; i++) {
            const from = nodeCoords[camino[i]];
            const to = nodeCoords[camino[i + 1]];
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    }

    // Luego dibujamos los nodos encima de las aristas
    nodos.forEach(node => {
        ctx.beginPath();
        ctx.arc(nodeCoords[node].x, nodeCoords[node].y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.fillText(node, nodeCoords[node].x - 5, nodeCoords[node].y + 5);
    });

    // Mostrar la solución con el peso total
    const solucionText = `Camino más corto: ${camino.join(' -> ')}\nDistancia total: ${distancia}`;
    alert(solucionText);
    document.getElementById('solucion').innerText = solucionText;  // Mostrar en un área de texto adicional
}

// Generar posiciones de los nodos de manera dinámica
function generateNodePositions(nodos) {
    const positions = {};
    const angleIncrement = (2 * Math.PI) / nodos.length;
    const radius = 200;

    nodos.forEach((nodo, index) => {
        const angle = angleIncrement * index;
        positions[nodo] = {
            x: 300 + radius * Math.cos(angle),
            y: 300 + radius * Math.sin(angle)
        };
    });

    return positions;
}

// Manejo del formulario para ejecutar el algoritmo de Dijkstra y visualizar el grafo
document.getElementById('dijkstraForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nodos = document.getElementById('nodos').value.split(',').map(nodo => nodo.trim());
    const inicio = document.getElementById('inicio').value;
    const fin = document.getElementById('fin').value;

    aristas = [];
    const fromInputs = document.getElementsByName('from[]');
    const toInputs = document.getElementsByName('to[]');
    const weightInputs = document.getElementsByName('weight[]');

    for (let i = 0; i < fromInputs.length; i++) {
        aristas.push({
            from: fromInputs[i].value,
            to: toInputs[i].value,
            weight: Number(weightInputs[i].value)
        });
    }

    const resultado = calcularDijkstra(nodos, aristas, inicio, fin);

    if (resultado.distancia === Infinity) {
        alert('No hay camino entre los nodos indicados.');
        return;
    }

    drawGraph(nodos, aristas, resultado.camino, resultado.distancia);
});

// === 正式 D20 骰點演出：只負責視覺呈現，不參與機率、DC、加值或硬判定。 ===
(() => {
    const overlay = document.getElementById('dice-result-overlay');
    const card = document.getElementById('dice-result-card');
    const gameContainer = document.getElementById('game-container');
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const PIXEL_GRID = 1.25;
    const ROLL_DURATION_MS = 1960;
    const CONTACT_DELAY_MS = 354;
    const HIDE_AFTER_ROLL_MS = 1900;
    const REDUCED_MOTION_HOLD_MS = 1000;
    const ICOSAHEDRON_RATIO = (1 + Math.sqrt(5)) / 2;
    const RAW_VERTICES = [
        [-1, ICOSAHEDRON_RATIO, 0],
        [1, ICOSAHEDRON_RATIO, 0],
        [-1, -ICOSAHEDRON_RATIO, 0],
        [1, -ICOSAHEDRON_RATIO, 0],
        [0, -1, ICOSAHEDRON_RATIO],
        [0, 1, ICOSAHEDRON_RATIO],
        [0, -1, -ICOSAHEDRON_RATIO],
        [0, 1, -ICOSAHEDRON_RATIO],
        [ICOSAHEDRON_RATIO, 0, -1],
        [ICOSAHEDRON_RATIO, 0, 1],
        [-ICOSAHEDRON_RATIO, 0, -1],
        [-ICOSAHEDRON_RATIO, 0, 1]
    ];
    const FACES = [
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1]
    ];

    if (!overlay || !card || !gameContainer) {
        window.playDiceResultPresentation = () => Promise.resolve('skipped');
        window.cancelDiceResultPresentation = () => {};
        return;
    }

    const svg = card.querySelector('.die-svg');
    const faceGroup = svg.querySelector('.die-faces');
    const fxGroup = svg.querySelector('.die-fx-faces');
    const edgeGroup = svg.querySelector('.die-edges');
    const outline = svg.querySelector('.die-outline');
    const rollValue = svg.querySelector('.roll-value');
    const riseParticles = svg.querySelector('.rise-particles');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeRun = null;

    function normalizeVertex(vertex) {
        const length = Math.hypot(vertex[0], vertex[1], vertex[2]);
        return vertex.map(value => value / length);
    }

    function rotateVectorAroundAxis(vector, axis, angle) {
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const complement = 1 - cosine;
        const dot = vector[0] * axis[0] + vector[1] * axis[1] + vector[2] * axis[2];
        return [
            vector[0] * cosine
                + (axis[1] * vector[2] - axis[2] * vector[1]) * sine
                + axis[0] * dot * complement,
            vector[1] * cosine
                + (axis[2] * vector[0] - axis[0] * vector[2]) * sine
                + axis[1] * dot * complement,
            vector[2] * cosine
                + (axis[0] * vector[1] - axis[1] * vector[0]) * sine
                + axis[2] * dot * complement
        ];
    }

    function alignFrontFace(vertices, face) {
        const [a, b, c] = face.map(index => vertices[index]);
        const edgeAB = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const edgeAC = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        let normal = [
            edgeAB[1] * edgeAC[2] - edgeAB[2] * edgeAC[1],
            edgeAB[2] * edgeAC[0] - edgeAB[0] * edgeAC[2],
            edgeAB[0] * edgeAC[1] - edgeAB[1] * edgeAC[0]
        ];
        const center = [
            (a[0] + b[0] + c[0]) / 3,
            (a[1] + b[1] + c[1]) / 3,
            (a[2] + b[2] + c[2]) / 3
        ];
        if (normal[0] * center[0] + normal[1] * center[1] + normal[2] * center[2] < 0) {
            normal = normal.map(value => -value);
        }
        const normalLength = Math.hypot(normal[0], normal[1], normal[2]);
        normal = normal.map(value => value / normalLength);
        const rawAxis = [normal[1], -normal[0], 0];
        const axisLength = Math.hypot(rawAxis[0], rawAxis[1]);
        const axis = axisLength > 0.0001
            ? rawAxis.map(value => value / axisLength)
            : [1, 0, 0];
        const tiltAngle = Math.acos(Math.max(-1, Math.min(1, normal[2])));
        const tiltedVertices = vertices.map(vertex => rotateVectorAroundAxis(vertex, axis, tiltAngle));
        const faceVertices = face.map(index => tiltedVertices[index]);
        const tiltedCenter = {
            x: faceVertices.reduce((sum, vertex) => sum + vertex[0], 0) / 3,
            y: faceVertices.reduce((sum, vertex) => sum + vertex[1], 0) / 3
        };
        const anchor = faceVertices[0];
        const anchorAngle = Math.atan2(
            anchor[1] - tiltedCenter.y,
            anchor[0] - tiltedCenter.x
        );
        const zAngle = -Math.PI / 2 - anchorAngle;
        const cosine = Math.cos(zAngle);
        const sine = Math.sin(zAngle);
        return tiltedVertices.map(vertex => [
            vertex[0] * cosine - vertex[1] * sine,
            vertex[0] * sine + vertex[1] * cosine,
            vertex[2]
        ]);
    }

    const NORMALIZED_VERTICES = RAW_VERTICES.map(normalizeVertex);
    const ALIGNED_VERTICES = alignFrontFace(NORMALIZED_VERTICES, FACES[0]);
    const edgeMap = new Map();
    FACES.forEach((face, faceIndex) => {
        face.forEach((vertexIndex, index) => {
            const nextVertexIndex = face[(index + 1) % face.length];
            const vertices = [vertexIndex, nextVertexIndex].sort((left, right) => left - right);
            const key = vertices.join('-');
            if (!edgeMap.has(key)) {
                edgeMap.set(key, { vertices, faces: [] });
            }
            edgeMap.get(key).faces.push(faceIndex);
        });
    });
    const EDGES = Array.from(edgeMap.values());

    function rotateVertex(vertex, rotation) {
        const [sourceX, sourceY, sourceZ] = vertex;
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const yAfterX = sourceY * cosX - sourceZ * sinX;
        const zAfterX = sourceY * sinX + sourceZ * cosX;
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);
        const xAfterY = sourceX * cosY + zAfterX * sinY;
        const zAfterY = -sourceX * sinY + zAfterX * cosY;
        const cosZ = Math.cos(rotation.z);
        const sinZ = Math.sin(rotation.z);
        return {
            x: xAfterY * cosZ - yAfterX * sinZ,
            y: xAfterY * sinZ + yAfterX * cosZ,
            z: zAfterY
        };
    }

    function getProjectedHull(points) {
        const sorted = points
            .map(point => ({ x: point.x, y: point.y }))
            .sort((left, right) => left.x - right.x || left.y - right.y);
        const cross = (origin, first, second) => (
            (first.x - origin.x) * (second.y - origin.y)
            - (first.y - origin.y) * (second.x - origin.x)
        );
        const lower = [];
        sorted.forEach(point => {
            while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), point) <= 0) {
                lower.pop();
            }
            lower.push(point);
        });
        const upper = [];
        sorted.slice().reverse().forEach(point => {
            while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), point) <= 0) {
                upper.pop();
            }
            upper.push(point);
        });
        lower.pop();
        upper.pop();
        return lower.concat(upper);
    }

    function snapCoordinate(value, grid = PIXEL_GRID) {
        return Math.sign(value) * Math.round(Math.abs(value) / grid) * grid;
    }

    function getPixelPath(points, closePath = false, grid = PIXEL_GRID) {
        const snapped = points.map(point => ({
            x: snapCoordinate(point.x, grid) / grid,
            y: snapCoordinate(point.y, grid) / grid
        }));
        if (!snapped.length) return '';
        const path = [`M ${snapped[0].x * grid} ${snapped[0].y * grid}`];
        const edgeCount = closePath ? snapped.length : snapped.length - 1;
        for (let index = 0; index < edgeCount; index += 1) {
            let currentX = snapped[index].x;
            let currentY = snapped[index].y;
            const target = snapped[(index + 1) % snapped.length];
            const deltaX = Math.abs(target.x - currentX);
            const deltaY = -Math.abs(target.y - currentY);
            const stepX = currentX < target.x ? 1 : -1;
            const stepY = currentY < target.y ? 1 : -1;
            let error = deltaX + deltaY;
            while (currentX !== target.x || currentY !== target.y) {
                const doubledError = error * 2;
                if (doubledError >= deltaY && currentX !== target.x) {
                    error += deltaY;
                    currentX += stepX;
                    path.push(`H ${currentX * grid}`);
                }
                if (doubledError <= deltaX && currentY !== target.y) {
                    error += deltaX;
                    currentY += stepY;
                    path.push(`V ${currentY * grid}`);
                }
            }
        }
        if (closePath) path.push('Z');
        return path.join(' ');
    }

    function getTriangleMetrics(points) {
        const [a, b, c] = points;
        const area = Math.abs(
            a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)
        ) / 2;
        const perimeter = Math.hypot(a.x - b.x, a.y - b.y)
            + Math.hypot(b.x - c.x, b.y - c.y)
            + Math.hypot(c.x - a.x, c.y - a.y);
        return {
            center: {
                x: (a.x + b.x + c.x) / 3,
                y: (a.y + b.y + c.y) / 3
            },
            inradius: perimeter > 0 ? area / (perimeter / 2) : 0
        };
    }

    function appendParticle(group, x, y, width, height) {
        const particle = document.createElementNS(SVG_NS, 'rect');
        particle.setAttribute('x', String(x));
        particle.setAttribute('y', String(y));
        particle.setAttribute('width', String(width));
        particle.setAttribute('height', String(height));
        group.appendChild(particle);
    }

    [
        [-48, 53],
        [-28, 64],
        [-7, 57],
        [16, 66],
        [38, 54],
        [-36, 74],
        [5, 76],
        [45, 70]
    ].forEach(([x, y], index) => {
        appendParticle(riseParticles, x, y, index % 2 ? 4 : 6, index % 2 ? 7 : 5);
    });

    const facePolygons = FACES.map(() => {
        const polygon = document.createElementNS(SVG_NS, 'polygon');
        polygon.classList.add('die-face');
        faceGroup.appendChild(polygon);
        return polygon;
    });
    const fxPolygons = FACES.map(() => {
        const polygon = document.createElementNS(SVG_NS, 'polygon');
        polygon.classList.add('fx-face');
        fxGroup.appendChild(polygon);
        return polygon;
    });
    const edgePaths = EDGES.map(() => {
        const path = document.createElementNS(SVG_NS, 'path');
        path.classList.add('die-edge');
        edgeGroup.appendChild(path);
        return path;
    });

    function renderDie(progress, roll) {
        const eased = 1 - Math.pow(1 - progress, 3.2);
        const decay = Math.pow(1 - progress, 1.35);
        const rotation = {
            x: -0.9 + (Math.PI * 6 + 0.9) * eased
                + Math.sin(progress * 18) * 0.18 * decay,
            y: -0.45 + (Math.PI * 8 + 0.45) * eased
                + Math.sin(progress * 15 + 1.2) * 0.16 * decay,
            z: -0.25 + (Math.PI * 4 + 0.25) * eased
                + Math.sin(progress * 21 + 0.4) * 0.12 * decay
        };
        const rotated = ALIGNED_VERTICES.map(vertex => rotateVertex(vertex, rotation));
        const offsetX = Math.sin(progress * 18) * 8 * decay;
        const offsetY = Math.cos(progress * 15 + 0.7) * 6 * decay;
        const projected = rotated.map(vertex => ({
            x: vertex.x * 69 + offsetX,
            y: vertex.y * 65 + offsetY
        }));
        const projectedHull = getProjectedHull(projected);
        outline.setAttribute('d', getPixelPath(projectedHull, true));

        const visibleFaces = [];
        let resultFace = null;
        FACES.forEach((face, faceIndex) => {
            const [a, b, c] = face.map(index => rotated[index]);
            let normalX = (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y);
            let normalY = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
            let normalZ = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
            const centerX = (a.x + b.x + c.x) / 3;
            const centerY = (a.y + b.y + c.y) / 3;
            const centerZ = (a.z + b.z + c.z) / 3;
            if (normalX * centerX + normalY * centerY + normalZ * centerZ < 0) {
                normalX *= -1;
                normalY *= -1;
                normalZ *= -1;
            }
            const polygon = facePolygons[faceIndex];
            const fxPolygon = fxPolygons[faceIndex];
            if (normalZ <= 0.015) {
                polygon.style.display = 'none';
                fxPolygon.style.display = 'none';
                return;
            }
            const normalLength = Math.hypot(normalX, normalY, normalZ);
            const light = Math.max(0, Math.min(1, normalZ / normalLength));
            const points = face.map(index => projected[index]).map(point => ({
                x: snapCoordinate(point.x),
                y: snapCoordinate(point.y)
            }));
            const metrics = getTriangleMetrics(points);
            const pointString = points.map(point => `${point.x},${point.y}`).join(' ');
            polygon.style.display = '';
            polygon.dataset.tone = String(Math.round(light * 3));
            polygon.setAttribute('points', pointString);
            fxPolygon.style.display = '';
            fxPolygon.setAttribute('points', pointString);
            const facetPosition = Math.max(
                0,
                Math.min(1, (metrics.center.x - metrics.center.y + 110) / 220)
            );
            const wipePosition = Math.max(0, Math.min(1, (metrics.center.y + 70) / 140));
            fxPolygon.style.setProperty('--dice-facet-delay', `${Math.round(facetPosition * 180)}ms`);
            fxPolygon.style.setProperty('--dice-wipe-delay', `${Math.round(wipePosition * 150)}ms`);
            const visibleFace = {
                faceIndex,
                depth: centerZ,
                center: metrics.center,
                inradius: metrics.inradius
            };
            visibleFaces.push(visibleFace);
            if (faceIndex === 0) resultFace = visibleFace;
        });

        const visibleIndexes = new Set(visibleFaces.map(face => face.faceIndex));
        EDGES.forEach((edge, edgeIndex) => {
            const path = edgePaths[edgeIndex];
            if (!edge.faces.some(faceIndex => visibleIndexes.has(faceIndex))) {
                path.style.display = 'none';
                return;
            }
            path.style.display = '';
            path.setAttribute('d', getPixelPath(
                edge.vertices.map(index => projected[index])
            ));
        });

        if (resultFace) {
            rollValue.setAttribute('x', String(snapCoordinate(resultFace.center.x)));
            rollValue.setAttribute('y', String(snapCoordinate(resultFace.center.y)));
            const maximumSize = roll === 1 ? 31 : 26;
            const sizeRatio = roll === 1 ? 1.52 : 1.3;
            rollValue.style.fontSize = `${Math.max(
                17,
                Math.min(maximumSize, resultFace.inradius * sizeRatio)
            )}px`;
        }
        visibleFaces.sort((left, right) => left.depth - right.depth);
        visibleFaces.forEach(face => {
            faceGroup.appendChild(facePolygons[face.faceIndex]);
            fxGroup.appendChild(fxPolygons[face.faceIndex]);
        });
    }

    function getPresentationOutcome(check) {
        const roll = Number(check?.roll);
        if (roll === 20) return 'critical';
        if (roll === 1) return 'fumble';
        if (check?.result === '成功') return 'success';
        if (check?.result === '失敗') return 'failure';
        return Number(check?.total) >= Number(check?.dc) ? 'success' : 'failure';
    }

    function getPresentationRoll(check) {
        const roll = Math.trunc(Number(check?.roll));
        return Number.isFinite(roll) ? Math.max(1, Math.min(20, roll)) : 1;
    }

    function syncOverlayBounds() {
        const bounds = gameContainer.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) return;
        overlay.style.setProperty('--dice-overlay-top', `${bounds.top}px`);
        overlay.style.setProperty('--dice-overlay-left', `${bounds.left}px`);
        overlay.style.setProperty('--dice-overlay-width', `${bounds.width}px`);
        overlay.style.setProperty('--dice-overlay-height', `${bounds.height}px`);
    }

    function setRunTimer(run, callback, delay) {
        const timer = window.setTimeout(() => {
            run.timers.delete(timer);
            if (activeRun === run) callback();
        }, delay);
        run.timers.add(timer);
    }

    function resolveRun(run, status) {
        if (run.resolved) return;
        run.resolved = true;
        run.resolve(status);
    }

    function clearInterfaceImpact() {
        document.body.classList.remove('dice-interface-impact');
    }

    function hideRun(run) {
        if (activeRun !== run) return;
        window.cancelAnimationFrame(run.animationFrame);
        run.timers.forEach(timer => window.clearTimeout(timer));
        run.timers.clear();
        clearInterfaceImpact();
        document.body.classList.remove('dice-presentation-active');
        card.classList.remove('is-rolling', 'is-impact', 'is-settled');
        overlay.classList.remove('is-visible');
        overlay.dataset.phase = 'hidden';
        activeRun = null;
        resolveRun(run, 'revealed');
    }

    function cancelActiveRun(status) {
        const run = activeRun;
        if (!run) {
            clearInterfaceImpact();
            document.body.classList.remove('dice-presentation-active');
            overlay.classList.remove('is-visible');
            overlay.dataset.phase = 'hidden';
            card.classList.remove('is-rolling', 'is-impact', 'is-settled');
            return;
        }
        window.cancelAnimationFrame(run.animationFrame);
        run.timers.forEach(timer => window.clearTimeout(timer));
        run.timers.clear();
        clearInterfaceImpact();
        document.body.classList.remove('dice-presentation-active');
        card.classList.remove('is-rolling', 'is-impact', 'is-settled');
        overlay.classList.remove('is-visible');
        overlay.dataset.phase = 'hidden';
        activeRun = null;
        resolveRun(run, status);
    }

    function triggerInterfaceImpact(run) {
        if (activeRun !== run || run.outcome !== 'fumble') return;
        clearInterfaceImpact();
        void document.body.offsetWidth;
        document.body.classList.add('dice-interface-impact');
        setRunTimer(run, clearInterfaceImpact, 300);
    }

    function beginImpact(run) {
        if (activeRun !== run || run.impactStarted) return;
        run.impactStarted = true;
        window.cancelAnimationFrame(run.animationFrame);
        run.animationFrame = 0;
        renderDie(1, run.roll);
        card.classList.remove('is-rolling');
        card.classList.add('is-impact', 'is-settled');
        overlay.dataset.phase = 'impact';
        setRunTimer(run, () => {
            triggerInterfaceImpact(run);
            overlay.dataset.phase = 'revealed';
            resolveRun(run, 'revealed');
        }, CONTACT_DELAY_MS);
        setRunTimer(run, () => hideRun(run), HIDE_AFTER_ROLL_MS);
    }

    function playDiceResultPresentation(check) {
        try {
            cancelActiveRun('superseded');
            syncOverlayBounds();
            const roll = getPresentationRoll(check);
            const outcome = getPresentationOutcome(check);
            rollValue.textContent = String(roll);
            card.dataset.outcome = outcome;
            card.classList.remove('is-rolling', 'is-impact', 'is-settled');
            document.body.classList.add('dice-presentation-active');
            overlay.classList.add('is-visible');
            overlay.dataset.phase = 'rolling';
            renderDie(0, roll);
            void card.offsetWidth;

            return new Promise(resolve => {
                const run = {
                    animationFrame: 0,
                    impactStarted: false,
                    outcome,
                    resolve,
                    resolved: false,
                    roll,
                    timers: new Set()
                };
                activeRun = run;
                if (reducedMotion.matches) {
                    renderDie(1, roll);
                    card.classList.add('is-settled');
                    overlay.dataset.phase = 'revealed';
                    resolveRun(run, 'revealed');
                    setRunTimer(run, () => hideRun(run), REDUCED_MOTION_HOLD_MS);
                    return;
                }

                card.classList.add('is-rolling');
                const startedAt = performance.now();
                const animate = now => {
                    if (activeRun !== run) return;
                    const progress = Math.min(1, (now - startedAt) / ROLL_DURATION_MS);
                    renderDie(progress, roll);
                    if (progress < 1) {
                        run.animationFrame = window.requestAnimationFrame(animate);
                        return;
                    }
                    run.animationFrame = 0;
                    beginImpact(run);
                };
                run.animationFrame = window.requestAnimationFrame(animate);
                setRunTimer(run, () => beginImpact(run), ROLL_DURATION_MS);
            });
        } catch (error) {
            cancelActiveRun('cancelled');
            console.warn('D20 presentation skipped:', error);
            return Promise.resolve('skipped');
        }
    }

    window.playDiceResultPresentation = playDiceResultPresentation;
    window.cancelDiceResultPresentation = () => cancelActiveRun('cancelled');
    window.addEventListener('resize', () => {
        if (activeRun) syncOverlayBounds();
    });
    ['exit-game-btn', 'game-home-tab'].forEach(id => {
        document.getElementById(id)?.addEventListener(
            'click',
            () => cancelActiveRun('cancelled'),
            { capture: true }
        );
    });
})();

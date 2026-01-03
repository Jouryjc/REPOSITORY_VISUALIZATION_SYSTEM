/**
 * Distributes N points uniformly on a sphere surface using Fibonacci Sphere algorithm.
 * @param {Array} data - The array of repository objects.
 * @param {Number} radius - The radius of the sphere.
 * @returns {Array} - Array of objects with added position {x, y, z}.
 */
export function calculateLayout(data, radius = 500) {
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    return data.map((item, i) => {
        const y = 1 - (i / (data.length - 1)) * 2; // y goes from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y); // radius at y

        const theta = phi * i; // Golden angle increment

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        return {
            ...item,
            position: {
                x: x * radius,
                y: y * radius,
                z: z * radius
            }
        };
    });
}

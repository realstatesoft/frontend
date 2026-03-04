import { useEffect, useRef, useState } from "react";

/**
 * Hook reutilizable para animar elementos al entrar en el viewport.
 * @param {object} options - Opciones del IntersectionObserver
 * @param {number} options.threshold - Porcentaje del elemento visible para activar (0-1)
 * @param {string} options.rootMargin - Margen del viewport
 * @param {boolean} options.once - Si true, la animación solo ocurre una vez
 * @returns {{ ref, isVisible }} - ref para asignar al elemento, isVisible para aplicar estilos
 */
export function useScrollReveal({ threshold = 0.15, rootMargin = "0px", once = true } = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.disconnect();
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold, rootMargin, once]);

    return { ref, isVisible };
}

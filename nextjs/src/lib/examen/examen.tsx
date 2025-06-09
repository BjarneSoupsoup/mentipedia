import { Examen } from "./types";

export const PREGUNTAS: Examen = [
    {
        enunciado: "¿Cuál es la forma política del Estado español? (en un sintagma nominal)",
        respuesta: {
            tipo: "texto",
            textosValidosEsperados: [
                "Monarquía parlamentaria",
                "Una Monarquía parlamentaria",
                "La Monarquía parlamentaria",
                "Monarquía con parlamento"
            ]
        }
    },
    {
        enunciado: "¿En qué año España pasó a formar parte de la Unión Europea?",
        respuesta: {
            tipo: "numérico",
            numeroEsperado: 1985,
            variacionAceptadaAbsoluta: 2
        }
    },
    // {
    //     enunciado: "¿En qué año España pasó a formar parte de la OTAN?",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 1982,
    //         variacionAceptadaAbsoluta: 2
    //     }
    // },
    // {
    //     enunciado: "¿Desde qué año la ciudad de Melilla forma parte del Territorio Español? (aproximadamente)",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 1497,
    //         variacionAceptadaAbsoluta: 90
    //     }
    // },
    // {
    //     enunciado: "¿En qué comunidades autónomas se habla Euskera?",
    //     respuesta: {
    //         tipo: "listaTexto",
    //         listaTextosValidosEsperados: [
    //             [
    //                 "Euskadi",
    //                 "País Vasco",
    //                 "El país vasco",
    //                 "La comunidad autónoma del país Vasco",
    //                 "El país vasco"
    //             ],
    //             [
    //                 "Navarra",
    //                 "Comunidad forral de navarra",
    //                 "Región de navarra",
    //                 "Partes de navarra",
    //                 "Algunas parte de navarra",
    //                 "Comunidad de Navarra",
    //                 "Comunidad navarra"
    //             ]
    //         ]
    //     }
    // },
    // {
    //     enunciado: "¿Cuántas repúblicas ha tenido España?",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 2,
    //         variacionAceptadaAbsoluta: 0
    //     }
    // },   
    // {
    //     enunciado: "¿Cuáles han sido los presidentes del gobierno desde 1978 en España? (escribir sólo el primer apellido, sin el nombre)",
    //     respuesta: {
    //         tipo: "listaTexto",
    //         listaTextosValidosEsperados: [
    //             [
    //                 "Suárez",
    //                 "Adolfo",
    //                 "Adolfo Suárez"
    //             ],
    //             [
    //                 "Calvo",
    //                 "Calvo Sotelo"
    //             ],
    //             [
    //                 "González",
    //                 "Felipe González"
    //             ],
    //             [
    //                 "Aznar",
    //                 "María",
    //                 "José María Aznar",
    //             ],
    //             [
    //                 "Rodríguez",
    //                 "Rodríguez Zapatero",
    //                 "Jose Luis Rodríguez Zapatero",
    //                 "Zapatero"
    //             ],
    //             [
    //                 "Rajoy",
    //                 "Mariano",
    //                 "Mariano Rajoy",
    //                 "Brey"
    //             ],
    //             [
    //                 "Pedro Sánchez",
    //                 "Sánchez",
    //                 "Pedro Sánchez Pérez-Castejón",
    //                 "Pérez-Castejón"
    //             ]
    //         ]
    //     }
    // },
    // {
    //     enunciado: "¿Hasta qué año fue la isla de Cuba española?",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 1898,
    //         variacionAceptadaAbsoluta: 4
    //     }
    // },
    // {
    //     enunciado: "¿En qué año se firmó la primera constitución española?",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 1812,
    //         variacionAceptadaAbsoluta: 10
    //     }
    // },
    // {
    //     enunciado: "¿En qué año descubrió América Cristóbal Colón?",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 1492,
    //         variacionAceptadaAbsoluta: 10
    //     }
    // },
    // {
    //     enunciado: "¿En qué año se expulsaron a los judíos de España? (aproximadamente)",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 1492,
    //         variacionAceptadaAbsoluta: 50
    //     }
    // },
    // {
    //     enunciado: "¿Durante cuántos años ha estado bajo dominio musulmán la ciudad de Granada? (aproximadamente)",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 781,
    //         variacionAceptadaAbsoluta: 120
    //     }
    // },
    // {
    //     enunciado: "¿En qué siglo escribió Miguel de Cervantes El Quijote? (escribir en número romanos)",
    //     respuesta: {
    //         tipo: "texto",
    //         textosValidosEsperados: [
    //             "XVII", "17", "siglo XVII"
    //         ]
    //     }
    // },
    // {
    //     enunciado: "¿Cuál es la población de España? (En 2024, aproximadamente)",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 48797875,
    //         variacionAceptadaAbsoluta: 5000000
    //     }
    // },
    // {
    //     enunciado: "¿Qué porcentaje (en tanto por cien) de la población española es extranjera? (En 2024, oficialmente, aproximadamente)",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 13.4,
    //         variacionAceptadaAbsoluta: 4.2
    //     }
    // },
    // {
    //     enunciado: "¿Qué porcentaje (en tanto por cien) de las mujeres españolas fueron víctimas de asesinatos homicidas? (En 2018, oficialmente, aproximadamente)",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 0.0002,
    //         variacionAceptadaAbsoluta: 0.01
    //     }
    // },
    // {
    //     enunciado: "¿Cuál es el salario mensual mediano neto, en 12 pagas, después de impuestos y cotizaciones sociales? (En 2024, aproximadamente)",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 0.0002,
    //         variacionAceptadaAbsoluta: 0.01
    //     }
    // },
    // {
    //     enunciado: "Cuál es el márgen de beneficio neto medio (descontando costes operativos, salarios, impuestos y amortizaciones) de las empresas españolas? Expresar en porcentaje (tanto por cien). Se admite amplio grado de variabilidad, sólo se pide una figura orientativa",
    //     respuesta: {
    //         tipo: "numérico",
    //         numeroEsperado: 9,
    //         variacionAceptadaAbsoluta: 6
    //     }
    // }
]
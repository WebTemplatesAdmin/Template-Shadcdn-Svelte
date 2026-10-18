// src/lib/utils/ventas.ts
// Agregaciones del módulo Ventas. Trabajan sobre los pedidos que ya existen:
// no hay datos propios, solo se resume el mismo dominio.
import type {
    CanalPedido,
    EstadoPedido,
    ItemPedido,
    MetodoPago,
    Pedido,
} from "$lib/types/pedido";
import {
    ETIQUETA_CANAL,
    ETIQUETA_ESTADO,
    etiquetaMetodo,
    TASA_IVA,
    totalUnidades,
} from "$lib/utils/pedido";

const DIA = 24 * 60 * 60 * 1000;

export type RangoVentas = 7 | 30 | 90;

/** Rango de fechas inclusivo en ambos extremos. */
export type RangoFechas = {
    desde: Date;
    hasta: Date;
};

export type ResumenVentas = {
    total: number;
    pedidos: number;
    ticketPromedio: number;
    unidades: number;
};

export type PuntoSerie = {
    etiqueta: string;
    total: number;
    pedidos: number;
};

export type Desglose = {
    clave: string;
    etiqueta: string;
    total: number;
    pedidos: number;
};

export type DesgloseEstado = {
    estado: EstadoPedido;
    etiqueta: string;
    pedidos: number;
};

export type ProductoVendido = {
    nombre: string;
    unidades: number;
    ingresos: number;
};

function inicioDelDia(fecha: Date): Date {
    const copia = new Date(fecha);
    copia.setHours(0, 0, 0, 0);
    return copia;
}

function finDelDia(fecha: Date): Date {
    const copia = new Date(fecha);
    copia.setHours(23, 59, 59, 999);
    return copia;
}

/** Rango del preset (7/30/90 días), contando hoy como último día. */
export function rangoDePeriodo(
    dias: RangoVentas,
    ahora = new Date(),
): RangoFechas {
    const desde = inicioDelDia(ahora);
    desde.setDate(desde.getDate() - (dias - 1));
    return { desde, hasta: finDelDia(ahora) };
}

/** Días calendario que cubre el rango (mínimo 1). */
export function diasDelRango(rango: RangoFechas): number {
    const desde = inicioDelDia(rango.desde).getTime();
    const hasta = inicioDelDia(rango.hasta).getTime();
    return Math.max(1, Math.round((hasta - desde) / DIA) + 1);
}

/** Pedidos cuya fecha cae dentro del rango. */
export function pedidosEnRango(
    pedidos: Pedido[],
    rango: RangoFechas,
): Pedido[] {
    const desde = inicioDelDia(rango.desde).getTime();
    const hasta = finDelDia(rango.hasta).getTime();

    return pedidos.filter((pedido) => {
        const fecha = new Date(pedido.fecha).getTime();
        return fecha >= desde && fecha <= hasta;
    });
}

/** Solo los pedidos no cancelados cuentan como venta. */
function esVenta(pedido: Pedido): boolean {
    return pedido.estado !== "cancelado";
}

export function resumenVentas(pedidos: Pedido[]): ResumenVentas {
    const ventas = pedidos.filter(esVenta);
    const total = ventas.reduce((suma, pedido) => suma + pedido.total, 0);
    return {
        total,
        pedidos: ventas.length,
        ticketPromedio: ventas.length ? Math.round(total / ventas.length) : 0,
        unidades: ventas.reduce((suma, pedido) => suma + totalUnidades(pedido), 0),
    };
}

/**
 * Serie para el gráfico. Diaria hasta 31 días; semanal si el rango es mayor,
 * para que las barras sigan siendo legibles.
 */
export function serieVentas(
    pedidos: Pedido[],
    rango: RangoFechas,
): PuntoSerie[] {
    const ventas = pedidos.filter(esVenta);
    const tamano = diasDelRango(rango) > 31 ? 7 : 1;
    const finRango = finDelDia(rango.hasta);
    const puntos: PuntoSerie[] = [];

    let cursor = inicioDelDia(rango.desde);

    while (cursor <= finRango) {
        const inicio = new Date(cursor);
        const fin = finDelDia(inicio);
        fin.setDate(fin.getDate() + (tamano - 1));
        const finBloque = fin > finRango ? finRango : fin;

        const delBloque = ventas.filter((pedido) => {
            const fecha = new Date(pedido.fecha).getTime();
            return fecha >= inicio.getTime() && fecha <= finBloque.getTime();
        });

        puntos.push({
            etiqueta: `${inicio.getDate()}/${inicio.getMonth() + 1}`,
            total: delBloque.reduce((suma, pedido) => suma + pedido.total, 0),
            pedidos: delBloque.length,
        });

        cursor = new Date(inicio);
        cursor.setDate(cursor.getDate() + tamano);
    }

    return puntos;
}

function agrupar(
    pedidos: Pedido[],
    clave: (pedido: Pedido) => string,
    etiqueta: (clave: string) => string,
): Desglose[] {
    const mapa = new Map<string, { total: number; pedidos: number }>();

    for (const pedido of pedidos.filter(esVenta)) {
        const id = clave(pedido);
        const actual = mapa.get(id) ?? { total: 0, pedidos: 0 };
        mapa.set(id, {
            total: actual.total + pedido.total,
            pedidos: actual.pedidos + 1,
        });
    }

    return [...mapa.entries()]
        .map(([id, valor]) => ({
            clave: id,
            etiqueta: etiqueta(id),
            ...valor,
        }))
        .sort((a, b) => b.total - a.total);
}

export function desglosePorMetodo(pedidos: Pedido[]): Desglose[] {
    return agrupar(
        pedidos,
        (pedido) => pedido.metodoPago,
        (clave) => etiquetaMetodo(clave as MetodoPago),
    );
}

export function desglosePorCanal(pedidos: Pedido[]): Desglose[] {
    return agrupar(
        pedidos,
        (pedido) => pedido.canal,
        (clave) => ETIQUETA_CANAL[clave as CanalPedido] ?? clave,
    );
}

/** Conteo de pedidos por estado (incluye cancelados). */
export function desglosePorEstado(pedidos: Pedido[]): DesgloseEstado[] {
    const mapa = new Map<EstadoPedido, number>();

    for (const pedido of pedidos) {
        mapa.set(pedido.estado, (mapa.get(pedido.estado) ?? 0) + 1);
    }

    return [...mapa.entries()]
        .map(([estado, cantidad]) => ({
            estado,
            etiqueta: ETIQUETA_ESTADO[estado],
            pedidos: cantidad,
        }))
        .sort((a, b) => b.pedidos - a.pedidos);
}

/** Productos más vendidos por unidades. Los ingresos son sin IVA. */
export function topProductos(
    pedidos: Pedido[],
    limite = 5,
): ProductoVendido[] {
    const mapa = new Map<string, ProductoVendido>();

    for (const pedido of pedidos.filter(esVenta)) {
        for (const item of pedido.items) {
            const nombre = item.varianteSku
                ? `${item.nombre} · ${item.varianteSku}`
                : item.nombre;
            const actual = mapa.get(nombre) ?? {
                nombre,
                unidades: 0,
                ingresos: 0,
            };
            mapa.set(nombre, {
                nombre,
                unidades: actual.unidades + item.cantidad,
                ingresos: actual.ingresos + item.cantidad * item.precioUnitario,
            });
        }
    }

    return [...mapa.values()]
        .sort((a, b) => b.unidades - a.unidades)
        .slice(0, limite);
}

// ============ Modo producto (una sola línea del pedido) ============

export type ProductoOpcion = {
    clave: string;
    nombre: string;
    unidades: number;
};

export type ResumenProducto = {
    unidades: number;
    /** Venta del producto sin impuesto. */
    base: number;
    /** IVA de la línea del producto. */
    impuesto: number;
    /** Venta del producto con impuesto (base + IVA). */
    conImpuesto: number;
    /** Pedidos que incluyen el producto. */
    pedidos: number;
    /** Suma del total de esos pedidos (incluye otros productos y envío). */
    totalPedidos: number;
    /** Monto del producto por pedido. */
    ticketProducto: number;
    /** Total del pedido por pedido. */
    ticketPedido: number;
};

export type ClienteProducto = {
    nombre: string;
    unidades: number;
    monto: number;
};

/** Clave estable de un producto (incluye la variante cuando aplica). */
export function claveProducto(item: ItemPedido): string {
    return item.varianteSku
        ? `${item.nombre} · ${item.varianteSku}`
        : item.nombre;
}

/** Monto de una línea con su IVA (redondeo por línea). */
function montoLinea(item: ItemPedido): number {
    const base = item.cantidad * item.precioUnitario;
    return base + Math.round(base * TASA_IVA);
}

/** Líneas del producto en pedidos no cancelados. */
function lineasDeProducto(
    pedidos: Pedido[],
    clave: string,
): { pedido: Pedido; item: ItemPedido }[] {
    const lineas: { pedido: Pedido; item: ItemPedido }[] = [];

    for (const pedido of pedidos.filter(esVenta)) {
        for (const item of pedido.items) {
            if (claveProducto(item) === clave) lineas.push({ pedido, item });
        }
    }

    return lineas;
}

/** Productos vendidos en el periodo, ordenados por unidades. */
export function productosDisponibles(pedidos: Pedido[]): ProductoOpcion[] {
    const mapa = new Map<string, ProductoOpcion>();

    for (const pedido of pedidos.filter(esVenta)) {
        for (const item of pedido.items) {
            const clave = claveProducto(item);
            const actual = mapa.get(clave) ?? { clave, nombre: clave, unidades: 0 };
            mapa.set(clave, {
                ...actual,
                unidades: actual.unidades + item.cantidad,
            });
        }
    }

    return [...mapa.values()].sort((a, b) => b.unidades - a.unidades);
}

export function resumenProducto(
    pedidos: Pedido[],
    clave: string,
): ResumenProducto {
    const lineas = lineasDeProducto(pedidos, clave);
    const base = lineas.reduce(
        (suma, { item }) => suma + item.cantidad * item.precioUnitario,
        0,
    );
    const conImpuesto = lineas.reduce(
        (suma, { item }) => suma + montoLinea(item),
        0,
    );
    const unidades = lineas.reduce((suma, { item }) => suma + item.cantidad, 0);
    const totalPedidos = lineas.reduce(
        (suma, { pedido }) => suma + pedido.total,
        0,
    );
    const pedidosCount = lineas.length;

    return {
        unidades,
        base,
        impuesto: conImpuesto - base,
        conImpuesto,
        pedidos: pedidosCount,
        totalPedidos,
        ticketProducto: pedidosCount
            ? Math.round(conImpuesto / pedidosCount)
            : 0,
        ticketPedido: pedidosCount ? Math.round(totalPedidos / pedidosCount) : 0,
    };
}

/** Serie del producto (monto con impuesto) con la misma granularidad. */
export function serieProducto(
    pedidos: Pedido[],
    rango: RangoFechas,
    clave: string,
): PuntoSerie[] {
    const lineas = lineasDeProducto(pedidos, clave);
    const tamano = diasDelRango(rango) > 31 ? 7 : 1;
    const finRango = finDelDia(rango.hasta);
    const puntos: PuntoSerie[] = [];

    let cursor = inicioDelDia(rango.desde);

    while (cursor <= finRango) {
        const inicio = new Date(cursor);
        const fin = finDelDia(inicio);
        fin.setDate(fin.getDate() + (tamano - 1));
        const finBloque = fin > finRango ? finRango : fin;

        const delBloque = lineas.filter(({ pedido }) => {
            const fecha = new Date(pedido.fecha).getTime();
            return fecha >= inicio.getTime() && fecha <= finBloque.getTime();
        });

        puntos.push({
            etiqueta: `${inicio.getDate()}/${inicio.getMonth() + 1}`,
            total: delBloque.reduce((suma, { item }) => suma + montoLinea(item), 0),
            pedidos: delBloque.length,
        });

        cursor = new Date(inicio);
        cursor.setDate(cursor.getDate() + tamano);
    }

    return puntos;
}

function agruparProducto(
    lineas: { pedido: Pedido; item: ItemPedido }[],
    claveFn: (pedido: Pedido) => string,
    etiquetaFn: (clave: string) => string,
): Desglose[] {
    const mapa = new Map<string, { total: number; pedidos: number }>();

    for (const { pedido, item } of lineas) {
        const id = claveFn(pedido);
        const actual = mapa.get(id) ?? { total: 0, pedidos: 0 };
        mapa.set(id, {
            total: actual.total + montoLinea(item),
            pedidos: actual.pedidos + 1,
        });
    }

    return [...mapa.entries()]
        .map(([id, valor]) => ({
            clave: id,
            etiqueta: etiquetaFn(id),
            ...valor,
        }))
        .sort((a, b) => b.total - a.total);
}

export function desgloseProductoPorMetodo(
    pedidos: Pedido[],
    clave: string,
): Desglose[] {
    return agruparProducto(
        lineasDeProducto(pedidos, clave),
        (pedido) => pedido.metodoPago,
        (id) => etiquetaMetodo(id as MetodoPago),
    );
}

export function desgloseProductoPorCanal(
    pedidos: Pedido[],
    clave: string,
): Desglose[] {
    return agruparProducto(
        lineasDeProducto(pedidos, clave),
        (pedido) => pedido.canal,
        (id) => ETIQUETA_CANAL[id as CanalPedido] ?? id,
    );
}

export function desgloseProductoPorEstado(
    pedidos: Pedido[],
    clave: string,
): DesgloseEstado[] {
    const mapa = new Map<EstadoPedido, number>();

    for (const { pedido } of lineasDeProducto(pedidos, clave)) {
        mapa.set(pedido.estado, (mapa.get(pedido.estado) ?? 0) + 1);
    }

    return [...mapa.entries()]
        .map(([estado, cantidad]) => ({
            estado,
            etiqueta: ETIQUETA_ESTADO[estado],
            pedidos: cantidad,
        }))
        .sort((a, b) => b.pedidos - a.pedidos);
}

/** Clientes que más compraron el producto (por unidades). */
export function clientesPorProducto(
    pedidos: Pedido[],
    clave: string,
    limite = 6,
): ClienteProducto[] {
    const mapa = new Map<string, ClienteProducto>();

    for (const { pedido, item } of lineasDeProducto(pedidos, clave)) {
        const nombre = pedido.cliente.nombre;
        const actual = mapa.get(nombre) ?? { nombre, unidades: 0, monto: 0 };
        mapa.set(nombre, {
            nombre,
            unidades: actual.unidades + item.cantidad,
            monto: actual.monto + montoLinea(item),
        });
    }

    return [...mapa.values()]
        .sort((a, b) => b.unidades - a.unidades)
        .slice(0, limite);
}

/** Porcentaje entero (0–100) de `parte` sobre `total`. */
export function porcentaje(parte: number, total: number): number {
    return total > 0 ? Math.round((parte / total) * 100) : 0;
}

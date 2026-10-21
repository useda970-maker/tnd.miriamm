namespace TiendaMiriam.Core.Enums
{
    public enum ProductCategory
    {
        INSUMO_CRUDO,      // Materia prima oculta en caja, utilizada en recetas
        PREPARADO,         // Resultado de escandallo/receta, stock virtual
        CONGELADO_LOTE,    // Producto congelado con trazabilidad de lotes y venta por peso/unidad
        ARTICULO_TIENDA,   // Mercancía directa de reventa comercial
        SERVICIO           // Servicios intangibles (recargas, fotocopias)
    }

    public enum UnitType
    {
        MASA,       // kg, g, lb, oz
        VOLUMEN,    // L, ml
        DISCRETO    // un, caja, paquete, blister, porcion
    }

    public enum UserRole
    {
        CAJERO,     // Solo ventas, arqueo, hold orders
        ADMIN       // Control total: POS + Panel Web Empresarial
    }

    public enum PaymentMethod
    {
        EFECTIVO,
        QR,
        FIADO,
        MONEDERO,
        PAGO_MIXTO
    }

    public enum TableStatus
    {
        LIBRE,
        OCUPADO,
        POR_COBRAR
    }

    public enum AuditAction
    {
        PRECIO_MODIFICADO,
        STOCK_AJUSTADO,
        RECETA_MODIFICADA,
        VENTA_COMPLETADA,
        VENTA_ANULADA,
        APERTURA_CAJA,
        CIERRE_CAJA,
        DESGLOSE_PAQUETE,
        PRODUCCION_LOTE,
        ABONO_FIADO,
        LOGIN_USUARIO
    }
}

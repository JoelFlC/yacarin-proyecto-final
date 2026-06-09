import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import { api } from '../services/api';

export const Checkout = () => {
    const navigate = useNavigate();
    
    // Extraemos lo necesario del Cerebro Global (Zustand)
    const { carrito, obtenerTotalCarrito, vaciarCarrito, esMayorista } = useStore();
    
    // Estados del Formulario y Retroalimentación
    const [direccionEnvio, setDireccionEnvio] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    
    // 💡 Guardaremos el ID del pedido; si tiene valor, significa que la compra fue un ÉXITO
    const [pedidoConfirmadoId, setPedidoConfirmadoId] = useState<string | null>(null);

    const total = obtenerTotalCarrito();
    const monedaLabel = esMayorista ? 'USD' : 'Bs.';

    const handleConfirmarPedido = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorText('');
        setIsLoading(true);

        const payload = {
        direccion_envio: direccionEnvio,
        items: carrito.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad
        }))
        };

        try {
        const response = await api.post('/pedidos', payload);
        
        // CAPTURAMOS EL ID DEL PEDIDO CREADO Y VACIAMOS EL CARRITO
        setPedidoConfirmadoId(response.data.id); 
        vaciarCarrito(); 

        } catch (error: any) {
        if (error.response?.status === 400) {
            setErrorText(error.response.data.message || 'Stock insuficiente en alguno de los ajuares elegidos.');
        } else if (error.response?.status === 401) {
            setErrorText('Tu sesión ha expirado o no has iniciado sesión comercial. Por favor, ingresa a tu cuenta.');
        } else {
            setErrorText('Hubo un problema de conexión con el servidor. Inténtalo de nuevo.');
        }
        } finally {
        setIsLoading(false);
        }
    };

    const handleDescargarComprobante = async () => {
        if (!pedidoConfirmadoId) return;
        try {
        // Petición GET con responseType: 'blob' estricto para el PDF
        const response = await api.get(`/pedidos/${pedidoConfirmadoId}/comprobante`, {
            responseType: 'blob' 
        });
        
        // Magia de JavaScript para forzar la descarga del archivo PDF
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Comprobante_Yacarin_${pedidoConfirmadoId.substring(0,6)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        } catch (error) {
        console.error("Error al descargar PDF:", error);
        alert("No se pudo generar el comprobante en este momento.");
        }
    };

    // ==========================================
    // PANTALLA DE ÉXITO (Muestra el botón PDF)
    // ==========================================
    if (pedidoConfirmadoId) {
        return (
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] text-center animate-fade-in">
            <span className="text-6xl mb-4 inline-block">🎉</span>
            <h2 className="text-2xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] mb-2">¡Pedido Confirmado!</h2>
            <p className="text-gray-500 text-sm mb-6 font-[var(--font-cuerpo)]">Tu orden ha sido registrada. Nuestro equipo logístico preparará tu envío pronto.</p>
            
            <div className="flex flex-col gap-3">
            <Button onClick={handleDescargarComprobante} variant="intense-gold" className="w-full py-3 text-sm flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Descargar Comprobante PDF
            </Button>
            
            <Link to="/catalogo">
                <Button variant="intense-blue" className="w-full py-3 text-sm">Volver al Catálogo</Button>
            </Link>
            </div>
        </div>
        );
    }

    // ==========================================
    // PANTALLA NORMAL DE CHECKOUT
    // ==========================================
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] mb-8">
            Finalizar tu Compra
        </h1>

        {carrito.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[var(--radius-suave)] border border-[var(--color-yacar-surface)]">
            <p className="text-xl text-gray-500 mb-4">Tu carrito está vacío 🍼</p>
            <Link to="/catalogo" className="text-[var(--color-yacar-azul-vivo)] font-bold hover:underline">Ver Catálogo de Ajuares</Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* PANEL IZQUIERDO: Formulario de Envío */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[var(--radius-suave)] border border-[var(--color-yacar-surface)] shadow-sm">
                <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] mb-6 pb-2 border-b">
                Información de Despacho
                </h2>

                {errorText && (
                <div className="mb-6 p-4 bg-[var(--color-yacar-rosa)]/10 border border-[var(--color-yacar-rosa)] text-[var(--color-yacar-rosa)] rounded-md text-sm font-medium">
                    ⚠️ {errorText}
                </div>
                )}

                <form onSubmit={handleConfirmarPedido} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-[var(--color-yacar-texto)] mb-2">
                    Dirección de Entrega Estricta (La Paz / El Alto)
                    </label>
                    <textarea
                    rows={3}
                    value={direccionEnvio}
                    onChange={(e) => setDireccionEnvio(e.target.value)}
                    placeholder="Ej: Av. Principal #123, Zona 16 de Julio, El Alto"
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-yacar-surface)]/40 border border-gray-200 focus:bg-white focus:border-[var(--color-yacar-azul)] focus:ring-2 focus:ring-[var(--color-yacar-azul)]/10 outline-none transition-all text-sm resize-none"
                    required
                    />
                    <p className="text-xs text-gray-400 mt-1">Por favor detalla calles, número de casa o referencias para nuestro equipo logístico.</p>
                </div>

                <Button 
                    type="submit" 
                    className="w-full text-lg py-4 shadow-sm" 
                    variant="intense-blue" 
                    isLoading={isLoading}
                >
                    Confirmar y Registrar Pedido ({monedaLabel} {total.toFixed(2)})
                </Button>
                </form>
            </div>

            {/* PANEL DERECHO: Resumen del Pedido con CARDS */}
            <div className="lg:col-span-1 bg-[var(--color-yacar-crema)]/30 p-6 rounded-[var(--radius-suave)] border border-[var(--color-yacar-surface)] shadow-sm">
                <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] mb-6 flex items-center justify-between">
                Tu Carrito
                <span className="bg-[var(--color-yacar-azul)] text-white text-sm px-3 py-1 rounded-full">
                    {carrito.reduce((acc, item) => acc + item.cantidad, 0)} items
                </span>
                </h2>
                
                <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2 mb-6">
                {carrito.map((item) => (
                    <div key={item.producto_id} className="bg-white p-3 rounded-xl border border-[var(--color-yacar-surface)] shadow-sm flex gap-4 items-center group relative overflow-hidden">
                    
                    {/* Imagen de la Card */}
                    <div className="w-16 h-16 bg-[var(--color-yacar-surface)] rounded-lg overflow-hidden flex-shrink-0">
                        {item.imagen_url ? (
                        <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍼</div>
                        )}
                    </div>

                    {/* Info de la Card */}
                    <div className="flex-grow">
                        <h4 className="font-bold text-[var(--color-yacar-texto)] text-sm leading-tight mb-1">{item.nombre}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md">Talla: {item.talla}</span>
                        <span>Cant: <strong>{item.cantidad}</strong></span>
                        </div>
                        <span className="font-bold text-[var(--color-yacar-azul-vivo)] text-sm">
                        {monedaLabel} {(item.precio_unitario * item.cantidad).toFixed(2)}
                        </span>
                    </div>

                    {/* Botón de Eliminar */}
                    <button 
                        onClick={() => useStore.getState().eliminarDelCarrito(item.producto_id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm text-gray-400 hover:text-[var(--color-yacar-rosa)] rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar del carrito"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    </div>
                ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-[var(--color-yacar-surface)] flex justify-between items-baseline shadow-sm">
                <span className="text-sm font-bold text-gray-500">Total a pagar:</span>
                <span className="text-2xl font-bold text-[var(--color-yacar-azul-vivo)] font-[var(--font-titulos)]">
                    {monedaLabel} {total.toFixed(2)}
                </span>
                </div>
            </div>

            </div>
        )}
        </div>
    );
};
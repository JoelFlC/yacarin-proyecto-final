import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

export const Pedidos = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalPagoOpen, setIsModalPagoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any | null>(null);
  
  const [pagosDelPedido, setPagosDelPedido] = useState<any[]>([]);
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
  };

  const cargarPedidos = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/pedidos'); 
      setPedidos(res.data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      mostrarNotificacion("Error al obtener los pedidos.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const abrirModalPagos = async (pedido: any) => {
    setPedidoSeleccionado(pedido);
    setIsModalPagoOpen(true);
    try {
      const res = await api.get(`/pago/pedido/${pedido.id}`);
      setPagosDelPedido(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const aprobarPago = async (pagoId: string) => {
    if (!window.confirm("¿Estás seguro de aprobar este pago? Se enviará el comprobante por correo al cliente.")) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/pago/${pagoId}/aprobar`);
      mostrarNotificacion("Pago aprobado exitosamente y correo enviado.");
      const res = await api.get(`/pago/pedido/${pedidoSeleccionado.id}`);
      setPagosDelPedido(res.data);
      cargarPedidos();
    } catch (error) {
      mostrarNotificacion("Error al aprobar el pago.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in relative">
      
      {notificacion.visible && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-[var(--radius-suave)] shadow-lg animate-fade-in flex items-center gap-3 ${
          notificacion.tipo === 'success' ? 'bg-[var(--color-yacar-verde)] text-white' : 'bg-[var(--color-yacar-rosa)] text-white'
        }`}>
          <p className="font-bold">{notificacion.mensaje}</p>
        </div>
      )}

      {isModalPagoOpen && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-[var(--color-yacar-texto)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[var(--radius-suave)] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[var(--color-yacar-surface)] flex justify-between items-center bg-[var(--color-yacar-crema)]/30">
              <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                Pagos del Pedido #{pedidoSeleccionado.id.split('-')[0].toUpperCase()}
              </h2>
              <button onClick={() => setIsModalPagoOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors">✕</button>
            </div>
            
            <div className="p-6 overflow-auto flex-1">
              <div className="bg-[var(--color-yacar-azul)]/5 p-4 rounded-lg mb-6 border border-[var(--color-yacar-azul)]/20">
                <h3 className="font-bold text-[var(--color-yacar-texto)] mb-2">Información del Pedido</h3>
                <p className="text-sm"><strong>Cliente:</strong> {pedidoSeleccionado.cliente?.nombre} {pedidoSeleccionado.cliente?.apPat}</p>
                <p className="text-sm"><strong>Total:</strong> ${Number(pedidoSeleccionado.total_usd).toFixed(2)} USD</p>
                <p className="text-sm"><strong>Estado Actual:</strong> {pedidoSeleccionado.estado}</p>
              </div>

              <h3 className="font-bold text-[var(--color-yacar-texto)] mb-4">Historial de Pagos</h3>
              
              {pagosDelPedido.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aún no se han registrado pagos para este pedido.</p>
              ) : (
                <div className="space-y-4">
                  {pagosDelPedido.map(pago => (
                    <div key={pago.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50">
                      <div>
                        <p className="font-bold text-[var(--color-yacar-azul-vivo)]">${Number(pago.monto_pagado_usd).toFixed(2)} USD <span className="text-gray-400 text-xs">(Bs. {Number(pago.monto_pagado_bs).toFixed(2)})</span></p>
                        <p className="text-xs text-gray-600">Método: {pago.metodo_pago} | Tipo: {pago.tipo_pago}</p>
                        <p className="text-xs text-gray-400 mt-1">Fecha: {new Date(pago.fecha_pago).toLocaleString()}</p>
                        {pago.concepto && <p className="text-xs italic text-gray-500">"{pago.concepto}"</p>}
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        {pago.estado_validacion === 'PENDIENTE' ? (
                          <>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">POR VALIDAR</span>
                            <Button 
                              size="small" 
                              onClick={() => aprobarPago(pago.id)} 
                              isLoading={isSubmitting}
                              className="text-xs py-1"
                            >
                              Validar Pago
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs bg-[var(--color-yacar-verde)]/20 text-[var(--color-yacar-verde)] px-2 py-1 rounded-full font-bold">APROBADO</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
              <Button onClick={() => setIsModalPagoOpen(false)} variant="secondary">Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Pedidos y Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de órdenes de clientes, pagos y comprobantes.</p>
        </div>
      </div>

      <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">ID</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Cliente</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Fecha</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Total</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-center">Estado</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8">Cargando pedidos...</td></tr>
            ) : pedidos.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8">No hay pedidos registrados.</td></tr>
            ) : (
              pedidos.map((pedido) => (
                <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-500">
                    {pedido.id.split('-')[0].toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{pedido.cliente?.nombre} {pedido.cliente?.apPat}</p>
                    <p className="text-xs text-gray-500">{pedido.cliente?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(pedido.fecha_pedido).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[var(--color-yacar-azul-vivo)]">
                    ${Number(pedido.total_usd).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                      pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      pedido.estado === 'PAGADO' || pedido.estado === 'COMPLETADO' ? 'bg-green-100 text-green-700 border-green-200' :
                      'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="small" onClick={() => abrirModalPagos(pedido)}>Ver Pagos</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

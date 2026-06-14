import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const Dashboard = () => {
    const [chartData, setChartData] = useState<any>(null);
    const [stats, setStats] = useState({
        ordenesTaller: 12,
        clientesB2B: 8,
        stockAlerta: 3,
        ventasMes: 24
    });

    // Estado para el Tipo de Cambio
    const [tipoCambio, setTipoCambio] = useState<any>(null);
    const [editandoTC, setEditandoTC] = useState(false);
    const [nuevoTC, setNuevoTC] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch real data to populate the charts
                const [produccionRes, ordenesRes, clientesRes] = await Promise.all([
                    api.get('/registro-produccion'),
                    api.get('/orden-produccion'),
                    api.get('/clientes')
                ]);

                // Procesar Estadísticas
                const ordenesActivas = ordenesRes.data.filter((o: any) => o.estado !== 'COMPLETADA').length;
                const clientesMayoristas = clientesRes.data.filter((c: any) => c.tipo_cliente === 'MAYORISTA').length;
                
                setStats(prev => ({
                    ...prev,
                    ordenesTaller: ordenesActivas,
                    clientesB2B: clientesMayoristas
                }));

                // Procesar Datos para el Gráfico
                const registros = produccionRes.data;
                const dataPorTarea = registros.reduce((acc: any, curr: any) => {
                    const tarea = curr.tarea_realizada || 'OTRO';
                    if (!acc[tarea]) {
                        acc[tarea] = { cantidad: 0, destajo: 0 };
                    }
                    acc[tarea].cantidad += Number(curr.cantidad_producida);
                    acc[tarea].destajo += Number(curr.total_a_pagar);
                    return acc;
                }, {});

                const labels = Object.keys(dataPorTarea);
                const destajoData = labels.map(k => dataPorTarea[k].destajo);
                
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Gasto en Destajo (Bs)',
                            data: destajoData,
                            backgroundColor: 'rgba(59, 130, 246, 0.6)', // Azul Yacarín
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 1,
                            borderRadius: 6,
                        },
                    ],
                });

            } catch (error) {
                console.error("Error al cargar analíticas:", error);
            }

            try {
                const tcRes = await api.get('/tipo-cambio/USD');
                setTipoCambio(tcRes.data);
                setNuevoTC(tcRes.data.valor_bs.toString());
            } catch (error) {
                console.error("No se encontró el tipo de cambio USD");
            }
        };

        fetchDashboardData();
    }, []);

    const handleActualizarTC = async () => {
        try {
            const res = await api.post('/tipo-cambio', { moneda: 'USD', valor_bs: Number(nuevoTC) });
            setTipoCambio(res.data);
            setEditandoTC(false);
        } catch (error) {
            console.error("Error al actualizar tipo de cambio");
            alert("No se pudo actualizar el tipo de cambio");
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Dashboard General</h1>
            <p className="text-gray-500 mt-1">Resumen operativo y analíticas del taller Yacarín.</p>
        </div>

        {/* TARJETAS DE RESUMEN (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[var(--color-yacar-azul-vivo)] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Ventas del Mes</p>
                <h3 className="text-2xl font-bold text-[var(--color-yacar-texto)]">{stats.ventasMes}</h3>
            </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-yacar-dorado)]/10 text-[var(--color-yacar-dorado)] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Clientes B2B</p>
                <h3 className="text-2xl font-bold text-[var(--color-yacar-texto)]">{stats.clientesB2B}</h3>
            </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-yacar-rosa)]/10 text-[var(--color-yacar-rosa)] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Stock Alerta</p>
                <h3 className="text-2xl font-bold text-[var(--color-yacar-texto)]">{stats.stockAlerta}</h3>
            </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-yacar-verde)]/10 text-[var(--color-yacar-verde)] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Órdenes Taller</p>
                <h3 className="text-2xl font-bold text-[var(--color-yacar-texto)]">{stats.ordenesTaller}</h3>
            </div>
            </div>

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Gráfico Real con Chart.js */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm h-96 flex flex-col">
            <h3 className="text-lg font-bold text-[var(--color-yacar-texto)] mb-4 border-b pb-2">Rendimiento de Producción (Destajo)</h3>
            <div className="flex-grow flex flex-col items-center justify-center">
                {chartData ? (
                    <Bar data={chartData} options={chartOptions} />
                ) : (
                    <div className="text-gray-400 flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--color-yacar-azul)] rounded-full animate-spin"></div>
                        <p className="text-sm">Cargando analíticas...</p>
                    </div>
                )}
            </div>
            </div>

            {/* Accesos Rápidos */}
            <div className="bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm">
            <h3 className="text-lg font-bold text-[var(--color-yacar-texto)] mb-4 border-b pb-2">Accesos Rápidos</h3>
            <div className="space-y-3">
                <Link to="/admin/seguimiento" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-[var(--color-yacar-azul)] transition-colors border border-transparent hover:border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">🏭</div>
                <span className="font-bold text-sm text-gray-700">Ver Taller de Costura</span>
                </Link>
                
                <Link to="/admin/bodega" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-[var(--color-yacar-verde)] transition-colors border border-transparent hover:border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">📦</div>
                <span className="font-bold text-sm text-gray-700">Ingresar Materia Prima</span>
                </Link>

                <Link to="/admin/clientes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 text-[var(--color-yacar-dorado)] transition-colors border border-transparent hover:border-yellow-100">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">⭐</div>
                <span className="font-bold text-sm text-gray-700">Aprobar Mayoristas</span>
                </Link>
            </div>
            </div>

            {/* Gestión del Tipo de Cambio */}
            <div className="bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm mt-6">
                <h3 className="text-lg font-bold text-[var(--color-yacar-texto)] mb-4 border-b pb-2">Mercado Cambiario</h3>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                            $
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Cotización USD</p>
                            {editandoTC ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-bold">Bs.</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="w-20 px-2 py-1 text-sm border border-[var(--color-yacar-azul)] rounded outline-none"
                                        value={nuevoTC}
                                        onChange={(e) => setNuevoTC(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <p className="text-lg font-bold text-[var(--color-yacar-texto)]">
                                    Bs. {tipoCambio ? Number(tipoCambio.valor_bs).toFixed(2) : '6.96'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        {editandoTC ? (
                            <div className="flex flex-col gap-1">
                                <button onClick={handleActualizarTC} className="text-xs font-bold bg-[var(--color-yacar-azul)] text-white px-3 py-1 rounded">Guardar</button>
                                <button onClick={() => setEditandoTC(false)} className="text-[10px] text-gray-400 hover:text-gray-600">Cancelar</button>
                            </div>
                        ) : (
                            <button onClick={() => setEditandoTC(true)} className="text-sm font-bold text-[var(--color-yacar-azul-vivo)] hover:underline">
                                Ajustar
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">Este valor se utiliza para la conversión en el catálogo y carrito de compras público.</p>
            </div>
        </div>
        </div>
    );
};
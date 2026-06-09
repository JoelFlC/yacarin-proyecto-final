import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

type TarifaType = {
    tarea: 'CORTE' | 'COSTURA' | 'EMPAQUE' | 'TEJEDURIA';
    precio_bs: number;
};

    export const Tarifas = () => {
    const [tarifas, setTarifas] = useState<TarifaType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingTarea, setEditingTarea] = useState<string | null>(null);
    const [nuevoPrecio, setNuevoPrecio] = useState('');

    const cargarTarifas = async () => {
        try {
        setIsLoading(true);
        const res = await api.get('/tarifas');
        setTarifas(res.data);
        } catch (error) {
        console.error("Error cargando tarifas:", error);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => { cargarTarifas(); }, []);

    const handleActualizarTarifa = async (tarea: string) => {
        try {
        await api.patch(`/tarifas/${tarea}`, { precio_bs: Number(nuevoPrecio) });
        setEditingTarea(null);
        setNuevoPrecio('');
        cargarTarifas();
        } catch (error) {
        console.error("Error al actualizar:", error);
        alert("Error al actualizar la tarifa.");
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Gestión de Tarifas a Destajo</h1>
            <p className="text-gray-500 text-sm mt-1">Configura el costo de mano de obra en Bolivianos para cada operación del taller.</p>
        </div>

        <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
            {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando cuadro tarifario...</div>
            ) : (
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
                    <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Operación Industrial</th>
                    <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Tarifa Actual (Bs)</th>
                    <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-right">Acción</th>
                </tr>
                </thead>
                <tbody>
                {tarifas.map((t) => (
                    <tr key={t.tarea} className="border-b border-gray-100">
                    <td className="px-6 py-4 font-bold text-[var(--color-yacar-texto)] text-sm">{t.tarea}</td>
                    <td className="px-6 py-4">
                        {editingTarea === t.tarea ? (
                        <input 
                            type="number" 
                            step="0.10"
                            autoFocus
                            value={nuevoPrecio} 
                            onChange={(e) => setNuevoPrecio(e.target.value)}
                            className="w-24 px-2 py-1 border border-[var(--color-yacar-azul)] rounded outline-none"
                        />
                        ) : (
                        <span className="text-lg font-medium text-gray-700">Bs. {Number(t.precio_bs).toFixed(2)}</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        {editingTarea === t.tarea ? (
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingTarea(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                            <Button onClick={() => handleActualizarTarifa(t.tarea)} variant="intense-blue" className="py-1 px-3 text-xs">Guardar</Button>
                        </div>
                        ) : (
                        <button onClick={() => { setEditingTarea(t.tarea); setNuevoPrecio(t.precio_bs.toString()); }} className="text-sm font-bold text-[var(--color-yacar-azul-vivo)] hover:underline">
                            Modificar
                        </button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
        </div>
    );
};
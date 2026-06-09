import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Definimos la estructura de un ítem en el carrito
export interface CartItem {
    producto_id: string;
    nombre: string;
    talla: string;
    precio_unitario: number; // Guardaremos el precio final calculado (Bs o USD)
    cantidad: number;
    imagen_url?: string;
    stock_maximo: number; // Fundamental para evitar que agreguen más de lo que hay
}

// 2. Ampliamos la interfaz del Store
interface AppState {
    esMayorista: boolean;
    tipoCambioBs: number;
    setEsMayorista: (valor: boolean) => void;
    setTipoCambioBs: (valor: number) => void;
    
    //métodos del Carrito
    carrito: CartItem[];
    agregarAlCarrito: (item: CartItem) => void;
    eliminarDelCarrito: (producto_id: string) => void;
    vaciarCarrito: () => void;
    obtenerTotalCarrito: () => number;
    }

    // 3. Creamos el Store
    // ... (Tus interfaces de arriba se mantienen igual)

// 3. Creamos el Store ENVOLVIÉNDOLO en persist
export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
        esMayorista: false,
        tipoCambioBs: 6.96,
        
        setEsMayorista: (valor) => set({ esMayorista: valor }),
        setTipoCambioBs: (valor) => set({ tipoCambioBs: valor }),

        // LÓGICA DEL CARRITO DE COMPRAS
        carrito: [],

        agregarAlCarrito: (nuevoItem) => set((state) => {
            const itemExistente = state.carrito.find(item => item.producto_id === nuevoItem.producto_id);

            if (itemExistente) {
                const nuevaCantidad = Math.min(itemExistente.cantidad + nuevoItem.cantidad, itemExistente.stock_maximo);
                return {
                    carrito: state.carrito.map(item => 
                    item.producto_id === nuevoItem.producto_id 
                        ? { ...item, cantidad: nuevaCantidad }
                        : item
                    )
                };
            }
            return { carrito: [...state.carrito, nuevoItem] };
        }),

        eliminarDelCarrito: (producto_id) => set((state) => ({
            carrito: state.carrito.filter(item => item.producto_id !== producto_id)
        })),

        vaciarCarrito: () => set({ carrito: [] }),

        obtenerTotalCarrito: () => {
            const { carrito } = get();
            return carrito.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
        }
        }),
        {
        name: 'yacarin-ecommerce-storage', // Esta es la llave que lo guarda en el disco duro del navegador
        }
    )
);
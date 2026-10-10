// Estado compartido del progreso del scroll (0–1). La isla 3D lo lee en cada
// fotograma sin re-renderizar React; la interfaz se suscribe a los cambios.
type Oyente = (valor: number) => void;

const oyentes = new Set<Oyente>();

export const progreso = { valor: 0 };

export function fijarProgreso(valor: number): void {
  if (valor === progreso.valor) return;
  progreso.valor = valor;
  oyentes.forEach((oyente) => oyente(valor));
}

export function suscribir(oyente: Oyente): () => void {
  oyentes.add(oyente);
  oyente(progreso.valor);
  return () => oyentes.delete(oyente);
}

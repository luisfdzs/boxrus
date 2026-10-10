# Reduce un .hdr (Radiance RGBE) a la mitad las veces indicadas, promediando en
# lineal. Uso: python -I reducir_hdr.py entrada.hdr salida.hdr pasos
# Necesita numpy. Escribe RGBE sin RLE (el servidor lo comprime). Fase 2: aún
# sin probar en el navegador con el HDRLoader de three.
import sys
import numpy as np


def leer(ruta):
    with open(ruta, 'rb') as f:
        datos = f.read()
    fin = datos.index(b'\n\n') + 2
    linea_res_fin = datos.index(b'\n', fin)
    res = datos[fin:linea_res_fin].split()
    assert res[0] == b'-Y' and res[2] == b'+X', res
    alto, ancho = int(res[1]), int(res[3])
    p = linea_res_fin + 1
    img = np.zeros((alto, ancho, 4), np.uint8)
    for y in range(alto):
        cab = datos[p:p + 4]
        assert cab[0] == 2 and cab[1] == 2, 'solo RLE nuevo'
        p += 4
        for c in range(4):
            x = 0
            while x < ancho:
                n = datos[p]
                p += 1
                if n > 128:
                    n -= 128
                    img[y, x:x + n, c] = datos[p]
                    p += 1
                else:
                    img[y, x:x + n, c] = np.frombuffer(datos[p:p + n], np.uint8)
                    p += n
                x += n
    e = img[..., 3].astype(np.int32)
    f = np.where(e > 0, np.ldexp(1.0, e - 136), 0.0)
    return img[..., :3].astype(np.float64) * f[..., None]


def escribir(ruta, rgb):
    alto, ancho, _ = rgb.shape
    m = rgb.max(axis=2)
    mant, exp = np.frexp(m)
    escala = np.where(m > 1e-32, mant * 256.0 / np.where(m > 0, m, 1), 0)
    rgbe = np.zeros((alto, ancho, 4), np.uint8)
    rgbe[..., :3] = np.clip(rgb * escala[..., None], 0, 255).astype(np.uint8)
    rgbe[..., 3] = np.where(m > 1e-32, exp + 128, 0).astype(np.uint8)
    with open(ruta, 'wb') as f:
        f.write(b'#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n')
        f.write(f'-Y {alto} +X {ancho}\n'.encode())
        f.write(rgbe.tobytes())  # sin RLE: lo comprime el servidor (gzip/brotli)


entrada, salida, pasos = sys.argv[1], sys.argv[2], int(sys.argv[3])
img = leer(entrada)
for _ in range(pasos):
    h, w, _ = img.shape
    img = img.reshape(h // 2, 2, w // 2, 2, 3).mean(axis=(1, 3))
escribir(salida, img)
print(img.shape, float(img.max()), float(img.mean()))

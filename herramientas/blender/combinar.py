# Combina las pasadas horneadas (hornear.py) en los mapas de luz finales.
#
# Uso: blender -b --factory-startup -P herramientas/blender/combinar.py -- <carpeta>
# Lee <superficie>_{fluorescentes,dia}.exr y parametros.json (LUZ.horneado.mezcla)
# y escribe <superficie>.png: irradiancia relativa en 8 bits con curva sRGB,
# dividida por una escala común a las tres superficies (escala.json), para que
# en three baste con lightMapIntensity = escala. Un desenfoque leve quita el ruido
# de pocas muestras (la luz horneada es de baja frecuencia).
import json
import os
import sys

import bpy
import numpy as np

carpeta = sys.argv[sys.argv.index('--') + 1]
with open(os.path.join(carpeta, 'parametros.json'), encoding='utf-8') as f:
    H = json.load(f)['luz']['horneado']
mezcla = H['mezcla']
SUPERFICIES = ('suelo', 'techo', 'muros')


def leer(nombre):
    img = bpy.data.images.load(os.path.join(carpeta, nombre))
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[..., :3]
    return px


def desenfocar(img, radio=1):
    """Caja separable de (2·radio + 1) px, con bordes replicados."""
    for eje in (0, 1):
        relleno = np.pad(img, [(radio, radio) if a == eje else (0, 0) for a in range(3)], mode='edge')
        img = sum(np.take(relleno, range(i, i + img.shape[eje]), axis=eje) for i in range(2 * radio + 1)) / (2 * radio + 1)
    return img


luz = {s: desenfocar(mezcla['fluorescentes'] * leer(f'{s}_fluorescentes.exr') + mezcla['dia'] * leer(f'{s}_dia.exr')) for s in SUPERFICIES}
# Escala común: el percentil 99,5 de todas, para no quemar casi nada.
escala = float(np.percentile(np.concatenate([l.reshape(-1, 3) for l in luz.values()]), 99.5))


def a_srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(x, 1 / 2.4) - 0.055)


for s, l in luz.items():
    h, w, _ = l.shape
    rgba = np.concatenate([a_srgb(l / escala), np.ones((h, w, 1), np.float32)], axis=2)
    img = bpy.data.images.new(s, w, h)
    img.pixels[:] = rgba.ravel()
    img.filepath_raw = os.path.join(carpeta, f'{s}.png')
    img.file_format = 'PNG'
    img.save()
    print(f'[combinado] {s}.png media {float(l.mean() / escala):.3f}', flush=True)

with open(os.path.join(carpeta, 'escala.json'), 'w', encoding='utf-8') as f:
    json.dump({'escala': escala}, f)
print(f'[combinado] escala {escala:.4f}', flush=True)

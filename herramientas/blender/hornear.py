# Hornea la luz de la nave en Blender (docs/03, «Luz precalculada»).
#
# Uso (sin interfaz):
#   blender -b --factory-startup -P herramientas/blender/hornear.py -- <carpeta> [muestras]
# <carpeta> contiene nave.glb y parametros.json (los envía ?exportar=1 al receptor
# herramientas/blender/recibir.mjs). Escribe en ella, por cada superficie
# (suelo, techo, muros), dos EXR en lineal:
#   <superficie>_fluorescentes.exr  luz directa + indirecta de las regletas
#   <superficie>_dia.exr            solo indirecta del sol y del cielo de los ventanales
# (la directa del sol la pone la escena en tiempo real, con su sombra).
# Las mezcla después herramientas/blender/combinar.py.
#
# Proyección (igual que usarUvMundo en materiales.ts), en coordenadas de three:
#   suelo y techo: u = (x - xMin) / ancho, v = (z - zFondo) / profundidad
#   muros: u = s / perímetro, v = y / alturaCumbrera, con s el recorrido por el
#   perímetro: izquierdo (s = zFrente - z), fondo, derecho y frente.
# Las texturas .ktx2 no se voltean: v = 0 es la fila de arriba de la imagen, de
# ahí el 1 - v al pasar a las UV de Blender (v = 0 abajo).
import json
import math
import os
import sys

import bpy

args = sys.argv[sys.argv.index('--') + 1:]
carpeta = args[0]
muestras = int(args[1]) if len(args) > 1 else 128
with open(os.path.join(carpeta, 'parametros.json'), encoding='utf-8') as f:
    P = json.load(f)
E = P['envolvente']
H = P['luz']['horneado']

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(carpeta, 'nave.glb'))
escena = bpy.context.scene


def b(x, y, z):
    """Coordenadas de three (Y arriba) a Blender (Z arriba)."""
    return (x, -z, y)


def color_lineal(hexa):
    c = [int(hexa[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c] + [1]


# ---------- Materiales: albedo difuso de la paleta; emisivos según la pasada ----------
def material_difuso(nombre, hexa, rugosidad=0.8):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = color_lineal(hexa)
    bsdf.inputs['Roughness'].default_value = rugosidad
    return m


emisivos = {}


def material_emisivo(nombre, hexa, transparente):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    nodos = m.node_tree.nodes
    nodos.clear()
    salida = nodos.new('ShaderNodeOutputMaterial')
    emision = nodos.new('ShaderNodeEmission')
    emision.inputs['Color'].default_value = color_lineal(hexa)
    if transparente:
        # El vidrio deja pasar el sol: mezcla de emisión y transparencia.
        mezcla = nodos.new('ShaderNodeAddShader')
        transp = nodos.new('ShaderNodeBsdfTransparent')
        m.node_tree.links.new(emision.outputs[0], mezcla.inputs[0])
        m.node_tree.links.new(transp.outputs[0], mezcla.inputs[1])
        m.node_tree.links.new(mezcla.outputs[0], salida.inputs['Surface'])
    else:
        m.node_tree.links.new(emision.outputs[0], salida.inputs['Surface'])
    emisivos[nombre] = emision
    return m


ALBEDOS = H['albedos']
for o in list(escena.objects):
    if o.type != 'MESH':
        continue
    nombre = o.name.split('.')[0]
    if nombre == 'fluorescente':
        m = material_emisivo('fluorescente', '#e6f2ff', False)
    elif nombre == 'vidrio':
        m = material_emisivo('vidrio', '#fff4e2', True)
    else:
        m = material_difuso(nombre, ALBEDOS.get(nombre, ALBEDOS['otros']))
    o.data.materials.clear()
    o.data.materials.append(m)

# ---------- Sol (misma dirección que LUZ.sol), mundo negro ----------
sol_datos = bpy.data.lights.new('sol', 'SUN')
sol_datos.angle = math.radians(H['solAngulo'])
sol_datos.color = color_lineal(P['luz']['sol']['color'])[:3]
sol = bpy.data.objects.new('sol', sol_datos)
escena.collection.objects.link(sol)
d = P['luz']['sol']['direccion']
direccion = b(*d)
# La luz SUN apunta a su -Z local: orientarla hacia -direccion.
from mathutils import Vector  # noqa: E402

sol.rotation_euler = Vector(direccion).to_track_quat('Z', 'Y').to_euler()
escena.world = bpy.data.worlds.new('mundo')
escena.world.use_nodes = True
escena.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0

# ---------- Superficies destino con UV proyectadas ----------
xMin, xMax, zF, zB = E['xMin'], E['xMax'], E['zFrente'], E['zFondo']
ancho, prof, cumbrera, alero = xMax - xMin, zF - zB, E['alturaCumbrera'], E['alturaAlero']
g = E['grosorMuro'] / 2 - 0.01  # un centímetro por delante de la cara interior
perimetro = 2 * (ancho + prof)


def cubierta(x):
    return alero + (cumbrera - alero) * (1 - abs(x) / xMax)


def plano(nombre, vertices, uvs, ancho_px, alto_px):
    """Cuadriláteros (listas de 4 vértices en three) con sus UV (u, v en three)."""
    malla = bpy.data.meshes.new(nombre)
    vs, caras = [], []
    for quad in vertices:
        caras.append(tuple(range(len(vs), len(vs) + 4)))
        vs.extend(b(*p) for p in quad)
    malla.from_pydata(vs, [], caras)
    capa = malla.uv_layers.new(name='horneado')
    for i, (u, v) in enumerate(uv for quad in uvs for uv in quad):
        capa.data[i].uv = (u, 1 - v)
    obj = bpy.data.objects.new(nombre, malla)
    escena.collection.objects.link(obj)
    # No interviene en la luz de la escena: solo recibe.
    for r in ('visible_camera', 'visible_diffuse', 'visible_glossy', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(obj, r, False)
    mat = material_difuso(f'{nombre}_blanco', '#ffffff', 1.0)
    obj.data.materials.append(mat)
    img = bpy.data.images.new(nombre, ancho_px, alto_px, float_buffer=True)
    nodo = mat.node_tree.nodes.new('ShaderNodeTexImage')
    nodo.image = img
    mat.node_tree.nodes.active = nodo
    return obj, img


uv_suelo = lambda x, z: ((x - xMin) / ancho, (z - zB) / prof)  # noqa: E731
y_suelo = H['alturaSuelo']
suelo = plano(
    'suelo',
    [[(xMin, y_suelo, zF), (xMax, y_suelo, zF), (xMax, y_suelo, zB), (xMin, y_suelo, zB)]],
    [[uv_suelo(xMin, zF), uv_suelo(xMax, zF), uv_suelo(xMax, zB), uv_suelo(xMin, zB)]],
    *H['resoluciones']['suelo'],
)
# Techo: dos faldones justo por debajo de la chapa, mirando hacia abajo (orden horario visto desde arriba).
quads, uvs = [], []
for x0, x1 in ((xMin, 0.0), (0.0, xMax)):
    q = [(x0, cubierta(x0) - 0.01, zB), (x1, cubierta(x1) - 0.01, zB), (x1, cubierta(x1) - 0.01, zF), (x0, cubierta(x0) - 0.01, zF)]
    quads.append(q)
    uvs.append([uv_suelo(p[0], p[2]) for p in q])
techo = plano('techo', quads, uvs, *H['resoluciones']['techo'])

# Muros: cuatro rectángulos hasta la cumbrera, por delante de la cara interior, mirando hacia dentro.
uv_muro = lambda s, y: (s / perimetro, y / cumbrera)  # noqa: E731
xi, xd, zi_f, zi_b = xMin + g, xMax - g, zF - g, zB + g
quads = [
    # izquierdo: s = zF - z (de la entrada al fondo), normal +X
    [(xi, 0, zF), (xi, 0, zB), (xi, cumbrera, zB), (xi, cumbrera, zF)],
    # fondo: s = prof + (x - xMin), normal +Z
    [(xMin, 0, zi_b), (xMax, 0, zi_b), (xMax, cumbrera, zi_b), (xMin, cumbrera, zi_b)],
    # derecho: s = prof + ancho + (z - zB), normal -X
    [(xd, 0, zB), (xd, 0, zF), (xd, cumbrera, zF), (xd, cumbrera, zB)],
    # frente: s = 2·prof + ancho + (xMax - x), normal -Z
    [(xMax, 0, zi_f), (xMin, 0, zi_f), (xMin, cumbrera, zi_f), (xMax, cumbrera, zi_f)],
]
s0 = [0, prof, prof + ancho, 2 * prof + ancho]
largos = [prof, ancho, prof, ancho]
uvs = [[uv_muro(s0[i], 0), uv_muro(s0[i] + largos[i], 0), uv_muro(s0[i] + largos[i], cumbrera), uv_muro(s0[i], cumbrera)] for i in range(4)]
muros = plano('muros', quads, uvs, *H['resoluciones']['muros'])

# Normales hacia dentro: el orden de vértices ya lo da; se comprueba y se corrige por si acaso.
for obj, centro_hacia in ((suelo[0], (0, 0, 1)), (techo[0], (0, 0, -1))):
    for pol in obj.data.polygons:
        if Vector(pol.normal).dot(Vector(centro_hacia)) < 0:
            pol.flip()
for pol, hacia in zip(muros[0].data.polygons, [(1, 0, 0), (0, -1, 0), (-1, 0, 0), (0, 1, 0)]):
    if Vector(pol.normal).dot(Vector(hacia)) < 0:
        pol.flip()

# ---------- Cycles ----------
escena.render.engine = 'CYCLES'
escena.cycles.device = 'CPU'
escena.cycles.samples = muestras
escena.cycles.max_bounces = 4
escena.cycles.diffuse_bounces = 3
escena.cycles.glossy_bounces = 1
escena.cycles.transparent_max_bounces = 4
escena.render.bake.margin = 4
escena.render.bake.use_pass_color = False


def hornear(pasada, filtro):
    for obj, img in (suelo, techo, muros):
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.bake(type='DIFFUSE', pass_filter=filtro, use_clear=True, margin=4)
        img.filepath_raw = os.path.join(carpeta, f'{img.name}_{pasada}.exr')
        img.file_format = 'OPEN_EXR'
        img.save()
        print(f'[horneado] {img.name}_{pasada}.exr', flush=True)


# Pasada A: solo regletas (directa + indirecta).
emisivos['fluorescente'].inputs['Strength'].default_value = H['fuerzaFluorescente']
emisivos['vidrio'].inputs['Strength'].default_value = 0
sol_datos.energy = 0
hornear('fluorescentes', {'DIRECT', 'INDIRECT'})

# Pasada B: sol y cielo de los ventanales, solo la indirecta.
emisivos['fluorescente'].inputs['Strength'].default_value = 0
emisivos['vidrio'].inputs['Strength'].default_value = H['fuerzaCielo']
sol_datos.energy = H['fuerzaSol']
hornear('dia', {'INDIRECT'})

"""Build a local, textured GLB avatar from a multi-view reference sheet (offline)."""

import json
import math
import struct
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


if len(sys.argv) != 2:
    raise SystemExit("Usage: python create_multiview_avatar.py <multi-view-reference-sheet>")

source = Path(sys.argv[1]).expanduser()
target = Path(__file__).resolve().parents[1] / "public" / "mimo-human.glb"
sheet = Image.open(source).convert("RGB")
if sheet.width < 1200 or sheet.height < 800:
    raise SystemExit("Expected the supplied multi-view character sheet (at least 1200x800 pixels).")


def cutout(box, size):
    """Crop a board view and key its charcoal studio background to transparency."""
    image = sheet.crop(box).resize(size, Image.Resampling.LANCZOS).convert("RGBA")
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32) / 255
    maximum = rgb.max(axis=2)
    minimum = rgb.min(axis=2)
    saturation = (maximum - minimum) / np.maximum(maximum, .001)
    # Board background is neutral charcoal; the character has colored skin/clothes,
    # near-black hair, or bright shoes. Preserve all three while removing the studio.
    keep = (saturation > .14) | (maximum < .16) | (maximum > .43)
    alpha = Image.fromarray((keep.astype(np.uint8) * 255), "L")
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.1))
    image.putalpha(alpha)
    return image


def make_atlas(size, patches, seam_patches=()):
    atlas = Image.new("RGBA", size, (0, 0, 0, 0))
    for box, rect, patch_size in patches:
        part = cutout(box, patch_size)
        atlas.alpha_composite(part, rect)
    # UV u=0 and u=1 meet at the center of the avatar's face/front. Split one
    # image across that seam; duplicating the whole crop on each edge repeats it.
    for box, left_x, right_x, y, half_width, height in seam_patches:
        part = cutout(box, (half_width * 2, height))
        atlas.alpha_composite(part.crop((0, 0, half_width, height)), (left_x, y))
        atlas.alpha_composite(part.crop((half_width, 0, half_width * 2, height)), (right_x, y))
    import io
    output = io.BytesIO()
    atlas.save(output, format="PNG", optimize=True)
    return output.getvalue()


# Equirectangular head atlas: front crosses the UV seam, with three-quarter,
# profile, and rear crops wrapping around the actual head volume.
head_png = make_atlas((1024, 512), [
    ((1252, 246, 1383, 420), (132, 64), (230, 356)),
    ((1390, 246, 1523, 420), (662, 64), (230, 356)),
    ((1390, 453, 1524, 626), (382, 72), (260, 340)),
], [((1252, 40, 1383, 211), 882, 0, 56, 142, 382)])

# Shirt views wrap the torso UVs; front, back and both sides now retain the
# olive shirt's real seams, folds and collar from the supplied turnaround.
shirt_png = make_atlas((1024, 512), [
    ((485, 122, 621, 364), (172, 42), (178, 428)),
    ((928, 122, 1064, 364), (674, 42), (178, 428)),
    ((666, 122, 817, 364), (396, 32), (230, 448)),
], [((58, 122, 199, 364), 882, 0, 28, 142, 456)])


class GLB:
    def __init__(self):
        self.binary = bytearray()
        self.views = []
        self.accessors = []
        self.meshes = []
        self.nodes = []

    def view(self, blob, target=None):
        while len(self.binary) % 4:
            self.binary.append(0)
        offset = len(self.binary)
        self.binary.extend(blob)
        result = {"buffer": 0, "byteOffset": offset, "byteLength": len(blob)}
        if target:
            result["target"] = target
        self.views.append(result)
        return len(self.views) - 1

    def accessor(self, values, component_type, shape, target, minimum=None, maximum=None):
        array = np.asarray(values)
        dtype = np.float32 if component_type == 5126 else np.uint32
        array = np.ascontiguousarray(array, dtype=dtype)
        view = self.view(array.tobytes(), target)
        acc = {"bufferView": view, "componentType": component_type, "count": len(array), "type": shape}
        if minimum is not None:
            acc["min"] = [float(v) for v in minimum]
            acc["max"] = [float(v) for v in maximum]
        self.accessors.append(acc)
        return len(self.accessors) - 1

    def add_mesh(self, name, positions, normals, uvs, indices, material):
        p = np.asarray(positions, dtype=np.float32)
        n = np.asarray(normals, dtype=np.float32)
        uv = np.asarray(uvs, dtype=np.float32)
        idx = np.asarray(indices, dtype=np.uint32)
        pa = self.accessor(p, 5126, "VEC3", 34962, p.min(axis=0), p.max(axis=0))
        na = self.accessor(n, 5126, "VEC3", 34962)
        ua = self.accessor(uv, 5126, "VEC2", 34962)
        ia = self.accessor(idx, 5125, "SCALAR", 34963)
        self.meshes.append({"name": name, "primitives": [{
            "attributes": {"POSITION": pa, "NORMAL": na, "TEXCOORD_0": ua}, "indices": ia, "material": material
        }]})
        self.nodes.append({"name": name, "mesh": len(self.meshes) - 1})

    def sphere(self, name, center, scale, material, segments=36, rings=24):
        p, n, uv, ix = [], [], [], []
        for j in range(rings + 1):
            v = j / rings
            phi = math.pi * v
            for i in range(segments + 1):
                u = i / segments
                theta = 2 * math.pi * u
                nx, ny, nz = math.sin(phi) * math.sin(theta), math.cos(phi), math.sin(phi) * math.cos(theta)
                p.append([center[0] + scale[0] * nx, center[1] + scale[1] * ny, center[2] + scale[2] * nz])
                normal = np.array([nx / scale[0], ny / scale[1], nz / scale[2]], dtype=float)
                normal /= np.linalg.norm(normal)
                n.append(normal.tolist())
                uv.append([u, 1 - v])
        for j in range(rings):
            for i in range(segments):
                a = j * (segments + 1) + i
                b = a + segments + 1
                ix.extend([a, b, a + 1, b, b + 1, a + 1])
        self.add_mesh(name, p, n, uv, ix, material)

    def ellipsoid_front_patch(self, name, center_y, radius_x, radius_y, radius_z, material, segments=64, rows=64):
        p, n, uv, ix = [], [], [], []
        for j in range(rows + 1):
            v = j / rows
            y = center_y + (0.5 - v) * 2 * radius_y * .985
            yy = (y - center_y) / radius_y
            for i in range(segments + 1):
                u = i / segments
                x = (u - .5) * 2 * radius_x * .985
                xx = x / radius_x
                rad = max(.025, 1 - xx * xx - yy * yy)
                z = radius_z * math.sqrt(rad) + .003
                p.append([x, y, z])
                normal = np.array([x / (radius_x * radius_x), (y-center_y) / (radius_y*radius_y), z / (radius_z*radius_z)])
                normal /= np.linalg.norm(normal)
                n.append(normal.tolist())
                uv.append([u, v])
        for j in range(rows):
            for i in range(segments):
                a = j * (segments + 1) + i
                b = a + segments + 1
                ix.extend([a, a + 1, b, a + 1, b + 1, b])
        self.add_mesh(name, p, n, uv, ix, material)

    def tapered_tube(self, name, start, end, radius_start, radius_end, material, segments=18):
        start, end = np.array(start, float), np.array(end, float)
        axis = end - start
        length = np.linalg.norm(axis)
        axis /= length
        helper = np.array([0.0, 0.0, 1.0]) if abs(axis[2]) < .9 else np.array([0.0, 1.0, 0.0])
        right = np.cross(axis, helper); right /= np.linalg.norm(right)
        forward = np.cross(axis, right); forward /= np.linalg.norm(forward)
        p, n, uv, ix = [], [], [], []
        for j, (center, radius) in enumerate(((start, radius_start), (end, radius_end))):
            for i in range(segments + 1):
                angle = 2 * math.pi * i / segments
                normal = right * math.cos(angle) + forward * math.sin(angle)
                p.append((center + normal * radius).tolist()); n.append(normal.tolist())
                uv.append([i / segments, j])
        for i in range(segments):
            a, b = i, i + segments + 1
            ix.extend([a, b, a + 1, a + 1, b, b + 1])
        self.add_mesh(name, p, n, uv, ix, material)

    def torso(self, name, profile, material, segments=48):
        p, n, uv, ix = [], [], [], []
        low, high = profile[0][0], profile[-1][0]
        for j, (y, rx, rz) in enumerate(profile):
            for i in range(segments + 1):
                u = i / segments
                theta = 2 * math.pi * u
                x, z = rx * math.sin(theta), rz * math.cos(theta)
                p.append([x, y, z])
                norm = np.array([x / max(rx*rx, .001), 0.0, z / max(rz*rz, .001)])
                norm /= np.linalg.norm(norm)
                n.append(norm.tolist()); uv.append([u, 1 - (y-low)/(high-low)])
        for j in range(len(profile)-1):
            for i in range(segments):
                a = j * (segments+1) + i; b = a + segments + 1
                ix.extend([a, a+1, b, a+1, b+1, b])
        self.add_mesh(name, p, n, uv, ix, material)


g = GLB()
# Materials: skin/hair/olive shirt/trousers, plus the two local photo textures.
materials = [
    {"name": "Skin", "pbrMetallicRoughness": {"baseColorFactor": [0.48, 0.27, 0.16, 1], "metallicFactor": 0, "roughnessFactor": .72}},
    {"name": "Portrait", "pbrMetallicRoughness": {"baseColorTexture": {"index": 0}, "metallicFactor": 0, "roughnessFactor": .82}, "alphaMode": "MASK", "alphaCutoff": .25, "doubleSided": True},
    {"name": "Hair and beard", "pbrMetallicRoughness": {"baseColorFactor": [.035, .028, .025, 1], "metallicFactor": 0, "roughnessFactor": .84}},
    {"name": "Olive shirt", "pbrMetallicRoughness": {"baseColorFactor": [.20, .22, .11, 1], "metallicFactor": 0, "roughnessFactor": .9}},
    {"name": "Shirt photo", "pbrMetallicRoughness": {"baseColorTexture": {"index": 1}, "metallicFactor": 0, "roughnessFactor": .9}, "alphaMode": "MASK", "alphaCutoff": .2, "doubleSided": True},
    {"name": "Dark trousers", "pbrMetallicRoughness": {"baseColorFactor": [.16, .17, .12, 1], "metallicFactor": 0, "roughnessFactor": .9}},
    {"name": "Shoes", "pbrMetallicRoughness": {"baseColorFactor": [.09, .085, .075, 1], "metallicFactor": 0, "roughnessFactor": .76}},
    {"name": "Mouth", "pbrMetallicRoughness": {"baseColorFactor": [.24, .08, .07, 1], "metallicFactor": 0, "roughnessFactor": .8}},
    {"name": "Multi-view head photo", "pbrMetallicRoughness": {"baseColorTexture": {"index": 0}, "metallicFactor": 0, "roughnessFactor": .82}, "alphaMode": "MASK", "alphaCutoff": .12, "doubleSided": True},
    {"name": "Multi-view shirt photo", "pbrMetallicRoughness": {"baseColorTexture": {"index": 1}, "metallicFactor": 0, "roughnessFactor": .9}, "alphaMode": "MASK", "alphaCutoff": .12, "doubleSided": True},
]

# The photo atlas carries separate frontal, three-quarter, profile and rear views
# around one volumetric head mesh instead of stretching a frontal photo over it.
g.sphere("Head", [0, 2.02, 0], [.275, .365, .235], 8, 48, 32)
g.sphere("Hair", [0, 2.285, -.018], [.285, .19, .25], 2, 40, 24)
g.sphere("BeardLeft", [-.188, 1.86, .045], [.068, .19, .115], 2, 24, 16)
g.sphere("BeardRight", [.188, 1.86, .045], [.068, .19, .115], 2, 24, 16)
g.sphere("EarLeft", [-.275, 1.99, 0], [.052, .095, .065], 0, 24, 16)
g.sphere("EarRight", [.275, 1.99, 0], [.052, .095, .065], 0, 24, 16)
g.tapered_tube("Neck", [0, 1.59, 0], [0, 1.78, 0], .115, .105, 0, 24)

# Clothing silhouette with shoulder width and a close collar, then the photographed shirt pattern.
shirt_profile = [(0.78,.24,.15),(.90,.29,.17),(1.08,.34,.19),(1.30,.39,.21),(1.49,.46,.22),(1.62,.43,.20),(1.70,.30,.16),(1.72,.12,.10)]
g.torso("Torso", shirt_profile, 9)
g.tapered_tube("CollarLeft", [-.12,1.66,.13], [-.04,1.48,.19], .045, .03, 3, 12)
g.tapered_tube("CollarRight", [.12,1.66,.13], [.04,1.48,.19], .045, .03, 3, 12)

# The remaining body uses game-ready 3D geometry, with proportions based on the
# full-body turnaround. Denim and sneakers are visible at every orbit angle.
g.tapered_tube("ArmLeft", [-.43,1.53,0], [-.55,.88,0], .105, .075, 3)
g.tapered_tube("ArmRight", [.43,1.53,0], [.55,.88,0], .105, .075, 3)
g.sphere("HandLeft", [-.55,.81,.01], [.085,.105,.07], 0, 24, 16)
g.sphere("HandRight", [.55,.81,.01], [.085,.105,.07], 0, 24, 16)
for side, x in (("Left",-.16),("Right",.16)):
    g.tapered_tube("Leg"+side, [x,.88,0], [x,.16,0], .13, .105, 5)
    g.sphere("Shoe"+side, [x,.105,.045], [.14,.09,.23], 6, 24, 16)

# Subtle mouth mesh follows the photo; the room animates it while TTS plays.
g.sphere("Mouth", [0,1.94,.236], [.043,.009,.009], 7, 20, 12)

# Embed the local multi-view texture bytes directly in the GLB; source board is
# not copied or uploaded.
head_view = g.view(head_png)
shirt_view = g.view(shirt_png)
json_obj = {
    "asset": {"version": "2.0", "generator": "Mimo local multi-view avatar builder"},
    "scene": 0, "scenes": [{"nodes": list(range(len(g.nodes)))}], "nodes": g.nodes, "meshes": g.meshes,
    "materials": materials,
    "textures": [{"sampler": 0, "source": 0}, {"sampler": 0, "source": 1}],
    "images": [{"name": "Local multi-view head atlas", "bufferView": head_view, "mimeType": "image/png"}, {"name": "Local multi-view shirt atlas", "bufferView": shirt_view, "mimeType": "image/png"}],
    "samplers": [{"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}],
    "accessors": g.accessors, "bufferViews": g.views, "buffers": [{"byteLength": len(g.binary)}],
}
json_bytes = json.dumps(json_obj, separators=(",", ":")).encode("utf-8")
while len(json_bytes) % 4:
    json_bytes += b" "
while len(g.binary) % 4:
    g.binary.append(0)
total = 12 + 8 + len(json_bytes) + 8 + len(g.binary)
glb = struct.pack("<III", 0x46546C67, 2, total)
glb += struct.pack("<II", len(json_bytes), 0x4E4F534A) + json_bytes
glb += struct.pack("<II", len(g.binary), 0x004E4942) + bytes(g.binary)
target.write_bytes(glb)
print(f"Wrote local multi-view GLB: {target} ({len(glb):,} bytes)")

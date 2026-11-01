# -*- coding: utf-8 -*-
"""纯 Python 实现 QR Code 生成（无第三方二维码依赖）
规格：版本 3（29×29）、纠错级 L（单 RS 块 70/55/15）、字节模式
内置：GF(256) Reed-Solomon、功能图案、之字形数据放置、8 种掩码优选、回读校验
"""
from PIL import Image

PAYLOAD = 'https://tibetsaffron-os.longhulin.workers.dev'
OUT = 'DSH-微信握手二维码.png'

VERSION = 3
SIZE = 17 + VERSION * 4          # 29
DATA_CW = 55                     # V3-L 数据码字数
EC_CW = 15                       # V3-L 纠错码字数
ECL_FORMAT_BITS = 1              # L 级格式位 = 01

# ---------- GF(256)，本原多项式 0x11D ----------
EXP = [0] * 512
LOG = [0] * 256
_x = 1
for _i in range(255):
    EXP[_i] = _x
    LOG[_x] = _i
    _x <<= 1
    if _x & 0x100:
        _x ^= 0x11D
for _i in range(255, 512):
    EXP[_i] = EXP[_i - 255]


def gmul(a, b):
    if a == 0 or b == 0:
        return 0
    return EXP[LOG[a] + LOG[b]]


def rs_generator(degree):
    """生成多项式 Π (x + α^i)，系数低次->高次，首一"""
    poly = [1]
    for i in range(degree):
        a = EXP[i]
        new = [0] * (len(poly) + 1)
        for j, c in enumerate(poly):
            new[j] ^= gmul(c, a)
            new[j + 1] ^= c
        poly = new
    return poly


def poly_remainder(coeffs, degree):
    """对低次->高次系数多项式做模 G(x) 长除，返回余式系数（低次->高次）"""
    gen = rs_generator(degree)
    buf = list(coeffs)
    for i in range(len(buf) - 1, degree - 1, -1):
        lead = buf[i]
        if lead:
            for k in range(degree + 1):
                buf[i - degree + k] ^= gmul(gen[k], lead)
    return buf[:degree]


def rs_compute_ec(data, degree):
    """ISO 18004 约定（已与参考实现核对）：首个数据码字为最高次项系数；
    M(x)·x^degree 的零系数补在低位端；EC 码字 = 余式系数按幂次从高到低"""
    rem = poly_remainder([0] * degree + list(reversed(data)), degree)
    return list(reversed(rem))


def polyval(clh, x):
    """低次->高次系数多项式在 GF(256) 上的求值（Horner）"""
    v = 0
    for c in reversed(clh):
        v = gmul(v, x) ^ c
    return v


def _selftest():
    # 机制自检：生成多项式在其全部根 α^0..α^(d-1) 上取值为 0
    for d in (10, 15):
        g = rs_generator(d)
        for i in range(d):
            assert polyval(g, EXP[i]) == 0, f'生成多项式根校验失败 (d={d})'
    print('RS 生成多项式根值自检: PASS')


# ---------- 构造数据码字（字节模式） ----------
def build_data_codewords(payload: bytes):
    bits = []

    def put(val, n):
        for i in range(n - 1, -1, -1):
            bits.append((val >> i) & 1)

    put(0b0100, 4)                     # 字节模式指示
    put(len(payload), 8)               # 字符数（V1-V9 为 8 位）
    for b in payload:
        put(b, 8)
    capacity_bits = DATA_CW * 8
    bits += [0] * min(4, capacity_bits - len(bits))          # 终止符
    bits += [0] * ((8 - len(bits) % 8) % 8)                  # 字节对齐
    npad = (capacity_bits - len(bits)) // 8
    for i in range(npad):                                    # 交替填充 EC/11
        put(0xEC if i % 2 == 0 else 0x11, 8)
    assert len(bits) == capacity_bits
    return bits


# ---------- 矩阵与功能图案 ----------
modules = [[False] * SIZE for _ in range(SIZE)]
is_func = [[False] * SIZE for _ in range(SIZE)]


def set_module(y, x, dark):
    modules[y][x] = dark
    is_func[y][x] = True


def draw_function_patterns():
    def finder(x0, y0):
        for dy in range(-1, 8):
            for dx in range(-1, 8):
                y, x = y0 + dy, x0 + dx
                if 0 <= y < SIZE and 0 <= x < SIZE:
                    dark = (0 <= dy <= 6 and 0 <= dx <= 6 and
                            (dy in (0, 6) or dx in (0, 6) or
                             (2 <= dy <= 4 and 2 <= dx <= 4)))
                    set_module(y, x, dark)

    finder(0, 0)
    finder(SIZE - 7, 0)
    finder(0, SIZE - 7)

    for i in range(8, SIZE - 8):       # 时序图案（行/列 6）
        dark = (i % 2 == 0)
        set_module(6, i, dark)
        set_module(i, 6, dark)

    # 校正图形：V3 中心 (22, 22)
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            set_module(22 + dy, 22 + dx, max(abs(dx), abs(dy)) != 1)

    set_module(SIZE - 8, 8, True)      # 固定暗模块 (4V+9, 8)
    draw_format_bits(0)                # 先占位，掩码确定后重画


def draw_format_bits(mask_id, mat=None, fn=None):
    mat = modules if mat is None else mat
    fn = is_func if fn is None else fn

    def sm(x, y, dark):                # 与参考实现一致的 (x, y) 参数序
        mat[y][x] = dark
        fn[y][x] = True

    data = (ECL_FORMAT_BITS << 3) | mask_id
    rem = data
    for _ in range(10):
        rem = (rem << 1) ^ ((rem >> 9) * 0x537)
    bits = (data << 10 | rem) ^ 0x5412

    def get(i):
        return (bits >> i) & 1

    # 副本一：列 x=8（y=0..5,7,8）+ 行 y=8（x=7,13..9）
    for i in range(6):
        sm(8, i, get(i))
    sm(8, 7, get(6))
    sm(8, 8, get(7))
    sm(7, 8, get(8))
    for i in range(9, 15):
        sm(14 - i, 8, get(i))
    # 副本二：行 y=8（x=size-1..size-8，bit0-7）+ 列 x=8（y=size-7..size-1，bit8-14）
    for i in range(8):
        sm(SIZE - 1 - i, 8, get(i))
    for i in range(8, 15):
        sm(8, SIZE - 15 + i, get(i))
    sm(8, SIZE - 8, True)              # 暗模块恒黑 (x=8, y=size-8)


def mask_bit(m, y, x):
    if m == 0:
        return (y + x) % 2 == 0
    if m == 1:
        return y % 2 == 0
    if m == 2:
        return x % 3 == 0
    if m == 3:
        return (y + x) % 3 == 0
    if m == 4:
        return (y // 2 + x // 3) % 2 == 0
    if m == 5:
        return (y * x) % 2 + (y * x) % 3 == 0
    if m == 6:
        return ((y * x) % 2 + (y * x) % 3) % 2 == 0
    return ((y + x) % 2 + (y * x) % 3) % 2 == 0


def zigzag_cells():
    """数据放置顺序（跳过列 6），返回 [(y, x), ...]"""
    cells = []
    for right in range(SIZE - 1, 0, -2):
        if right <= 6:                 # 与参考实现一致：列 6/4/2 均左移一列
            right -= 1
        upward = ((right + 1) & 2) == 0
        for vert in range(SIZE):
            for j in range(2):
                x = right - j
                y = (SIZE - 1 - vert) if upward else vert
                cells.append((y, x))
    return cells


def apply_mask(mat, mask_id, cells):
    for y, x in cells:
        if not is_func[y][x] and mask_bit(mask_id, y, x):
            mat[y][x] ^= True


def penalty(mat):
    n1, n2, n3, n4 = 0, 0, 0, 0
    # N1：行/列同色连续 >= 5
    for y in range(SIZE):
        run, prev = 1, mat[y][0]
        for x in range(1, SIZE):
            if mat[y][x] == prev:
                run += 1
                if x == SIZE - 1 and run >= 5:
                    n1 += 3 + run - 5
            else:
                if run >= 5:
                    n1 += 3 + run - 5
                run, prev = 1, mat[y][x]
    for x in range(SIZE):
        run, prev = 1, mat[0][x]
        for y in range(1, SIZE):
            if mat[y][x] == prev:
                run += 1
                if y == SIZE - 1 and run >= 5:
                    n1 += 3 + run - 5
            else:
                if run >= 5:
                    n1 += 3 + run - 5
                run, prev = 1, mat[y][x]
    # N2：2×2 同色块
    for y in range(SIZE - 1):
        for x in range(SIZE - 1):
            if mat[y][x] == mat[y][x + 1] == mat[y + 1][x] == mat[y + 1][x + 1]:
                n2 += 3
    # N3：类定位图形 1011101（两侧各带 >=4 空白）
    pats = ('00001011101', '10111010000')
    for y in range(SIZE):
        s = ''.join('1' if mat[y][x] else '0' for x in range(SIZE))
        n3 += 40 * sum(s.count(p) for p in pats)
    for x in range(SIZE):
        s = ''.join('1' if mat[y][x] else '0' for y in range(SIZE))
        n3 += 40 * sum(s.count(p) for p in pats)
    # N4：黑块比例
    dark = sum(sum(row) for row in mat)
    total = SIZE * SIZE
    n4 = (abs(dark * 100 // total - 50) // 5) * 10
    return n1 + n2 + n3 + n4


def render_png(mat, scale=14, quiet=4):
    dim = (SIZE + 2 * quiet) * scale
    img = Image.new('RGB', (dim, dim), 'white')
    px = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            if mat[y][x]:
                for dy in range(scale):
                    for dx in range(scale):
                        px[(x + quiet) * scale + dx, (y + quiet) * scale + dy] = (0, 0, 0)
    img.save(OUT)
    return OUT, dim


def main():
    _selftest()
    import sys
    payload_text = sys.argv[1] if len(sys.argv) > 1 else PAYLOAD
    out_name = sys.argv[2] if len(sys.argv) > 2 else OUT
    global OUT
    OUT = out_name
    payload = payload_text.encode('utf-8')
    assert len(payload) <= 53, '超出 V3-L 字节容量'
    print(f'载荷 {len(payload)} 字节: {payload_text}')

    bits = build_data_codewords(payload)
    data_cw = [int(''.join(map(str, bits[i:i + 8])), 2) for i in range(0, len(bits), 8)]
    ec_cw = rs_compute_ec(data_cw, EC_CW)
    codewords = data_cw + ec_cw
    print(f'数据码字 {len(data_cw)} + 纠错码字 {len(ec_cw)} = {len(codewords)}')

    # 校验 1：完整消息 F(x)=M(x)·x^15+R(x) 应能被生成多项式整除
    rem = poly_remainder([0] * EC_CW + list(reversed(data_cw)), EC_CW)
    full = [0] * EC_CW + list(reversed(data_cw))
    for j in range(EC_CW):
        full[j] ^= rem[j]
    assert all(v == 0 for v in poly_remainder(full, EC_CW)), 'RS 整除校验失败'
    print('RS 整除校验: PASS')

    draw_function_patterns()
    cells = zigzag_cells()
    cw_bits = []
    for cw in codewords:
        cw_bits += [(cw >> i) & 1 for i in range(7, -1, -1)]

    base = [row[:] for row in modules]
    data_cells = [(y, x) for y, x in cells if not is_func[y][x]]
    assert len(data_cells) >= len(cw_bits), '数据容量不足'
    for (y, x), b in zip(data_cells, cw_bits):
        base[y][x] = bool(b)

    best = None
    for m in range(8):
        mat = [row[:] for row in base]
        apply_mask(mat, m, cells)
        draw_format_bits(m, mat=mat, fn=[[False] * SIZE for _ in range(SIZE)])
        p = penalty(mat)
        print(f'  掩码 {m}: 惩罚分 {p}')
        if best is None or p < best[1]:
            best = (m, p, mat)
    mask_id, best_p, final = best
    print(f'选用掩码 {mask_id}（惩罚分 {best_p}）')

    # 校验 2：两处格式信息满足 BCH(0x537) 校验，且解出 (ECL, 掩码) 正确
    def read_format(copy2):
        if not copy2:
            pos = [(8, y) for y in (0, 1, 2, 3, 4, 5)] + [(8, 7), (8, 8), (7, 8)] \
                + [(14 - i, 8) for i in range(9, 15)]
        else:
            pos = [(SIZE - 1 - i, 8) for i in range(8)] \
                + [(8, SIZE - 15 + i) for i in range(8, 15)]
        v = 0
        for i, (x, y) in enumerate(pos):
            v |= (1 if final[y][x] else 0) << i
        return v

    for c2 in (False, True):
        v = read_format(c2)
        w = v ^ 0x5412
        for b in range(14, 9, -1):
            if (w >> b) & 1:
                w ^= 0x537 << (b - 10)
        assert w == 0, f'格式信息 BCH 校验失败（副本{2 if c2 else 1}）'
        dec = (v ^ 0x5412) >> 10
        assert (dec >> 3) == ECL_FORMAT_BITS and (dec & 7) == mask_id, '格式信息解码不符'
    print('格式信息 BCH/解码校验: PASS（两副本）')

    # 校验 3：结构断言——暗模块、时序图案、校正图形
    assert final[SIZE - 8][8] is True, '暗模块缺失'
    assert all(final[6][x] == (x % 2 == 0) and final[x][6] == (x % 2 == 0)
               for x in range(8, SIZE - 8)), '时序图案异常'
    assert final[22][22] and not final[21][22] and not final[23][22] \
        and not final[22][21] and not final[22][23], '校正图形异常'
    assert final[20][22] and final[24][22] and final[22][20] and final[22][24], '校正图形外环异常'
    print('结构断言校验: PASS')

    # 校验 2：从最终矩阵回读数据位，须与原始比特流一致
    back = []
    for y, x in data_cells[:len(cw_bits)]:
        v = final[y][x]
        if mask_bit(mask_id, y, x):
            v ^= True
        back.append(int(v))
    assert back == cw_bits, '回读校验失败'
    print('矩阵回读校验: PASS')

    path, dim = render_png(final)
    print(f'已生成: {path}（{dim}×{dim}px）')


if __name__ == '__main__':
    main()

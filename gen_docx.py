# -*- coding: utf-8 -*-
"""生成《藏红花（西红花）国内外现行标准汇总清单》排版 Word 文档"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

NAVY = '1F4E79'
GRAY = '595959'
ZEBRA = 'EEF3FA'

OUT = '藏红花（西红花）国内外现行标准汇总清单.docx'


def _clean_theme(rfonts):
    for a in ('w:asciiTheme', 'w:hAnsiTheme', 'w:eastAsiaTheme', 'w:cstheme'):
        rfonts.attrib.pop(qn(a), None)


def set_run(run, east='宋体', latin='Times New Roman', size=12, bold=None, color=None):
    run.font.name = latin
    run.font.size = Pt(size)
    if bold is not None:
        run.font.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.get_or_add_rFonts()
    _clean_theme(rfonts)
    rfonts.set(qn('w:eastAsia'), east)
    rfonts.set(qn('w:cs'), latin)


def style_font(st, east, latin, size, bold=None, color=None):
    st.font.name = latin
    st.font.size = Pt(size)
    if bold is not None:
        st.font.bold = bold
    if color:
        st.font.color.rgb = RGBColor.from_string(color)
    rpr = st.element.get_or_add_rPr()
    rfonts = rpr.get_or_add_rFonts()
    _clean_theme(rfonts)
    rfonts.set(qn('w:eastAsia'), east)
    rfonts.set(qn('w:cs'), latin)


doc = Document()

# ---- 页面：A4，常规页边距 ----
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.top_margin = sec.bottom_margin = Cm(2.54)
sec.left_margin = sec.right_margin = Cm(3.17)

# ---- 样式 ----
styles = doc.styles
style_font(styles['Normal'], '宋体', 'Times New Roman', 12)
npf = styles['Normal'].paragraph_format
npf.line_spacing = 1.4
npf.space_after = Pt(4)

style_font(styles['Title'], '黑体', 'Arial', 20, bold=True, color=NAVY)
tpf = styles['Title'].paragraph_format
tpf.alignment = WD_ALIGN_PARAGRAPH.CENTER
tpf.space_before = Pt(6)
tpf.space_after = Pt(2)
tpf.line_spacing = 1.25

for name, size, before, after in (('Heading 1', 16, 16, 8),
                                  ('Heading 2', 14, 12, 6),
                                  ('Heading 3', 12, 8, 4)):
    st = styles[name]
    color = NAVY if name != 'Heading 3' else '262626'
    style_font(st, '黑体', 'Arial', size, bold=True, color=color)
    pf = st.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.keep_with_next = True

style_font(styles['List Bullet'], '宋体', 'Times New Roman', 12)


# ---- 结构辅助 ----
def add_body(text, label=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf = p.paragraph_format
    pf.first_line_indent = Pt(24)
    if label:
        r = p.add_run(label)
        set_run(r, east='黑体', bold=True)
    r = p.add_run(text)
    set_run(r)
    return p


def add_bullet(text, label=None):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(2)
    if label:
        r = p.add_run(label)
        set_run(r, east='黑体', bold=True)
    r = p.add_run(text)
    set_run(r)
    return p


def h(level, text, page_break=False):
    p = doc.add_heading(text, level=level)
    if page_break:
        p.paragraph_format.page_break_before = True
    return p


def shade(cell, fill):
    tcpr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill)
    tcpr.append(shd)


def fill_cell(cell, text, east='宋体', size=10.5, bold=False, color=None, center=False):
    p = cell.paragraphs[0]
    pf = p.paragraph_format
    pf.space_before = Pt(2)
    pf.space_after = Pt(2)
    pf.line_spacing = 1.2
    if center:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    set_run(r, east=east, size=size, bold=bold, color=color)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER


# ---- 标题区 ----
doc.add_heading('藏红花（西红花）国内外现行标准汇总清单', level=0)
sub = doc.add_paragraph()
sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
sub.paragraph_format.space_after = Pt(10)
r = sub.add_run('（含核心指标与对标说明）')
set_run(r, size=13, bold=True, color=GRAY)
ppr = sub._p.get_or_add_pPr()
pbdr = OxmlElement('w:pBdr')
bottom = OxmlElement('w:bottom')
for k, v in (('w:val', 'single'), ('w:sz', '8'), ('w:space', '6'), ('w:color', NAVY)):
    bottom.set(qn(k), v)
pbdr.append(bottom)
ppr.append(pbdr)

add_body('本文梳理现行有效、权威通用的藏红花（药典及香料品名：西红花）国内标准、国际标准，涵盖国标、地方标准、'
         '团体标准、药典标准、ISO 国际标准、食品法典标准及主流国别药典标准，明确各标准适用场景、核心管控指标、'
         '差异化特点，适配西藏藏红花企业从企标完善、地标升级到国际标准培育的全流程对标需求。')

# ---- 一、国内现行标准体系 ----
h(1, '一、国内现行标准体系（层级从高到低）')
h(2, '（一）国家级标准（国标＋药典，全国通用底线标准）')
h(3, '1. GB/T 22324.1-2017《藏红花 第1部分：规格》')
add_body('等同采用 ISO 3632-1:2011，是国内藏红花香料领域唯一国家级通用规格标准，适用于食用、香料用干藏红花花丝'
         '及粉末，核心用于商品分级、贸易结算。')
add_body('依据藏红花三大核心活性物质（番红花苷、苦番红花素、藏红花醛）划分三级品质：', label='核心分级指标：')
add_bullet('着色力（番红花苷）≥200，味觉值（苦番红花素）、香气值（藏红花醛）达到国际优质标准', label='特级（I 类）：')
add_bullet('着色力 150～200', label='二级（II 类）：')
add_bullet('着色力 100～150', label='三级（III 类）：')
h(3, '2. 《中华人民共和国药典》（2020 年版、2023 年修订增补）')
add_body('中药材、药用藏红花强制性底线标准，所有药用藏红花必须合规执行；2023 年全面收紧安全指标，对标欧盟药典。')
add_body('水分 ≤12.0%、总灰分 ≤7.5%；西红花苷-I＋西红花苷-II 总量 ≥10.0%，苦番红花素 ≥5.0%；新增指纹图谱鉴别，'
         '重金属及农残限量严控，是药用藏红花准入市场的核心依据。', label='核心质控要求：')

h(2, '（二）西藏自治区地方标准（适配本地地理标志专属标准，核心对标依据）')
add_body('两套专属地方标准，是本次帮扶企业标准化建设的核心基底，区别于内地通用标准，凸显西藏高原产区特色。')
h(3, '1. DB54/T 0244-2021《西藏藏红花生产技术规程》')
add_body('覆盖全种植加工流程，规定西藏藏红花产地环境、球茎培育、田间管护、采收、初加工、晾晒烘干等专属工艺要求，'
         '填补高原种植标准化空白，是企业制定种植、加工企标的直接依据。')
h(3, '2. DB54/T 0245-2021《地理标志产品 西藏藏红花》')
add_body('西藏藏红花地理标志合规性专用标准，明确地理标志产品保护范围、品质特色、理化指标、检验方法、标识使用规范，'
         '是西藏藏红花区别于伊朗、上海崇明等产区的核心标准依据，也是企业地标品牌赋能的核心支撑。')

h(2, '（三）国内团体标准（行业分级、市场化优质标准）')
h(3, '1. T/CATCM 002-2018《西红花质量等级》')
add_body('国内中药行业首个西红花质量分级团体标准，打破药典仅设底线无分级的短板，将中药材西红花划分为特级、一级、'
         '二级，适配高端中药材贸易、品牌分级定价。')
h(3, '2. T/CGAPA 073-2026《崇明藏红花质量要求》')
add_body('内地产区特色团体标准，规定崇明藏红花生产、质量、检测规范，可作为西藏藏红花跨产区对标、差异化提质的参考标准。')

# ---- 二、国际现行权威标准体系 ----
h(1, '二、国际现行权威标准体系（国际贸易、国际标准申报核心对标）')
h(2, '（一）ISO 国际核心标准（全球香料通用最高标准）')
h(3, '1. ISO 3632-1:2025《香料 藏红花 第1部分：规格》（最新修订版）')
add_body('替代旧版 2011 版，是全球藏红花贸易通用分级基准，统一理化检测方法、品质分级、杂质限值；核心以番红花苷（着色）、'
         '苦番红花素（口感）、藏红花醛（香气）三大指标作为分级核心，为国际通用定价依据。')
h(3, '2. ISO 3632-2:2010《香料 藏红花 第2部分：试验方法》')
add_body('配套检测方法标准，统一全球藏红花取样、前处理、仪器检测流程，保障各国检测数据互通互认，是企业开展国际对标、'
         '积累合规检测数据的核心依据。')
h(3, '3. ISO 21590:2026《中医药 西红花》')
add_body('最新中医药领域国际标准，整合显微鉴别、薄层鉴别、理化检测方法，兼顾中医药应用与国际通用检测逻辑，'
         '是我国推动中药藏红花国际化的核心标准载体。')

h(2, '（二）国际食品法典标准（全球食品准入底线）')
h(3, 'CXS 351-2022（2025 修订）《干藏红花制品》')
add_body('由 FAO/WHO 联合发布，是全球食品级藏红花贸易、跨境准入、食品安全仲裁的权威标准，规定食品用藏红花的原料定义、'
         '感官要求、理化限值、污染物、农残、包装标识规范，是企业拓展海外食品市场、规避贸易壁垒的核心对标标准。')

h(2, '（三）海外主流药典标准（药用藏红花国际准入标准）')
add_bullet('管控严苛，细化农残、重金属、微生物限值，是欧盟市场准入核心标准，国内 2023 版药典已对标其核心指标。',
           label='欧洲药典（EP 10.0+）：')
add_bullet('各有差异化鉴别与限值要求，侧重本地化药品准入规范，是细分海外市场的对标依据。',
           label='美国药典（USP）、日本药典（JP）、韩国药典（KP）：')
add_bullet('伊朗作为全球最大藏红花产区，拥有成熟的产区分级国标；西班牙主打高端出口分级标准，是国际市场化分级的重要参考。',
           label='伊朗、西班牙国别标准：')

# ---- 三、差异化与对标价值 ----
h(1, '三、各层级标准差异化与企业对标价值（适配本方案培育路径）')
h(2, '（一）现有标准短板（企业升级核心突破口）')
add_body('1. 西藏现有地方标准侧重种植生产、地标合规，缺少高端品质分级、精细化检测、国际化适配条款；')
add_body('2. 国标、药典为通用底线标准，未体现西藏高原藏红花高活性成分的独有优势，无法形成差异化标准话语权；')
add_body('3. 国内无专属西藏藏红花的高端分级、出口适配标准，与 ISO 最新版、国际食品法典标准存在指标细化差距。')

h(2, '（二）分阶段对标应用建议（匹配方案三阶段培育）')
add_body('以西藏 DB54 地方标准为基底，对标国标 GB/T 22324、中国药典，补齐全流程标准化条款；',
         label='1. 基础培育期（企标建设）：')
add_body('对标国内优质团体标准、ISO 3632-1:2017 旧版，优化品质分级体系，凸显西藏品质优势；',
         label='2. 标准升级期（地方/团体标准）：')
add_body('深度对标 ISO 3632-1:2025 新版、CXS 351-2022、ISO 21590:2026，填补西藏藏红花国际化指标空白，'
         '提炼独有高原品质技术指标，申报国际标准。', label='3. 国际筹备期（国际标准培育）：')

# ---- 四、标准清单汇总表（整表另起一页，避免跨页断裂） ----
h(1, '四、标准清单汇总表', page_break=True)

rows = [
    ('国内国标', 'GB/T 22324.1-2017《藏红花 第1部分：规格》', '香料级藏红花通用分级、国内贸易'),
    ('国内药典', '《中华人民共和国药典》（2020 年版、2023 年修订增补）西红花', '药用藏红花准入、安全底线管控'),
    ('西藏地方标准', 'DB54/T 0244-2021《西藏藏红花生产技术规程》', '高原种植、初加工标准化'),
    ('西藏地方标准', 'DB54/T 0245-2021《地理标志产品 西藏藏红花》', '地标合规、地域品质确权'),
    ('国内团体标准', 'T/CATCM 002-2018《西红花质量等级》', '中药材高端分级、品牌定价'),
    ('国内团体标准', 'T/CGAPA 073-2026《崇明藏红花质量要求》', '产区对标、差异化提质参考'),
    ('国际 ISO 标准', 'ISO 3632-1:2025《香料 藏红花 第1部分：规格》（最新版）', '全球香料贸易高端分级'),
    ('国际 ISO 标准', 'ISO 3632-2:2010《香料 藏红花 第2部分：试验方法》', '国际通用检测方法、数据互认'),
    ('国际 ISO 标准', 'ISO 21590:2026《中医药 西红花》', '中药藏红花国际化标准支撑'),
    ('国际食品法典', 'CXS 351-2022（2025 修订）《干藏红花制品》', '全球食品准入、跨境贸易合规'),
    ('海外药典', 'EP、USP、JP、KP 西红花标准', '海外药用市场准入'),
]

table = doc.add_table(rows=1, cols=3)
table.style = 'Table Grid'
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.autofit = False
widths = (Cm(2.9), Cm(6.9), Cm(4.86))
for i, w in enumerate(widths):
    table.columns[i].width = w

hdr = table.rows[0]
for i, (w, t) in enumerate(zip(widths, ('标准层级', '标准编号及名称', '核心用途'))):
    hdr.cells[i].width = w
    shade(hdr.cells[i], NAVY)
    fill_cell(hdr.cells[i], t, east='黑体', bold=True, color='FFFFFF', center=True)
trpr = hdr._tr.get_or_add_trPr()
tbl_header = OxmlElement('w:tblHeader')
tbl_header.set(qn('w:val'), 'true')
trpr.append(tbl_header)

for idx, data in enumerate(rows):
    row = table.add_row()
    for i, (w, t) in enumerate(zip(widths, data)):
        row.cells[i].width = w
        if idx % 2 == 1:
            shade(row.cells[i], ZEBRA)
        fill_cell(row.cells[i], t, center=(i == 0))

# 禁止表格行内跨页断行
for row in table.rows:
    trpr = row._tr.get_or_add_trPr()
    cant = OxmlElement('w:cantSplit')
    trpr.append(cant)

# ---- 页脚页码 ----
footer_p = sec.footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
fld = OxmlElement('w:fldSimple')
fld.set(qn('w:instr'), r' PAGE \* MERGEFORMAT ')
fr = OxmlElement('w:r')
frpr = OxmlElement('w:rPr')
sz = OxmlElement('w:sz')
sz.set(qn('w:val'), '18')
frpr.append(sz)
szcs = OxmlElement('w:szCs')
szcs.set(qn('w:val'), '18')
frpr.append(szcs)
fr.append(frpr)
ft = OxmlElement('w:t')
ft.text = '1'
fr.append(ft)
fld.append(fr)
footer_p._p.append(fld)

# ---- 文档属性 ----
doc.core_properties.title = '藏红花（西红花）国内外现行标准汇总清单'
doc.core_properties.subject = '标准对标汇总'

doc.save(OUT)
print('saved:', OUT)

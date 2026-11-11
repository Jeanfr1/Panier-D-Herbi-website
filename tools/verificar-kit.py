#!/usr/bin/env python3
"""Static evidence only: not a browser or interaction test."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from PIL import Image
from fontTools.ttLib import TTFont
import json,re,subprocess,sys,hashlib

ROOT=Path(__file__).resolve().parents[1]
checks=[]
def check(name,ok,detail=''):checks.append({'check':name,'pass':bool(ok),'detail':detail})
class Page(HTMLParser):
    def __init__(self):super().__init__();self.tags=[];self.ids=[]
    def handle_starttag(self,t,a):
        a=dict(a);self.tags.append((t,a))
        if 'id' in a:self.ids.append(a['id'])
for filename in ['dist/index.html','GUIA-VISUAL.html']:
    p=ROOT/filename;page=Page();page.feed(p.read_text())
    check(f'{filename}: unique IDs',len(page.ids)==len(set(page.ids)))
    for tag,a in page.tags:
        for attr in ['src','href']:
            value=a.get(attr,'');u=urlsplit(value)
            if not value or u.scheme or value.startswith('//'):continue
            if value.startswith('#'):check(f'{filename}: anchor {value}',value[1:] in page.ids)
            else:
                dest=(p.parent/unquote(u.path)).resolve();check(f'{filename}: local {value}',dest.is_file() and dest.stat().st_size>0)
        if tag=='img':check(f'{filename}: alt {a.get("src")}', 'alt' in a)
        if tag=='a' and a.get('target')=='_blank':check(f'{filename}: safe external rel', 'noopener' in a.get('rel',''))
        if tag=='img' and a.get('src','').startswith('assets/images/'):
            im=Image.open(p.parent/a['src']);width=int(a.get('width',im.width));height=int(a.get('height',im.height))
            check(f'{filename}: intrinsic image ratio {a["src"]}',abs(width/height-im.width/im.height)<.001)

html=(ROOT/'dist/index.html').read_text();css=(ROOT/'dist/styles.css').read_text();js=(ROOT/'dist/app.js').read_text()
for url in re.findall(r'url\([\'\"]?([^\)\'\"]+)',css):
    if url.startswith('#'):continue
    check(f'CSS asset {url}',(ROOT/'dist'/url).is_file())
check('CSS balanced braces',css.count('{')==css.count('}'))
check('French public language','<html lang="fr">' in html)
check('No Portuguese fragments in public copy',not any(x in html for x in ['rótulos','sacola','cesta.','Baixar','Horários']))
check('Five chapters exactly',len(re.findall(r'<section\b',html))==5)
check('Selected hero and structure',all(x in html for x in ['LE QUOTIDIEN,','EN PLUS SIMPLE.','id="rayons"','id="service"','id="magasin"','id="contact"']))
check('Original and revised board not used as page',not re.search(r'Modelo1-|concept-fornecido',html+css+js))
check('No 100vh pinned chapters',not re.search(r'(?:height|min-height)\s*:\s*100(?:d|s|l)?vh',css))
check('Hero dimension explicit and natural ratio','--hero-subject:620px' in css and '.hero-plane img{width:100%;height:auto;' in css)
check('Desktop cap declared','@media(min-width:1024px){:root{--hero-title:80px;--hero-subject:620px}}' in css)
check('Native scroll not intercepted',not re.search(r'addEventListener\([\'\"](?:wheel|touchmove)',js))
check('Reduced motion plus pause', 'prefers-reduced-motion:reduce' in css and 'motion-paused' in css and 'manualPause' in js)
check('Dialog focus returned',"dialog.addEventListener('close'" in js and 'trigger?.focus()' in js)
check('Phone matches supplied business','tel:+33666533792' in html and '06 66 53 37 92' in html)
check('Address matches supplied business','13 place du Général d’Argence' in html and '44410 Herbignac' in html)
check('Current Instagram handle','https://www.instagram.com/panier_dherbi/' in html)
check('Winter notice and hours preserved',all(x in html for x in ['HORAIRES D’HIVER','17h30 – 23h30','18h – 2h','13h – 23h','2 novembre 2026']))
check('Wednesday closed markup','<th scope="row">Mer</th><td>Fermé</td>' in html)
check('No old summer hours in public page','HORAIRES D’ÉTÉ' not in html and '18h00 - 00h00' not in html)
check('Illustrative products disclosed','Visuels d’illustration' in html and 'emballages présentés sont des illustrations de campagne' in html)
check('No checkout, form, video, iframe or fake confirmation',not re.search(r'<(?:form|video|iframe)\b|commande confirmée|message envoyé|paiement réussi',html+js,re.I))
check('No remote scripts or font calls',not re.search(r'<(?:script|link)[^>]+(?:src|href)="https?://',html))
check('All three labelled family assets used',all(f'assets/images/{key}.webp' in html for key in ['epicerie','boissons','snacks']))
check('Native service slot mask present','clipPath id="basket-slots"' in html and 'assets/images/service.webp' in html)

records=[]
for p in sorted(ROOT.rglob('*')):
    if p.suffix.lower() not in ['.png','.webp']:continue
    try:
        im=Image.open(p);im.load();rel=str(p.relative_to(ROOT));check(f'Image decodes: {rel}',im.width>0 and im.height>0)
        record={'file':rel,'size':[im.width,im.height],'mode':im.mode,'bytes':p.stat().st_size}
        alpha_expected=('/campaign/' in rel or ('dist/assets/images/' in rel and p.stem!='facade') or 'Logo-Transparente' in rel or rel=='dist/assets/brand/logo.png')
        if alpha_expected:
            alpha=im.getchannel('A') if 'A' in im.getbands() else None
            check(f'True alpha: {rel}',alpha is not None and alpha.getextrema()==(0,255))
            if alpha is not None:record['fully_transparent_fraction']=round(alpha.histogram()[0]/(im.width*im.height),4)
        records.append(record)
    except Exception as exc:check(f'Image decodes: {p.relative_to(ROOT)}',False,str(exc))
original=Image.open(ROOT/'images/originals/fachada.png').convert('RGB');production=Image.open(ROOT/'dist/assets/images/facade.webp').convert('RGB')
check('Facade lossless exact RGB equality',original.size==production.size and original.tobytes()==production.tobytes())
check('Photographic source attribution retained','© Google' in html)
for p in ROOT.rglob('*.json'):
    try:json.loads(p.read_text());check(f'JSON parses: {p.relative_to(ROOT)}',True)
    except Exception as exc:check(f'JSON parses: {p.relative_to(ROOT)}',False,str(exc))
for p in (ROOT/'dist/assets/fonts').glob('*.woff'):
    try:f=TTFont(p);check(f'Font decodes: {p.name}',f.flavor=='woff')
    except Exception as exc:check(f'Font decodes: {p.name}',False,str(exc))
for p in (ROOT/'fonts').glob('*OFL.txt'):check(f'OFL license: {p.name}','SIL OPEN FONT LICENSE' in p.read_text())
font=TTFont(ROOT/'fonts/BarlowCondensed-ExtraBoldItalic.ttf');cm=font.getBestCmap();up=font['head'].unitsPerEm
check('French display glyphs',all(ord(c) in cm for c in 'ÉÇàé’'))
def advance(text,size,tracking):
    return sum(font['hmtx'].metrics[cm[ord(c)]][0] for c in text)/up*size+max(0,len(text)-1)*tracking*size
measurements=[]
for width in [375,768,1024,1440,1920]:
    mobile=width<=680;tablet=width<=860 and not mobile
    title=56 if mobile else 68 if tablet else 80;basket=365 if mobile else 520 if tablet else 620
    gutter=24 if mobile else 32 if width<=1000 else 44;canvas=min(width,1024);box=canvas-2*gutter if mobile else 410 if tablet else 490
    title_width=max(advance(x,title,-.02) for x in ['LE QUOTIDIEN,','EN PLUS SIMPLE.'])
    rayon_size=43 if mobile else 58 if tablet else 64
    rayon_lines=['PETITES ENVIES.','GRANDES','TROUVAILLES.'] if width<=400 else ['PETITES ENVIES.','GRANDES TROUVAILLES.']
    rayon_width=max(advance(x,rayon_size,-.02 if mobile else -.018) for x in rayon_lines)
    measurements.append({'viewport':width,'virtual_canvas_width':canvas,'desktop_scale':1 if width>=1024 else None,'hero_title_px':title,'hero_basket_width_px':basket,'hero_basket_height_px':basket,'h1_advance_plus_tracking_px':round(title_width,2),'h1_text_box_px':box,'rayons_title_px':rayon_size,'rayons_max_line_px':round(rayon_width,2),'method':'static breakpoint contract and font advance/tracking calculation; excludes browser shaping, layout and screenshots'})
    check(f'H1 fits contract at {width}px',title_width<=box)
    check(f'Rayons heading fits at {width}px',rayon_width<=canvas-2*gutter)
check('Desktop size unchanged at 1024/1440/1920',len({(x['hero_title_px'],x['hero_basket_width_px']) for x in measurements if x['viewport']>=1024})==1)
for name in ['01-DIRECAO-DE-ARTE.md','02-HERO-E-ANIMACAO.md','03-SECOES-E-DIVISOES.md','04-CONTEUDO-E-FLUXOS.md','05-ROTULOS-E-ASSETS.md','06-VALIDACAO-E-ENTREGA.md']:
    check(f'Production script {name}',(ROOT/'roteiros'/name).is_file())
try:
    syntax=subprocess.run(['node','--check',str(ROOT/'dist/app.js')],capture_output=True,text=True)
    check('JavaScript syntax',syntax.returncode==0,syntax.stderr.strip())
except FileNotFoundError:check('JavaScript syntax',False,'Node not available')

(ROOT/'docs/image-validation.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/scale-measurements.json').write_text(json.dumps(measurements,ensure_ascii=False,indent=2)+'\n')
report={'static_pass':all(c['pass'] for c in checks),'checks':len(checks),'passed':sum(c['pass'] for c in checks),'failed':[c for c in checks if not c['pass']],'browser_qa':'UNVERIFIED','interaction_qa':'UNVERIFIED in browser; code implemented and syntax checked','preview_error':'sites-preview: preview relay unavailable: No such file or directory (os error 2)','label_audit':'visual inspection of generated masters; not actual inventory or OCR verification','checks_detail':checks}
(ROOT/'docs/QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/QA.md').write_text(f'''# Validação — Panier d’Herbi, Édition signée

**Checagens estáticas: {report['passed']}/{report['checks']} aprovadas.**

**QA visual e de interação em navegador: NÃO VERIFICADO.** O comando de prévia retornou `preview relay unavailable: No such file or directory`. Nenhum servidor/navegador alternativo foi iniciado para contornar a infraestrutura.

## Executado

Referências locais e âncoras; proporções intrínsecas; sintaxe JS; JSON; cinco capítulos e hero escolhido; horário de inverno; texto público em francês; fontes/licenças e glyphs; decodificação de cada imagem; canal alpha dos recortes e logo; igualdade exata RGB da fachada com o original; parâmetros de escala e métricas tipográficas em 375, 768, 1024, 1440 e 1920 px.

Em 1024/1440/1920: H1 80 px, cesto 620 px, base central 1024 px. O cálculo usa avanços da fonte e tracking e não substitui a medição em navegador. O mobile usa reflow com quebra extra nos rayons e scroll nativo da prateleira.

## Inspeção dos rótulos e assets

Prancha original e revisão com rótulos foram inspecionadas, assim como marca, hero, épicerie, boissons, snacks e serviço. As embalagens dos masters finais apresentam a identidade Panier d’Herbi, incluindo água e conservas. A restauração da marca é raster, não mestre vetorial oficial. São mockups de campanha, sem afirmação de estoque ou de linha própria real.

## Pendente em navegador

Enquadramento e sobreposições por breakpoint, legibilidade real dos rótulos e textos, estabilidade no carregamento, menu e âncoras, seleção/swipe dos rayons, ampliação, Escape, clique externo, retorno de foco, links em aplicativos reais, pausa, preferência reduzida e ausência de transbordamento horizontal fora da prateleira. Não foram efetuadas chamadas, mensagens, e-mails, pedidos ou publicação.

## Integridade

Os hashes de todos os arquivos estão em MANIFEST.sha256. O relatório externo de release registra o hash do ZIP e a verificação CRC de todas as entradas, além da comparação com o manifesto. Isso evita referências circulares ao próprio ZIP.
''')
print(json.dumps({k:report[k] for k in ['static_pass','checks','passed','failed','browser_qa']},ensure_ascii=False))
sys.exit(0 if report['static_pass'] else 1)

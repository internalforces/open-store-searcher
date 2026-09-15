"""Research packaging only: no validated release or production baseline is created."""
import hashlib,json,os,shutil
from pathlib import Path
root=Path('/private/tmp/seoul-static-profile-20260914'); repo=Path.cwd()
p=json.loads((root/'profile.json').read_text()); shared=json.loads((root/'shared-profile.json').read_text()); idx=json.loads((root/'index-profile.json').read_text())
site=root/'research-site';site.mkdir();shutil.copytree(root/'shell',site,dirs_exist_ok=True);(site/'data').mkdir()
entries=[]
for b in p['variants']['dictionary-columns']['blocks']:
 if b['role']=='search':
  src=root/'dictionary-columns'/b['name'];os.link(src,site/'data'/b['name']);entries.append(b)
for b in shared['entries']:
 src=root/'shared-columns'/b['name'];os.link(src,site/'data'/b['name']);entries.append(b)
for b in entries:
 data=(site/'data'/b['name']).read_bytes();assert len(data)==b['bytes'];assert hashlib.sha256(data).hexdigest()==b['sha256']
shutil.copy2('/Users/sonmyeong-gwan/Downloads/observation.json',site/'observation.json')
manifest={'kind':'research-package-only','publicationApproved':False,'source':p['input'],'metadata':p['metadata'],'baseline':None,'entries':entries,'warning':'Existing demo shell for byte accounting only. No compact Worker or production release is implemented.'}
(site/'research-manifest.json').write_text(json.dumps(manifest,separators=(',',':'),ensure_ascii=False)+'\n')
files=[{'path':str(f.relative_to(site)),'bytes':f.stat().st_size} for f in site.rglob('*') if f.is_file()];size=sum(f['bytes'] for f in files)
assert p['originalRecordBytes']==sum(p['topLevelFieldBytes'].values())+12*p['input']['recordCount']
assert p['input']['byteLength']==p['originalRecordBytes']+p['nonRecordBytes']
inputpath=Path('/Users/sonmyeong-gwan/Downloads/dataset.json');h=hashlib.sha256()
with inputpath.open('rb') as f:
 while b:=f.read(8*1024*1024):h.update(b)
assert h.hexdigest()==p['input']['sha256']
scriptfiles=sorted((repo/'.testagent/static-delivery-research').glob('*.mjs'))+sorted((repo/'.testagent/static-delivery-research').glob('*.py'))
summary={'kind':'research-feasibility-package','productionApproved':False,'productionSiteMeasured':False,'source':p['input'],'variants':{k:{a:b for a,b in v.items() if a!='blocks'} for k,v in p['variants'].items()},'shared':{k:v for k,v in shared.items() if k!='entries'},'index':idx,'researchSiteBytes':size,'researchSiteFileCount':len(files),'shellBytes':sum(f.stat().st_size for f in (root/'shell').rglob('*') if f.is_file()),'manifestBytes':(site/'research-manifest.json').stat().st_size,'observationBytes':(site/'observation.json').stat().st_size,'siteLimitBytes':1000000000,'remainingResearchSiteBytes':1000000000-size,'siteWithOptionalExactIndexesBytes':size+sum(i['bytes'] for i in idx['indexes']),'sourceHashRecheckedAfterProfiling':True,'researchScriptHashes':{str(f.relative_to(repo)):hashlib.sha256(f.read_bytes()).hexdigest() for f in scriptfiles},'engineHashes':{str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in [Path('src/search/search-candidates.ts'),Path('src/search/prepare-search-query.ts'),Path('src/search/compare-search-address.ts')]},'limitations':['Research site includes the existing demo shell and receipt, not a Worker-enabled production shell or accepted baseline.','Gzip totals are real gzipSync/createGzip outputs, not a measured Pages Content-Encoding or browser transfer.','No complete-source browser readiness, search latency, pagination or refresh overlap measurement before design approval.','Research scripts were formatted and local-variable names cleaned after execution; serialization/scoring behavior unchanged.']}
(repo/'reports/measurements-2026-09-14-static-delivery.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
for name in ['profile','shared-profile','index-profile']:shutil.copy2(root/f'{name}.json',repo/f'reports/measurements-2026-09-14-static-delivery-{name}.json')
print(json.dumps({k:summary[k] for k in ['researchSiteBytes','researchSiteFileCount','shellBytes','manifestBytes','observationBytes','remainingResearchSiteBytes','siteWithOptionalExactIndexesBytes']},indent=2))

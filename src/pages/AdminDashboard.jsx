import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://api.chatter3.com';

const getToken=()=>localStorage.getItem('chatter3_token')||'';
const authFetch=(url,opts={})=>{
  const token=getToken();
  const headers={...opts.headers,'Content-Type':'application/json'};
  if(token)headers['Authorization']=`Bearer ${token}`;
  else console.error('authFetch: NO TOKEN for',url);
  return fetch(url,{...opts,headers});
};

const COUNTRIES=[{code:'AF',name:'Afghanistan'},{code:'AL',name:'Albania'},{code:'DZ',name:'Algeria'},{code:'AD',name:'Andorra'},{code:'AO',name:'Angola'},{code:'AG',name:'Antigua and Barbuda'},{code:'AR',name:'Argentina'},{code:'AM',name:'Armenia'},{code:'AU',name:'Australia'},{code:'AT',name:'Austria'},{code:'AZ',name:'Azerbaijan'},{code:'BS',name:'Bahamas'},{code:'BH',name:'Bahrain'},{code:'BD',name:'Bangladesh'},{code:'BB',name:'Barbados'},{code:'BY',name:'Belarus'},{code:'BE',name:'Belgium'},{code:'BZ',name:'Belize'},{code:'BJ',name:'Benin'},{code:'BT',name:'Bhutan'},{code:'BO',name:'Bolivia'},{code:'BA',name:'Bosnia and Herzegovina'},{code:'BW',name:'Botswana'},{code:'BR',name:'Brazil'},{code:'BN',name:'Brunei'},{code:'BG',name:'Bulgaria'},{code:'BF',name:'Burkina Faso'},{code:'BI',name:'Burundi'},{code:'CV',name:'Cabo Verde'},{code:'KH',name:'Cambodia'},{code:'CM',name:'Cameroon'},{code:'CA',name:'Canada'},{code:'CF',name:'Central African Republic'},{code:'TD',name:'Chad'},{code:'CL',name:'Chile'},{code:'CN',name:'China'},{code:'CO',name:'Colombia'},{code:'KM',name:'Comoros'},{code:'CG',name:'Congo'},{code:'CD',name:'Congo (DRC)'},{code:'CR',name:'Costa Rica'},{code:'HR',name:'Croatia'},{code:'CU',name:'Cuba'},{code:'CY',name:'Cyprus'},{code:'CZ',name:'Czech Republic'},{code:'DK',name:'Denmark'},{code:'DJ',name:'Djibouti'},{code:'DM',name:'Dominica'},{code:'DO',name:'Dominican Republic'},{code:'EC',name:'Ecuador'},{code:'EG',name:'Egypt'},{code:'SV',name:'El Salvador'},{code:'GQ',name:'Equatorial Guinea'},{code:'ER',name:'Eritrea'},{code:'EE',name:'Estonia'},{code:'SZ',name:'Eswatini'},{code:'ET',name:'Ethiopia'},{code:'FJ',name:'Fiji'},{code:'FI',name:'Finland'},{code:'FR',name:'France'},{code:'GA',name:'Gabon'},{code:'GM',name:'Gambia'},{code:'GE',name:'Georgia'},{code:'DE',name:'Germany'},{code:'GH',name:'Ghana'},{code:'GR',name:'Greece'},{code:'GD',name:'Grenada'},{code:'GT',name:'Guatemala'},{code:'GN',name:'Guinea'},{code:'GW',name:'Guinea-Bissau'},{code:'GY',name:'Guyana'},{code:'HT',name:'Haiti'},{code:'HN',name:'Honduras'},{code:'HU',name:'Hungary'},{code:'IS',name:'Iceland'},{code:'IN',name:'India'},{code:'ID',name:'Indonesia'},{code:'IR',name:'Iran'},{code:'IQ',name:'Iraq'},{code:'IE',name:'Ireland'},{code:'IL',name:'Israel'},{code:'IT',name:'Italy'},{code:'JM',name:'Jamaica'},{code:'JP',name:'Japan'},{code:'JO',name:'Jordan'},{code:'KZ',name:'Kazakhstan'},{code:'KE',name:'Kenya'},{code:'KI',name:'Kiribati'},{code:'KP',name:'North Korea'},{code:'KR',name:'South Korea'},{code:'KW',name:'Kuwait'},{code:'KG',name:'Kyrgyzstan'},{code:'LA',name:'Laos'},{code:'LV',name:'Latvia'},{code:'LB',name:'Lebanon'},{code:'LS',name:'Lesotho'},{code:'LR',name:'Liberia'},{code:'LY',name:'Libya'},{code:'LI',name:'Liechtenstein'},{code:'LT',name:'Lithuania'},{code:'LU',name:'Luxembourg'},{code:'MG',name:'Madagascar'},{code:'MW',name:'Malawi'},{code:'MY',name:'Malaysia'},{code:'MV',name:'Maldives'},{code:'ML',name:'Mali'},{code:'MT',name:'Malta'},{code:'MH',name:'Marshall Islands'},{code:'MR',name:'Mauritania'},{code:'MU',name:'Mauritius'},{code:'MX',name:'Mexico'},{code:'FM',name:'Micronesia'},{code:'MD',name:'Moldova'},{code:'MC',name:'Monaco'},{code:'MN',name:'Mongolia'},{code:'ME',name:'Montenegro'},{code:'MA',name:'Morocco'},{code:'MZ',name:'Mozambique'},{code:'MM',name:'Myanmar'},{code:'NA',name:'Namibia'},{code:'NR',name:'Nauru'},{code:'NP',name:'Nepal'},{code:'NL',name:'Netherlands'},{code:'NZ',name:'New Zealand'},{code:'NI',name:'Nicaragua'},{code:'NE',name:'Niger'},{code:'NG',name:'Nigeria'},{code:'MK',name:'North Macedonia'},{code:'NO',name:'Norway'},{code:'OM',name:'Oman'},{code:'PK',name:'Pakistan'},{code:'PW',name:'Palau'},{code:'PA',name:'Panama'},{code:'PG',name:'Papua New Guinea'},{code:'PY',name:'Paraguay'},{code:'PE',name:'Peru'},{code:'PH',name:'Philippines'},{code:'PL',name:'Poland'},{code:'PT',name:'Portugal'},{code:'QA',name:'Qatar'},{code:'RO',name:'Romania'},{code:'RU',name:'Russia'},{code:'RW',name:'Rwanda'},{code:'KN',name:'Saint Kitts and Nevis'},{code:'LC',name:'Saint Lucia'},{code:'VC',name:'Saint Vincent and the Grenadines'},{code:'WS',name:'Samoa'},{code:'SM',name:'San Marino'},{code:'ST',name:'Sao Tome and Principe'},{code:'SA',name:'Saudi Arabia'},{code:'SN',name:'Senegal'},{code:'RS',name:'Serbia'},{code:'SC',name:'Seychelles'},{code:'SL',name:'Sierra Leone'},{code:'SG',name:'Singapore'},{code:'SK',name:'Slovakia'},{code:'SI',name:'Slovenia'},{code:'SB',name:'Solomon Islands'},{code:'SO',name:'Somalia'},{code:'ZA',name:'South Africa'},{code:'SS',name:'South Sudan'},{code:'ES',name:'Spain'},{code:'LK',name:'Sri Lanka'},{code:'SD',name:'Sudan'},{code:'SR',name:'Suriname'},{code:'SE',name:'Sweden'},{code:'CH',name:'Switzerland'},{code:'SY',name:'Syria'},{code:'TW',name:'Taiwan'},{code:'TJ',name:'Tajikistan'},{code:'TZ',name:'Tanzania'},{code:'TH',name:'Thailand'},{code:'TL',name:'Timor-Leste'},{code:'TG',name:'Togo'},{code:'TO',name:'Tonga'},{code:'TT',name:'Trinidad and Tobago'},{code:'TN',name:'Tunisia'},{code:'TR',name:'Turkey'},{code:'TM',name:'Turkmenistan'},{code:'TV',name:'Tuvalu'},{code:'UG',name:'Uganda'},{code:'UA',name:'Ukraine'},{code:'AE',name:'United Arab Emirates'},{code:'GB',name:'United Kingdom'},{code:'US',name:'United States'},{code:'UY',name:'Uruguay'},{code:'UZ',name:'Uzbekistan'},{code:'VU',name:'Vanuatu'},{code:'VA',name:'Vatican City'},{code:'VE',name:'Venezuela'},{code:'VN',name:'Vietnam'},{code:'YE',name:'Yemen'},{code:'ZM',name:'Zambia'},{code:'ZW',name:'Zimbabwe'}];

const getFlag=code=>{
  if(!code)return'🌍';
  const c=COUNTRIES.find(x=>x.code===code);
  if(!c)return'🌍';
  return String.fromCodePoint(...c.code.toUpperCase().split('').map(ch=>0x1F1E6+ch.charCodeAt(0)-65));
};
const countryName=code=>{
  if(!code)return'';
  const c=COUNTRIES.find(x=>x.code===code);
  return c?c.name:code;
};
function CountrySelect({value,onChange,required,placeholder='Select your country'}){
  return(
    <select value={value||''} onChange={e=>onChange(e.target.value)} required={required}
      className="admin-select" style={{width:'100%',padding:'9px 12px',borderRadius:6,fontSize:15,boxSizing:'border-box'}}>
      <option value="" disabled>{placeholder}</option>
      {COUNTRIES.map(c=><option key={c.code} value={c.code}>{getFlag(c.code)} {c.name}</option>)}
    </select>
  );
}

function AdminSettingsPanel({user,t}){
  const[settings,setSettings]=useState({matching_by_level:'true',matching_diff_country:'true',matching_diff_language:'true',custom_call_duration:'0',promo_fp_free_days:'0',promo_initial_rp:'0',promo_badge_days:'0'});
  const[loading,setLoading]=useState(true);
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[customDur,setCustomDur]=useState('0');
  const[promoFpFree,setPromoFpFree]=useState('0');
  const[promoInitRp,setPromoInitRp]=useState('0');
  const[newMemberDays,setNewMemberDays]=useState('30');
  const[mvpMode,setMvpMode]=useState(false);
  const[maintenanceMode,setMaintenanceMode]=useState(false);
  const[maintenanceMsg,setMaintenanceMsg]=useState('');

  const post=(p,b)=>authFetch(`${API_URL}${p}`,{method:'POST',body:JSON.stringify(b||{})}).then(r=>r.json());

  useEffect(()=>{
    post('/api/admin/settings',{}).then(d=>{
      if(d.settings){
        const m={};d.settings.forEach(s=>m[s.key]=s.value);
        setSettings(m);
        setCustomDur(m.custom_call_duration||'0');
        setPromoFpFree(m.promo_fp_free_days||'0');
        setPromoInitRp(m.promo_initial_rp||'0');
        setNewMemberDays(m.new_member_days||'30');
        setMvpMode(m.mvp_mode==='true');
        setMaintenanceMode(m.maintenance_mode==='true');
        setMaintenanceMsg(m.maintenance_message||'');
      }
      setLoading(false);
    });
  },[]);

  const toggle=key=>{setSettings(prev=>({...prev,[key]:prev[key]==='true'?'false':'true'}));setSaved(false);};

  const saveAll=async()=>{
    setSaving(true);
    await Promise.all([
      post('/api/admin/settings/update',{key:'matching_by_level',value:settings.matching_by_level}),
      post('/api/admin/settings/update',{key:'matching_diff_country',value:settings.matching_diff_country}),
      post('/api/admin/settings/update',{key:'matching_diff_language',value:settings.matching_diff_language}),
      post('/api/admin/settings/update',{key:'custom_call_duration',value:customDur}),
      post('/api/admin/settings/update',{key:'promo_fp_free_days',value:promoFpFree}),
      post('/api/admin/settings/update',{key:'promo_initial_rp',value:promoInitRp}),
      post('/api/admin/settings/update',{key:'new_member_days',value:newMemberDays}),
      post('/api/admin/settings/update',{key:'mvp_mode',value:mvpMode?'true':'false'}),
      post('/api/admin/settings/update',{key:'maintenance_mode',value:maintenanceMode?'true':'false'}),
      post('/api/admin/settings/update',{key:'maintenance_message',value:maintenanceMsg}),
    ]);
    setSettings(prev=>({...prev,custom_call_duration:customDur,promo_fp_free_days:promoFpFree,promo_initial_rp:promoInitRp,new_member_days:newMemberDays}));
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),3000);
  };

  if(loading)return <p style={{color:'#9ca3af'}}>{t.admin.settings.loading}</p>;

  const allOff=settings.matching_by_level==='false'&&settings.matching_diff_country==='false'&&settings.matching_diff_language==='false';

  return(
    <div>
    <div className="admin-section">
      <h3>🎛️ {t.admin.settings.matchingTitle} <span style={{fontSize:'.72rem',color:'#94a3b8',fontWeight:400}}>— {t.admin.settings.matchingSubtitle}</span></h3>
      {[
        {key:'matching_by_level',name:t.admin.settings.matchByLevel,desc:t.admin.settings.matchByLevelDesc},
        {key:'matching_diff_country',name:t.admin.settings.preferCountries,desc:t.admin.settings.preferCountriesDesc},
        {key:'matching_diff_language',name:t.admin.settings.preferLanguages,desc:t.admin.settings.preferLanguagesDesc},
      ].map(({key,name,desc})=>(
        <div key={key} className="setting-row">
          <div className="setting-info">
            <div className="setting-name">{name}</div>
            <div className="setting-desc">{desc}</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings[key]==='true'} onChange={()=>toggle(key)}/>
            <span className="toggle-slider"/>
          </label>
        </div>
      ))}
      {allOff&&(
        <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
          <div className="setting-info">
            <div className="setting-name">{t.admin.settings.customDuration}</div>
            <div className="setting-desc">{t.admin.settings.customDurationDesc}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
            <input type="number" className="duration-input" min="1" max="60" value={customDur} onChange={e=>setCustomDur(e.target.value)}/>
            <span style={{fontSize:'.8rem',color:'#6b7280'}}>{t.admin.settings.minutesPerSession}</span>
          </div>
        </div>
      )}
      <button className="save-settings-btn" onClick={saveAll} disabled={saving}>{saving?t.admin.settings.saving:saved?t.admin.settings.saved:t.admin.settings.saveSettings}</button>
    </div>

    <div className="admin-section" style={{marginTop:'1rem'}}>
      <h3>🎁 {t.admin.settings.promotionsTitle} <span style={{fontSize:'.72rem',color:'#94a3b8',fontWeight:400}}>— {t.admin.settings.promotionsSubtitle}</span></h3>
      <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
        <div className="setting-info">
          <div className="setting-name">{t.admin.settings.freeFPPeriod}</div>
          <div className="setting-desc">{t.admin.settings.freeFPPeriodDesc}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
          <input type="number" className="duration-input" min="0" max="365" value={promoFpFree} onChange={e=>setPromoFpFree(e.target.value)}/>
          <span style={{fontSize:'.8rem',color:'#6b7280'}}>{t.admin.settings.daysOff}</span>
          {parseInt(promoFpFree)>0&&<span style={{fontSize:'.7rem',color:'#22c55e',fontWeight:600}}>● {t.admin.settings.active}</span>}
        </div>
      </div>
      <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
        <div className="setting-info">
          <div className="setting-name">{t.admin.settings.registrationRP}</div>
          <div className="setting-desc">{t.admin.settings.registrationRPDesc}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
          <input type="number" className="duration-input" min="0" max="100" value={promoInitRp} onChange={e=>setPromoInitRp(e.target.value)}/>
          <span style={{fontSize:'.8rem',color:'#6b7280'}}>{t.admin.settings.rpOff}</span>
          {parseInt(promoInitRp)>0&&<span style={{fontSize:'.7rem',color:'#22c55e',fontWeight:600}}>● {t.admin.settings.active}</span>}
        </div>
      </div>
      <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
        <div className="setting-info">
          <div className="setting-name">{t.admin.settings.newMemberBadge}</div>
          <div className="setting-desc">{t.admin.settings.newMemberBadgeDesc}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
          <input type="number" className="duration-input" min="0" max="365" value={newMemberDays} onChange={e=>setNewMemberDays(e.target.value)}/>
          <span style={{fontSize:'.8rem',color:'#6b7280'}}>{t.admin.settings.daysOffDefault}</span>
          {parseInt(newMemberDays)>0&&<span style={{fontSize:'.7rem',color:'#22c55e',fontWeight:600}}>● {t.admin.settings.active}</span>}
        </div>
      </div>
      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-name">{t.admin.settings.mvpMode}</div>
          <div className="setting-desc">{t.admin.settings.mvpModeDesc}</div>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={mvpMode} onChange={()=>setMvpMode(v=>!v)}/>
          <span className="toggle-slider"/>
        </label>
      </div>
    </div>

    <div className="admin-section" style={{marginTop:'1rem'}}>
      <h3>🔧 {t.admin.settings.systemTitle} <span style={{fontSize:'.72rem',color:'#94a3b8',fontWeight:400}}>— {t.admin.settings.systemSubtitle}</span></h3>
      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-name" style={maintenanceMode?{color:'#ef4444'}:{}}>{t.admin.settings.maintenanceMode} {maintenanceMode?'● '+t.admin.settings.active:''}</div>
          <div className="setting-desc">{t.admin.settings.maintenanceModeDesc}</div>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={maintenanceMode} onChange={()=>setMaintenanceMode(v=>!v)}/>
          <span className="toggle-slider"/>
        </label>
      </div>
      {maintenanceMode&&(
        <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
          <div className="setting-info">
            <div className="setting-name">{t.admin.settings.maintenanceMessage}</div>
            <div className="setting-desc">{t.admin.settings.maintenanceMessageDesc}</div>
          </div>
          <textarea value={maintenanceMsg} onChange={e=>setMaintenanceMsg(e.target.value)} placeholder={t.admin.settings.maintenancePlaceholder} style={{width:'100%',minHeight:60,padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem',resize:'vertical'}}/>
        </div>
      )}
      <button className="save-settings-btn" onClick={saveAll} disabled={saving}>{saving?t.admin.settings.saving:saved?t.admin.settings.saved:t.admin.settings.saveSettings}</button>
    </div>
    </div>
  );
}

function RichEditor({value,onChange}){
  const ref=useRef(null);
  useEffect(()=>{if(ref.current&&ref.current.innerHTML!==value){ref.current.innerHTML=value||'';}},[value]);
  const handlePaste=e=>{
    const html=e.clipboardData.getData('text/html');
    if(html){
      e.preventDefault();
      const cleaned=html.replace(/<meta[^>]*>/gi,'').replace(/<style[^>]*>[\s\S]*?<\/style>/gi,'').replace(/class="[^"]*"/gi,'').replace(/style="[^"]*"/gi,'').replace(/<div><br><\/div>/gi,'\n').replace(/<br\s*\/?>/gi,'\n');
      document.execCommand('insertHTML',false,cleaned);
    }
  };
  return <div ref={ref} contentEditable suppressContentEditableWarning onInput={e=>onChange(e.currentTarget.innerHTML)} onPaste={handlePaste} style={{width:'100%',minHeight:200,maxHeight:500,overflowY:'auto',padding:'10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:'.88rem',lineHeight:1.7,fontFamily:'system-ui',boxSizing:'border-box'}}/>;
}

function BlogTab({post,t}){
  const[posts,setPosts]=useState([]);
  const[loading,setLoading]=useState(true);
  const[editing,setEditing]=useState(null);
  const[form,setForm]=useState({slug:'',title:'',excerpt:'',content:'',status:'draft',lang:'en'});
  const[saving,setSaving]=useState(false);
  const[message,setMessage]=useState('');
  const[translatingPost,setTranslatingPost]=useState(null);
  const[transForm,setTransForm]=useState({});
  const get=(path)=>authFetch(`${API_URL}${path}`).then(r=>r.json());

  const loadPosts=()=>{setLoading(true);post('/api/admin/blog/list').then(d=>{if(d.success)setPosts(d.posts||[]);setLoading(false);}).catch(()=>setLoading(false));};
  useEffect(()=>{loadPosts();},[]);

  const slugify=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const startNew=()=>{setEditing('new');setForm({slug:'',title:'',excerpt:'',content:'',status:'draft',lang:'en'});};
  const startEdit=p=>{setEditing(p.id);setForm({slug:p.slug,title:p.title,excerpt:p.excerpt||'',content:p.content||'',status:p.status,lang:p.lang||'en'});};
  const cancel=()=>{setEditing(null);setForm({slug:'',title:'',excerpt:'',content:'',status:'draft',lang:'en'});};

  const save=async()=>{
    if(!form.slug||!form.title||!form.content){setMessage('Slug, title, and content are required');return;}
    setSaving(true);
    try{
      const endpoint=editing==='new'?'/api/admin/blog/create':'/api/admin/blog/update';
      const body=editing==='new'?form:{...form,id:editing};
      const d=await post(endpoint,body);
      if(d.success){setMessage(t.admin.blog.saved);loadPosts();setTimeout(()=>{cancel();setMessage('');},1000);}
      else setMessage(d.error||'Error saving');
    }catch{setMessage('Error saving');}
    setSaving(false);
  };

  const del=async(id)=>{
    if(!confirm(t.admin.blog.confirmDelete))return;
    const d=await post('/api/admin/blog/delete',{id});
    if(d.success){setMessage(t.admin.blog.deleted);loadPosts();if(editing===id)cancel();setTimeout(()=>setMessage(''),2000);}
  };

  const startTranslate=async(p)=>{
    setTranslatingPost(p.id);
    setMessage('Loading translations...');
    try{
      const d=await get(`/api/admin/blog/translations?postId=${p.id}`);
      const init={};
      ['es','ja','zh','bn','fr','ar','ru'].forEach(l=>{
        const existing=d.translations?.find(t=>t.lang===l);
        init[l]={title:existing?.title||p.title,excerpt:existing?.excerpt||p.excerpt||'',content:existing?.content||p.content||''};
      });
      setTransForm(init);
      setMessage('');
    }catch{
      const init={};
      ['es','ja','zh','bn','fr','ar','ru'].forEach(l=>{init[l]={title:p.title,excerpt:p.excerpt||'',content:p.content||''};});
      setTransForm(init);
      setMessage('');
    }
  };

  const updateTrans=(lang,field,val)=>{
    setTransForm(f=>({...f,[lang]:{...f[lang],[field]:val}}));
  };

  const saveTranslation=async(lang)=>{
    setSaving(true);
    try{
      const d=await post('/api/admin/blog/save-translation',{id:translatingPost,lang,title:transForm[lang].title,excerpt:transForm[lang].excerpt,content:transForm[lang].content});
      if(d.success){setMessage(`Saved ${lang.toUpperCase()} translation`);loadPosts();setTimeout(()=>setMessage(''),2000);}
      else setMessage(d.error||'Error saving');
    }catch{setMessage('Error saving');}
    setSaving(false);
  };

  if(editing)return(
    <div className="admin-section">
      <h3>{editing==='new'?t.admin.blog.newPost:t.admin.blog.editPost}</h3>
      {message&&<p style={{color:message.includes('required')?'#ef4444':'#22c55e',margin:'.5rem 0'}}>{message}</p>}
      <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
        <div><label style={{fontSize:'.82rem',color:'#9ca3af'}}>{t.admin.blog.slug}</label><input value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder={t.admin.blog.slugHelp} style={{width:'100%',padding:'8px 12px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:'.9rem',boxSizing:'border-box'}}/></div>
        <div><label style={{fontSize:'.82rem',color:'#9ca3af'}}>{t.admin.blog.postTitle}</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={{width:'100%',padding:'8px 12px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:'.9rem',boxSizing:'border-box'}}/></div>
        <div><label style={{fontSize:'.82rem',color:'#9ca3af'}}>{t.admin.blog.excerpt}</label><input value={form.excerpt} onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))} placeholder={t.admin.blog.excerptHelp} style={{width:'100%',padding:'8px 12px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:'.9rem',boxSizing:'border-box'}}/></div>
        <div><label style={{fontSize:'.82rem',color:'#9ca3af'}}>{t.admin.blog.content} <span style={{fontSize:'.72rem'}}>({t.admin.blog.contentHelp})</span></label><RichEditor value={form.content} onChange={val=>setForm(f=>({...f,content:val}))}/></div>
        <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
          <div><label style={{fontSize:'.82rem',color:'#9ca3af'}}>{t.admin.blog.status}</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{padding:'8px 12px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:'.9rem'}}><option value="draft">{t.admin.blog.draft}</option><option value="published">{t.admin.blog.published}</option></select></div>
          <div><label style={{fontSize:'.82rem',color:'#9ca3af'}}>{t.admin.blog.language}</label><select value={form.lang} onChange={e=>setForm(f=>({...f,lang:e.target.value}))} style={{padding:'8px 12px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:'.9rem'}}>{['en','es','ja','zh','bn','fr','ar','ru'].map(l=><option key={l} value={l}>{l.toUpperCase()}</option>)}</select></div>
        </div>
        <div style={{display:'flex',gap:'.5rem'}}>
          <button onClick={save} disabled={saving} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#6366f1',color:'white',fontWeight:700,cursor:'pointer',fontSize:'.9rem'}}>{saving?'...':t.admin.blog.save}</button>
          <button onClick={cancel} style={{padding:'10px 20px',borderRadius:8,border:'1px solid #475569',background:'transparent',color:'#9ca3af',cursor:'pointer',fontSize:'.9rem'}}>{t.admin.blog.cancel}</button>
          {editing!=='new'&&<button onClick={()=>del(editing)} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#dc2626',color:'white',cursor:'pointer',fontSize:'.9rem',marginLeft:'auto'}}>{t.admin.blog.delete}</button>}
        </div>
      </div>
    </div>
  );

  return(
    <div className="admin-section">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h3>{t.admin.blog.title}</h3>
        <button onClick={startNew} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'#6366f1',color:'white',fontWeight:700,cursor:'pointer',fontSize:'.85rem'}}>{t.admin.blog.newPost}</button>
      </div>
      {message&&<p style={{color:'#22c55e',margin:'.5rem 0'}}>{message}</p>}
      {loading?<p style={{color:'#9ca3af'}}>{t.admin.analytics.loading}</p>:posts.length===0?<p style={{color:'#9ca3af',textAlign:'center'}}>{t.admin.blog.noPosts}</p>:(
        <div style={{overflowX:'auto'}}>
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Translations</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {posts.map(p=>(
                <tr key={p.id}>
                  <td style={{fontWeight:600,maxWidth:250,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</td>
                  <td style={{color:'#9ca3af',fontSize:'.82rem'}}>{p.slug}</td>
                  <td><span style={{padding:'2px 8px',borderRadius:8,fontSize:'.72rem',fontWeight:700,background:p.status==='published'?'#22c55e':'#f59e0b',color:'white'}}>{p.status}</span></td>
                  <td style={{fontSize:'.82rem'}}>{p.translation_count>0?<span style={{color:'#22c55e'}}>{p.translation_count}/7</span>:<span style={{color:'#9ca3af'}}>0/7</span>}</td>
                  <td style={{fontSize:'.82rem',color:'#9ca3af'}}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td><button onClick={()=>startEdit(p)} style={{padding:'4px 12px',borderRadius:6,border:'none',background:'#334155',color:'white',cursor:'pointer',fontSize:'.78rem'}}>{t.admin.blog.editPost}</button>{' '}<button onClick={()=>startTranslate(p)} style={{padding:'4px 12px',borderRadius:6,border:'none',background:'#7c3aed',color:'white',cursor:'pointer',fontSize:'.78rem'}}>Translate</button></td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}
      {translatingPost&&(
        <div style={{marginTop:'1rem',padding:'1rem',background:'#1e293b',borderRadius:8,border:'1px solid #334155'}}>
          <h4 style={{margin:'0 0 .75rem',color:'white',fontSize:'.95rem'}}>Manual Translation</h4>
          <p style={{margin:'0 0 .75rem',color:'#9ca3af',fontSize:'.82rem'}}>Enter the translated title, excerpt, and content for each language. You can paste formatted text directly — links and formatting will be preserved.</p>
          <div style={{display:'flex',gap:'.75rem',flexWrap:'wrap'}}>
            {['es','ja','zh','bn','fr','ar','ru'].map(lang=>(
              <div key={lang} style={{flex:'1 1 350px',padding:'.75rem',background:'#0f172a',borderRadius:6}}>
                <div style={{fontWeight:700,marginBottom:'.5rem',color:'#6366f1',fontSize:'.85rem'}}>{lang.toUpperCase()}</div>
                <div style={{marginBottom:'.5rem'}}><input value={transForm[lang]?.title||''} onChange={e=>updateTrans(lang,'title',e.target.value)} placeholder="Translated title" style={{width:'100%',padding:'6px 10px',borderRadius:4,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:'.82rem',boxSizing:'border-box'}}/></div>
                <div style={{marginBottom:'.5rem'}}><input value={transForm[lang]?.excerpt||''} onChange={e=>updateTrans(lang,'excerpt',e.target.value)} placeholder="Translated excerpt" style={{width:'100%',padding:'6px 10px',borderRadius:4,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:'.82rem',boxSizing:'border-box'}}/></div>
                <div style={{marginBottom:'.5rem'}}><RichEditor value={transForm[lang]?.content||''} onChange={val=>updateTrans(lang,'content',val)}/></div>
                <button onClick={()=>saveTranslation(lang)} disabled={saving||!transForm[lang]?.title} style={{padding:'4px 12px',borderRadius:4,border:'none',background:'#6366f1',color:'white',cursor:'pointer',fontSize:'.78rem',opacity:saving||!transForm[lang]?.title?.5:1}}>Save {lang.toUpperCase()}</button>
              </div>
            ))}
          </div>
          <button onClick={()=>setTranslatingPost(null)} style={{marginTop:'.75rem',padding:'6px 16px',borderRadius:6,border:'none',background:'#334155',color:'white',cursor:'pointer',fontSize:'.82rem'}}>Close</button>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({user,onBack,t}){
  const[tab,setTab]=useState('analytics');
  const[stats,setStats]=useState(null);
  const[reports,setReports]=useState([]);
  const[reportFilter,setReportFilter]=useState('pending');
  const[loading,setLoading]=useState(false);

  const post=(path,body)=>authFetch(`${API_URL}${path}`,{method:'POST',body:JSON.stringify(body||{})}).then(r=>r.json());
  const get=(path)=>authFetch(`${API_URL}${path}`).then(r=>r.json());

  const renderAnalytics = (stats, maxSessions) => {
    if (!stats) return null;
    try {
    return (
      <div>
        <div className="kpi-grid">
          <div className="kpi-card"><div className="kpi-val">{stats.total_users?.toLocaleString()}</div><div className="kpi-lbl">{t.admin.analytics.totalUsers}</div><div className="kpi-sub">+{stats.new_users_today} {t.admin.analytics.today}</div></div>
          <div className="kpi-card"><div className="kpi-val">{stats.dau?.toLocaleString()}</div><div className="kpi-lbl">{t.admin.analytics.dau}</div></div>
          <div className="kpi-card"><div className="kpi-val">{stats.mau?.toLocaleString()}</div><div className="kpi-lbl">{t.admin.analytics.mau}</div></div>
          <div className="kpi-card"><div className="kpi-val">{stats.total_sessions?.toLocaleString()}</div><div className="kpi-lbl">{t.admin.analytics.completedCalls}</div></div>
          <div className="kpi-card"><div className="kpi-val" style={{color:'#22c55e'}}>{stats.active_sessions}</div><div className="kpi-lbl">{t.admin.analytics.liveCalls}</div></div>
          <div className="kpi-card"><div className="kpi-val" style={{color:'#f59e0b'}}>{stats.queue_size}</div><div className="kpi-lbl">{t.admin.analytics.inQueue}</div></div>
          <div className="kpi-card"><div className="kpi-val" style={{color:'#ef4444'}}>{stats.pending_reports}</div><div className="kpi-lbl">{t.admin.analytics.pendingReports}</div></div>
        </div>
        {stats.connection_stats&&(function(){
            const cs=stats.connection_stats;
            const total=cs.total_sessions||0;
            const connected=cs.connected||0;
            const connectRate=total?Math.round((connected/total)*100):0;
            const avgConnect=cs.avg_time_to_connect||0;
            return (
              <div>
                <div className="kpi-grid" style={{marginTop:'.75rem'}}>
                  <div className="kpi-card"><div className="kpi-val" style={{color:connectRate>50?'#22c55e':'#ef4444'}}>{connectRate}%</div><div className="kpi-lbl">{t.admin.analytics.connectRate}</div></div>
                  <div className="kpi-card"><div className="kpi-val">{avgConnect?Math.round(avgConnect)+'s':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.avgConnectTime}</div></div>
                  <div className="kpi-card"><div className="kpi-val" style={{color:'#ef4444'}}>{cs.network_disconnects||0}</div><div className="kpi-lbl">{t.admin.analytics.networkDisconnects}</div></div>
                  <div className="kpi-card"><div className="kpi-val" style={{color:'#6b7280'}}>{cs.intentional_ends||0}</div><div className="kpi-lbl">{t.admin.analytics.intentionalEnd}</div></div>
                  <div className="kpi-card"><div className="kpi-val">{cs.connection_issues||0}</div><div className="kpi-lbl">{t.admin.analytics.connectionIssues}</div></div>
                </div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.disconnectReasons}</h3>
                  <div className="chart-row" style={{height:'120px'}}>
                    <div className="chart-bar" style={{height:`${(cs.network_disconnects||0)/Math.max(total,1)*100}%`,background:'#ef4444'}} title={`Network: ${cs.network_disconnects||0}`}/>
                    <div className="chart-bar" style={{height:`${(cs.intentional_ends||0)/Math.max(total,1)*100}%`,background:'#6b7280'}} title={`Intentional End Call: ${cs.intentional_ends||0}`}/>
                    <div className="chart-bar" style={{height:`${(cs.connection_issues||0)/Math.max(total,1)*100}%`,background:'#f59e0b'}} title={`Connection Issues: ${cs.connection_issues||0}`}/>
                    <div className="chart-bar" style={{height:`${(cs.timeouts||0)/Math.max(total,1)*100}%`,background:'#3b82f6'}} title={`Timeout: ${cs.timeouts||0}`}/>
                  </div>
                  <div className="chart-labels" style={{marginTop:'.5rem'}}>
                    <div className="chart-lbl" style={{color:'#ef4444'}}>{t.admin.analytics.network}</div>
                    <div className="chart-lbl" style={{color:'#6b7280'}}>{t.admin.analytics.intentionalEndChart}</div>
                    <div className="chart-lbl" style={{color:'#f59e0b'}}>{t.admin.analytics.connectionIssuesChart}</div>
                    <div className="chart-lbl" style={{color:'#3b82f6'}}>{t.admin.analytics.timeout}</div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.session_stats&&(function(){
            const ss=stats.session_stats;
            const completed=ss.completed_sessions||0;
            const good=(ss.good_ratings||0)+(ss.good_ratings_2||0);
            const meh=(ss.meh_ratings||0)+(ss.meh_ratings_2||0);
            const issues=(ss.connection_issue_ratings||0)+(ss.connection_issue_ratings_2||0);
            const totalRatings=good+meh+issues;
            const completedFull=(ss.completed_full||0)+(ss.completed_full_beginner||0)+(ss.completed_full_other||0);
            const completionRate=completed?Math.round((completedFull/completed)*100):0;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.sessionQuality}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{ss.avg_duration?Math.round(ss.avg_duration/60)+'m': 'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.avgDuration}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{ss.max_duration?Math.round(ss.max_duration/60)+'m':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.maxDuration}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:completionRate>70?'#22c55e':'#ef4444'}}>{completionRate}%</div><div className="kpi-lbl">{t.admin.analytics.fullCompletion}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{good}</div><div className="kpi-lbl" style={{color:'#10b981' }}>{t.admin.analytics.good}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{meh}</div><div className="kpi-lbl" style={{color:'#6b7280'}}>{t.admin.analytics.meh}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{issues}</div><div className="kpi-lbl" style={{color:'#f59e0b'}}>{t.admin.analytics.issues}</div></div>
                  </div>
                  <div className="chart-row" style={{height:'100px'}}>
                    <div className="chart-bar" style={{height:`${totalRatings?Math.round((good/totalRatings)*100):0}%`,background:'#10b981'}} title={`Good: ${good}`}/>
                    <div className="chart-bar" style={{height:`${totalRatings?Math.round((meh/totalRatings)*100):0}%`,background:'#6b7280'}} title={`Meh: ${meh}`}/>
                    <div className="chart-bar" style={{height:`${totalRatings?Math.round((issues/totalRatings)*100):0}%`,background:'#f59e0b'}} title={`Issues: ${issues}`}/>
                  </div>
                  <div className="chart-labels" style={{marginTop:'.5rem'}}>
                    <div className="chart-lbl" style={{color:'#10b981'}}>{t.admin.analytics.goodChart}</div>
                    <div className="chart-lbl" style={{color:'#6b7280'}}>{t.admin.analytics.mehChart}</div>
                    <div className="chart-lbl" style={{color:'#f59e0b'}}>{t.admin.analytics.issuesChart}</div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.queue_stats&&(function(){
            const qs=stats.queue_stats;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.queueWait}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{qs.avg_wait?Math.round(qs.avg_wait)+'s':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.avgWait}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{qs.min_wait?Math.round(qs.min_wait)+'s':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.minWait}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{qs.max_wait?Math.round(qs.max_wait)+'s':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.maxWait}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.cross_border_stats&&(function(){
            const cb=stats.cross_border_stats;
            const total=cb.total_matches||0;
            const cross=cb.cross_border||0;
            const rate=total?Math.round((cross/total)*100):0;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.crossBorder}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{total}</div><div className="kpi-lbl">{t.admin.analytics.totalMatches}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{cross}</div><div className="kpi-lbl">{t.admin.analytics.crossBorder}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:rate>50?'#22c55e':'#ef4444'}}>{rate}%</div><div className="kpi-lbl">{t.admin.analytics.crossBorderRate}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.browser_stats&&stats.browser_stats.length>0&&(function(){
            const bs=stats.browser_stats;
            const totalFailures=stats.browser_stats.reduce((sum,b)=>sum+(b.failures||0),0);
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.webrtcFailures}</h3>
                  <div className="chart-row" style={{height:'100px'}}>
                    {stats.browser_stats.map((b,i)=>(
                      <div key={i} className="chart-bar" style={{height:`${(b.failures||0)/Math.max(totalFailures,1)*100}%`,background:['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][i%5]}} title={`${b.browser}: ${b.failures||0} failures`}/>
                    ))}
                  </div>
                  <div className="chart-labels" style={{marginTop:'.5rem'}}>
                    {stats.browser_stats.map((b,i)=><div key={i} className="chart-lbl" style={{color:['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][i%5]}}>{b.browser} ({(b.failures||0)/Math.max(totalFailures,1)*100}%)</div>)}
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.rematch_stats&&(function(){
            const rs=stats.rematch_stats;
            const rate=rs.rematches>0?Math.round((rs.rematches/stats.session_stats?.completed_sessions)*100):0;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.reMatchRate}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{rs.rematches||0}</div><div className="kpi-lbl">{t.admin.analytics.reMatches}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{rate}%</div><div className="kpi-lbl">{t.admin.analytics.reMatchRateStat}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.queue_depth_stats&&stats.queue_depth_stats.results&&(function(){
            const qd=stats.queue_depth_stats;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.queueDepth}</h3>
                  <div className="chart-row" style={{height:'120px'}}>
                    {qd.results.map((d,i)=>(
                      <div key={i} className="chart-bar" style={{height:`${(d.queue_size||0)/Math.max(...qd.results.map(x=>x.queue_size||0),1)*100}%`,background:'#3b82f6'}} title={`${d.day}: ${d.queue_size||0}`}/>
                    ))}
                  </div>
                  <div className="chart-labels" style={{marginTop:'.5rem'}}>
                    {qd.results.filter((_,i)=>i%5===0).map((d,i)=><div key={i} className="chart-lbl" style={{flex:5}}>{d.day?.slice(5)}</div>)}
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.fp_rp_stats&&(function(){
            const fr=stats.fp_rp_stats;
            const totalUsers=fr.active_users||1;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.economy}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val" style={{color:'#10b981'}}>{stats.fp_rp_stats.fp_earned||0}</div><div className="kpi-lbl">{t.admin.analytics.fpEarned}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:'#ef4444'}}>{stats.fp_rp_stats.fp_spent||0}</div><div className="kpi-lbl">{t.admin.analytics.fpSpent}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:'#f59e0b'}}>{stats.fp_rp_stats.rp_earned||0}</div><div className="kpi-lbl">{t.admin.analytics.rpEarned}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{(stats.fp_rp_stats.fp_earned||0)/Math.max(stats.fp_rp_stats.active_users||1,1).toFixed(2)}</div><div className="kpi-lbl">{t.admin.analytics.fpUser}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{(stats.fp_rp_stats.rp_earned||0)/Math.max(stats.fp_rp_stats.active_users||1,1).toFixed(2)}</div><div className="kpi-lbl">{t.admin.analytics.rpUser}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.retention_stats&&(function(){
            const rt=stats.retention_stats;
            const total=rt.total_users||1;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.retention}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{rt.total_users||0}</div><div className="kpi-lbl">{t.admin.analytics.totalUsers}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:rt.d1_users/total>0.4?'#22c55e':'#ef4444'}}>{Math.round((rt.d1_users||0)/total*100)}%</div><div className="kpi-lbl">{t.admin.analytics.day1Retention}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:rt.d7_users/total>0.2?'#22c55e':'#ef4444'}}>{Math.round((rt.d7_users||0)/total*100)}%</div><div className="kpi-lbl">{t.admin.analytics.day7Retention}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:rt.d30_users/total>0.1?'#22c55e':'#ef4444'}}>{Math.round((rt.d30_users||0)/total*100)}%</div><div className="kpi-lbl">{t.admin.analytics.day30Retention}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.report_stats&&(function(){
            const rs=stats.report_stats;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.reportsPer1000}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{stats.report_stats.total_reports||0}</div><div className="kpi-lbl">{t.admin.analytics.totalReports}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:stats.report_stats.reports_per_1000>10?'#ef4444':stats.report_stats.reports_per_1000>5?'#f59e0b':'#22c55e'}}>{stats.report_stats.reports_per_1000?stats.report_stats.reports_per_1000.toFixed(1):'0'}</div><div className="kpi-lbl">{t.admin.analytics.per1000Sessions}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.sessions_by_day&&stats.sessions_by_day.length>0&&(
        <div className="admin-section">
          <h3>{t.admin.analytics.sessionsLast30}</h3>
          <div className="chart-row">
            {[...stats.sessions_by_day].reverse().map((r,i)=>(
              <div key={i} className="chart-bar" style={{height:`${(r.c/maxSessions)*100}%`}} title={`${r.day}: ${r.c} sessions`}/>
            ))}
          </div>
          <div className="chart-labels">
            {[...stats.sessions_by_day].reverse().filter((_,i)=>i%5===0).map((r,i)=>(
              <div key={i} className="chart-lbl" style={{flex:5}}>{r.day?.slice(5)}</div>
            ))}
          </div>
        </div>
        )}
      </div>
    );
    } catch(e) { console.error('renderAnalytics error:', e); return <div style={{padding:'1rem',color:'#ef4444'}}>{t.admin.analytics.errorLoading}</div>; }
  };

  useEffect(()=>{
    if(tab==='analytics'){
      setLoading(true);
      post('/api/admin/stats',{}).then(d=>{setStats(d);setLoading(false);}).catch(()=>setLoading(false));
    }
  },[tab]);

  const loadReports=async()=>{
    setLoading(true);
    const d=await post('/api/admin/reports',{status:reportFilter});
    setReports(d.reports||[]);setLoading(false);
  };

  useEffect(()=>{if(tab==='reports')loadReports();},[tab,reportFilter]);

  const doReportAction=async(rid,action,note='')=>{
    await post(`/api/admin/report/${rid}/action`,{action,note});
    loadReports();
  };

const maxSessions=stats?.sessions_by_day?.length?Math.max(...stats.sessions_by_day.map(r=>r.c),1):1;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>{t.admin.title}</h1>
        <span className="admin-badge">{t.admin.badge}</span>
        <button className="header-btn btn-logout" onClick={onBack}>{t.admin.back}</button>
      </div>
      <div className="admin-tabs">
        {['analytics','users','blog','referrals','reports','settings','health'].map(tabName=>(
          <button key={tabName} className={`admin-tab ${tab===tabName?'active':''}`} style={{textTransform:'capitalize'}} onClick={()=>setTab(tabName)}>{t.admin.tabs[tabName]}</button>
        ))}
      </div>
      {tab==='analytics' && renderAnalytics(stats, maxSessions)}
{tab==='users'&&(<UsersTab user={user} post={post} t={t}/>)} 
      {tab==='blog'&&(<BlogTab post={post} t={t}/>)} 
      {tab==='reports'&&(
        <>
          <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
            {['pending','reviewed','actioned'].map(s=>(
              <button key={s} className={`admin-tab ${reportFilter===s?'active':''}`} style={{textTransform:'capitalize',padding:'6px 14px'}} onClick={()=>setReportFilter(s)}>{s}</button>
            ))}
          </div>
          {loading?<p style={{color:'#9ca3af'}}>{t.admin.analytics.loading}</p>:reports.length===0?<p style={{color:'#9ca3af',textAlign:'center'}}>{t.admin.analytics.noReports.replace('{filter}',reportFilter)}</p>:(
            <div className="admin-section">
              <h3>{reports.length} {reportFilter} {t.admin.analytics.reports}</h3>
              <div style={{overflowX:'auto'}}>
                <table className="admin-table">
                  <thead><tr><th>{t.admin.analytics.reporter}</th><th>{t.admin.analytics.reported}</th><th>{t.admin.analytics.reason}</th><th>{t.admin.analytics.date}</th><th>{t.admin.analytics.status}</th><th>{t.admin.analytics.actions}</th></tr></thead>
                  <tbody>
                    {reports.map(r=>(
                      <tr key={r.id}>
                        <td>{r.reporter_name}</td>
                        <td><strong>{r.reported_name}</strong><br/><span style={{fontSize:'.75rem',color:'#94a3b8'}}>{r.reported_email}</span></td>
                        <td style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.reason}</td>
                        <td style={{fontSize:'.78rem',color:'#94a3b8'}}>{r.created_at?.slice(0,10)}</td>
                        <td><span className={`badge-pill ${r.status}`}>{r.status}</span></td>
                        <td>
                          {r.status==='pending'&&(
                            <div className="action-row">
                              <button className="act-btn dismiss" onClick={()=>doReportAction(r.id,'dismiss','Reviewed — no action needed')}>{t.admin.analytics.dismiss}</button>
                              <button className="act-btn action" onClick={()=>doReportAction(r.id,'action','User warned')}>{t.admin.analytics.actionBtn}</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      {tab==='settings'&&(
        <AdminSettingsPanel user={user} t={t}/>
      )}
      {tab==='referrals'&&(
        <ReferralsTab post={post} t={t}/>
      )}
      {tab==='health'&&(
        <HealthTab stats={stats} user={user} post={post} t={t}/>
      )}
    </div>
  );
}

function ReferralsTab({post,t}){
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    post('/api/admin/referrals',{}).then(d=>{if(d.success)setData(d);}).catch(e=>console.error('[admin-referrals]',e)).finally(()=>setLoading(false));
  },[]);
  if(loading)return<p style={{color:'#9ca3af',padding:'1rem'}}>{t.admin.referrals.loading}</p>;
  if(!data)return<p style={{color:'#9ca3af',padding:'1rem'}}>{t.admin.referrals.failed}</p>;
  return(
    <div className="admin-section">
      <h3>{t.admin.referrals.overview}</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginBottom:'1.5rem'}}>
        <div className="kpi-card"><div className="kpi-val">{data.total_referrals}</div><div className="kpi-lbl">{t.admin.referrals.totalReferrals}</div></div>
        <div className="kpi-card"><div className="kpi-val" style={{color:'#4f46e5'}}>{data.total_rp_given} RP</div><div className="kpi-lbl">{t.admin.referrals.totalRP}</div></div>
      </div>
      <h3>{t.admin.referrals.recentRewards}</h3>
      {data.transactions.length===0?<p style={{color:'#9ca3af'}}>{t.admin.referrals.noRewards}</p>:(
        <div style={{overflowX:'auto'}}>
          <table className="admin-table">
            <thead><tr><th>{t.admin.referrals.referredBy}</th><th>{t.admin.referrals.newUser}</th><th>{t.admin.referrals.date}</th></tr></thead>
            <tbody>
              {data.transactions.map(t=>(
                <tr key={t.id}>
                  <td>{t.referrer_nickname||t.referrer_name||t.referrer_email}</td>
                  <td>{t.invitee_nickname||t.invitee_name||t.invitee_email}</td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsersTab({user,post,t}){
  const[users,setUsers]=useState([]);
  const[page,setPage]=useState(0);
  const[loading,setLoading]=useState(true);
  const[total,setTotal]=useState(0);
  const[searchQ,setSearchQ]=useState('');
  const[searchMode,setSearchMode]=useState(false);
  const[showForm,setShowForm]=useState(false);
  const[editingUser,setEditingUser]=useState(null);
  const[form,setForm]=useState({username:'',email:'',english_level:'beginner',country:'',native_language:''});
  const[formError,setFormError]=useState('');
  const[formSaving,setFormSaving]=useState(false);
  const[selectedUser,setSelectedUser]=useState(null);
  const[adjustFP,setAdjustFP]=useState('');
  const[adjustRP,setAdjustRP]=useState('');
  const[banReason,setBanReason]=useState('');
  const[statuses,setStatuses]=useState({});
  const PAGE=50;

  const load=async(p=0)=>{
    setLoading(true);
    const d=await post('/api/admin/users/all',{offset:p*PAGE,limit:PAGE});
    if(d.success){setUsers(d.users||[]);setTotal(d.total||0);}
    setLoading(false);
  };

  const fetchStatuses=async()=>{
    const ids=users.map(u=>u.id);
    if(!ids.length)return;
    const d=await post('/api/admin/users/status',{user_ids:ids});
    if(d.success)setStatuses(d.statuses||{});
  };

  useEffect(()=>{if(!searchMode)load(page);},[page,searchMode]);
  useEffect(()=>{if(users.length>0)fetchStatuses();},[users]);
  useEffect(()=>{
    if(!users.length)return;
    const iv=setInterval(fetchStatuses,10000);
    return()=>clearInterval(iv);
  },[users.map(u=>u.id).join(',')]);

  const searchUsers=async()=>{
    if(!searchQ.trim()){clearSearch();return;}
    setLoading(true);setSearchMode(true);
    const d=await post('/api/admin/users',{query:searchQ});
    setUsers(d.users||[]);setTotal(d.users?.length||0);setLoading(false);
  };

  const clearSearch=()=>{setSearchQ('');setSearchMode(false);setPage(0);};

  const exportCSV=async()=>{
    const d=await post('/api/admin/users/export',{});
    if(!d.csv)return;
    const blob=new Blob([d.csv],{type:'text/csv'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='chatter3_users_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
  };

  const openAdd=()=>{setEditingUser(null);setForm({username:'',email:'',english_level:'beginner',country:'',native_language:''});setFormError('');setShowForm(true);};
  const openEdit=(u)=>{setEditingUser(u);setForm({username:u.username,email:u.email,english_level:u.english_level||'beginner',country:u.country||'',native_language:u.native_language||'',nickname:u.nickname||''});setFormError('');setShowForm(true);};

  const saveUser=async()=>{
    setFormSaving(true);setFormError('');
    try{
      if(editingUser){
        const d=await post('/api/admin/user/'+editingUser.id+'/update',form);
        if(d.error){setFormError(d.error);setFormSaving(false);return;}
        if(d.success)setUsers(prev=>prev.map(u=>u.id===editingUser.id?d.user:u));
      }else{
        const d=await post('/api/admin/user/create',form);
        if(d.error){setFormError(d.error);setFormSaving(false);return;}
        if(d.success){setUsers(prev=>[d.user,...prev]);setTotal(t=>t+1);}
      }
      setShowForm(false);
    }catch(e){setFormError(t.admin.users.requestFailed);}
    setFormSaving(false);
  };

  const deleteUser=async(u)=>{
    if(!confirm(t.admin.users.deleteConfirm.replace('{username}',u.username)))return;
    try{
      const d=await post('/api/admin/user/'+u.id+'/delete');
      if(d.error){alert(d.error);return;}
      if(d.success){setUsers(prev=>prev.filter(x=>x.id!==u.id));setTotal(t=>t-1);}
    }catch(e){alert(t.admin.users.deleteFailed+e.message);}
  };

  const loadUserDetail=async(uid)=>{
      const d=await post('/api/admin/user/'+uid,{});
    setSelectedUser(d);
  };

  const doAdjust=async(uid)=>{
    await post('/api/admin/user/'+uid+'/adjust',{fp_delta:parseFloat(adjustFP)||0,rp_delta:parseFloat(adjustRP)||0});
    alert(t.admin.users.balancesUpdated);loadUserDetail(uid);setAdjustFP('');setAdjustRP('');
  };

  const doBan=async(uid)=>{
    if(!banReason.trim()){alert(t.admin.users.enterReason);return;}
    await post('/api/admin/user/'+uid+'/ban',{reason:banReason});
    alert(t.admin.users.userBanned);setBanReason('');loadUserDetail(uid);
  };

  const doUnban=async(uid)=>{
    await post('/api/admin/user/'+uid+'/unban',{});
    alert(t.admin.users.userUnbanned);loadUserDetail(uid);
  };

  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
        <p style={{margin:0,fontSize:'.88rem',color:'#64748b'}}>
          {searchMode?t.admin.users.searchResults.replace('{N}',users.length):t.admin.users.pagination.replace('{N}',total).replace('{N}',page+1).replace('{N}',Math.ceil(total/PAGE||1))}
        </p>
        <div style={{display:'flex',gap:'.5rem'}}>
          <button className="save-settings-btn" style={{margin:0,background:'#22c55e'}} onClick={openAdd}>{t.admin.users.addUser}</button>
          <button className="save-settings-btn" style={{margin:0}} onClick={exportCSV}>{t.admin.users.exportCSV}</button>
        </div>
      </div>

      <div className="search-row">
        <input className="search-input" placeholder={t.admin.users.searchPlaceholder} value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')searchUsers();if(e.key==='Escape')clearSearch();}}/>
        {searchMode?<button className="search-btn" onClick={clearSearch} style={{background:'#64748b'}}>{t.admin.users.clear}</button>:<button className="search-btn" onClick={searchUsers}>{t.admin.users.searchButton}</button>}
      </div>

      {selectedUser&&(
        <div className="admin-section" style={{marginBottom:'1rem',borderLeft:'3px solid #4f8ef7'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'.5rem'}}>
            <div>
              <h3 style={{margin:0}}>{selectedUser.user?.nickname||selectedUser.user?.username} <span style={{fontWeight:400,color:'#94a3b8',fontSize:'.82rem'}}>{selectedUser.user?.email}</span></h3>
              <div style={{display:'flex',gap:.5,flexWrap:'wrap',marginTop:'.4rem'}}>
                {selectedUser.user?.is_admin?<span className="badge-pill admin">{t.admin.users.adminBadge}</span>:null}
                {selectedUser.user?.is_banned?<span className="badge-pill banned">{t.admin.users.bannedBadge}</span>:null}
                <span style={{fontSize:'.78rem',color:'#94a3b8'}}>{selectedUser.user?.country?getFlag(selectedUser.user.country)+' '+countryName(selectedUser.user.country):'—'} · {selectedUser.user?.english_level}</span>
              </div>
            </div>
            <button onClick={()=>setSelectedUser(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:.9}}>{t.admin.users.close}</button>
          </div>
           <div className="bg-light" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.5rem',margin:'.875rem 0',borderRadius:8,padding:'.75rem'}}>
            <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#1d4ed8'}}>{selectedUser.user?.fp_balance??0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.users.fp}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#15803d'}}>{(selectedUser.user?.rp_balance||0).toFixed(1)}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.users.rp}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem'}}>{selectedUser.sessions?.length||0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.users.sessions}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#ef4444'}}>{selectedUser.reports_received||0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.users.reports}</div></div>
          </div>
           <p style={{margin:'0 0 .5rem',fontSize:'.82rem',fontWeight:600}}>{t.admin.users.adjustBalances}</p>
          <div className="inline-form">
            <input placeholder={t.admin.users.fpDelta} value={adjustFP} onChange={e=>setAdjustFP(e.target.value)}/>
            <input placeholder={t.admin.users.rpDelta} value={adjustRP} onChange={e=>setAdjustRP(e.target.value)}/>
            <button onClick={()=>doAdjust(selectedUser.user?.id)}>{t.admin.users.apply}</button>
          </div>
          {!selectedUser.user?.is_banned?(
            <>
               <p style={{margin:'.875rem 0 .4rem',fontSize:'.82rem',fontWeight:600}}>{t.admin.users.banUser}</p>
              <div className="inline-form">
                <input placeholder={t.admin.users.banReason} value={banReason} onChange={e=>setBanReason(e.target.value)} style={{flex:2}}/>
                <button style={{background:'#ef4444'}} onClick={()=>doBan(selectedUser.user?.id)}>{t.admin.users.banButton}</button>
              </div>
            </>
          ):(
            <button className="act-btn unban" style={{marginTop:'.75rem'}} onClick={()=>doUnban(selectedUser.user?.id)}>{t.admin.users.unbanButton}</button>
          )}
        </div>
      )}

      {showForm&&(
        <div className="panel-white">
          <h4 style={{margin:'0 0 12px',fontSize:'.95rem'}}>{editingUser?t.admin.users.editUser:t.admin.users.addUserTitle}</h4>
          {formError&&<p style={{color:'#ef4444',fontSize:'.82rem',margin:'0 0 8px'}}>{formError}</p>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.usernameRequired}</label><input value={form.username} onChange={upd('username')} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}/></div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.displayName}</label><input value={form.nickname||''} onChange={upd('nickname')} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}/></div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.emailRequired}</label><input value={form.email} onChange={upd('email')} type="email" style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}/></div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.level}</label>
              <select value={form.english_level} onChange={upd('english_level')} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.country}</label><CountrySelect value={form.country} onChange={v=>setForm(f=>({...f,country:v}))}/></div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.nativeLanguage}</label><input value={form.native_language} onChange={upd('native_language')} placeholder={t.admin.users.nativeLanguagePlaceholder} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}/></div>
          </div>
          <div style={{display:'flex',gap:'.5rem',marginTop:12}}>
            <button onClick={()=>setShowForm(false)} className="btn-subtle" style={{padding:'8px 16px',fontSize:'.88rem'}}>{t.admin.users.cancel}</button>
            <button onClick={saveUser} disabled={formSaving||!form.username||!form.email} style={{padding:'8px 16px',background:form.username&&form.email?'#4f8ef7':'#ccc',color:'white',border:'none',borderRadius:6,cursor:form.username&&form.email?'pointer':'not-allowed',fontWeight:600,fontSize:'.88rem'}}>{formSaving?t.admin.users.saving:editingUser?t.admin.users.update:t.admin.users.create}</button>
          </div>
        </div>
      )}

      {loading?<p style={{color:'#9ca3af'}}>{searchMode?t.admin.users.searching:t.admin.users.loading}</p>:users.length===0?(
        <p style={{color:'#9ca3af',textAlign:'center'}}>{searchMode?t.admin.users.noResults:t.admin.users.noUsers}</p>
      ):(
        <div className="admin-section">
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead><tr><th>#</th><th>{t.admin.users.usernameHeader}</th><th>{t.admin.users.displayNameHeader}</th><th>{t.admin.users.emailHeader}</th><th>{t.admin.users.countryHeader}</th><th>{t.admin.users.languageHeader}</th><th>{t.admin.users.levelHeader}</th><th>{t.admin.users.fpHeader}</th><th>{t.admin.users.rpHeader}</th><th>{t.admin.users.badgeHeader}</th><th>{t.admin.users.newHeader}</th><th>{t.admin.users.onlineHeader}</th><th>{t.admin.users.statusHeader}</th><th>{t.admin.users.joinedHeader}</th><th>{t.admin.users.actionsHeader}</th></tr></thead>
              <tbody>
                {users.map((u,i)=>(
                  <tr key={u.id}>
                    <td style={{color:'#94a3b8',fontSize:'.72rem'}}>{searchMode?i+1:page*PAGE+i+1}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.nickname||'—'}</td>
                    <td style={{fontSize:'.78rem',color:'#64748b'}}>{u.email}</td>
                    <td>{u.country?getFlag(u.country)+' '+countryName(u.country):'—'}</td>
                    <td>{u.native_language||'—'}</td>
                    <td style={{textTransform:'capitalize'}}>{u.english_level}</td>
                    <td style={{color:'#1d4ed8',fontWeight:700}}>{u.fp_balance??0}</td>
                    <td style={{color:'#15803d',fontWeight:700}}>{(u.rp_balance||0).toFixed(1)}</td>
                    <td>
                      <button
                        onClick={async()=>{
                          const d=await post('/api/admin/user/'+u.id+'/founding-member',{});
                          if(d.success!==false)setUsers(prev=>prev.map(x=>x.id===u.id?{...x,founding_member_override:d.founding_member_override}:x));
                        }}
                        style={{background:u.founding_member_override?'linear-gradient(135deg,#f59e0b,#f97316)':'#334155',color:'white',border:'none',borderRadius:10,padding:'3px 10px',fontSize:'.72rem',fontWeight:700,cursor:'pointer'}}
                        title={u.founding_member_override?t.admin.users.removeFM:t.admin.users.grantFM}
                      >
                        {u.founding_member_override?t.admin.users.fmBadge:t.admin.users.dash}
                      </button>
                    </td>
                    <td>{u.is_new_member&&!u.founding_member_override?<span style={{padding:'2px 8px',background:'linear-gradient(135deg,#22c55e,#10b981)',color:'white',borderRadius:8,fontSize:'.68rem',fontWeight:700}}>{t.admin.users.newBadge}</span>:'—'}</td>
                    <td style={{textAlign:'center'}}>{(()=>{
                      const s=statuses[u.id]||'offline';
                      const colors={online:'#22c55e',searching:'#3b82f6',in_call:'#f97316',offline:'#d1d5db'};
                      const labels={online:t.admin.users.onlineStatus,searching:t.admin.users.searchingStatus,in_call:t.admin.users.inCallStatus,offline:t.admin.users.offlineStatus};
                      const pulse=s!=='offline';
                      return<span title={labels[s]} style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:colors[s],...(pulse?{boxShadow:'0 0 6px '+colors[s]}:{})}}/>;
                    })()}</td>
                    <td>{u.is_banned?<span className="badge-pill banned">{t.admin.users.bannedStatus}</span>:u.is_admin?<span className="badge-pill admin">{t.admin.users.adminStatus}</span>:'—'}</td>
                    <td style={{fontSize:'.75rem',color:'#94a3b8'}}>{u.created_at?.slice(0,10)}</td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="act-btn adjust" onClick={()=>loadUserDetail(u.id)} style={{fontSize:'.7rem'}}>{t.admin.users.details}</button>
                        <button onClick={()=>openEdit(u)} style={{background:'#4f8ef7',color:'white',border:'none',borderRadius:6,padding:'3px 8px',fontSize:'.7rem',cursor:'pointer'}} title="Edit">✏️</button>
                        {!u.is_admin?<button onClick={()=>deleteUser(u)} style={{background:'#ef4444',color:'white',border:'none',borderRadius:6,padding:'3px 8px',fontSize:'.7rem',cursor:'pointer'}} title="Delete">🗑️</button>:null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!searchMode&&(
            <div style={{display:'flex',gap:'.5rem',marginTop:'.875rem',justifyContent:'center'}}>
              <button className="act-btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>{t.admin.users.prev}</button>
              <span style={{padding:'4px 12px',fontSize:'.83rem',color:'#64748b'}}>{page*PAGE+1}–{Math.min((page+1)*PAGE,total)+' '+t.admin.users.of+' '+total}</span>
              <button className="act-btn" disabled={(page+1)*PAGE>=total} onClick={()=>setPage(p=>p+1)}>{t.admin.users.next}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HealthTab({user,post,stats,t}){
  const[health,setHealth]=useState(null);
  const[usage,setUsage]=useState(null);
  useEffect(()=>{
    post('/api/admin/stats',{}).then(setHealth).catch(e=>console.error('[admin-health]',e));
    post('/api/admin/usage',{}).then(setUsage).catch(e=>console.error('[admin-usage]',e));
  },[]);

  const LIMITS={workers_req:100000,d1_reads:5000000,d1_writes:100000,do_req:1000000,d1_storage:5000,workers_cpu:10};

  const UsageBar=({label,used,limit,unit=''})=>{
    const pct=limit?Math.min(100,(used/limit)*100):0;
    const color=pct>90?'#ef4444':pct>70?'#f59e0b':'#22c55e';
    const fmt=used>=1000000?(used/1000000).toFixed(1)+'M':used>=1000?(used/1000).toFixed(1)+'K':used;
    const fmtLim=limit>=1000000?(limit/1000000).toFixed(0)+'M':limit>=1000?(limit/1000).toFixed(0)+'K':limit;
    return(
      <div style={{marginBottom:'.75rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.8rem',marginBottom:'4px'}}>
          <span style={{color:'#e2e8f0',fontWeight:600}}>{label}</span>
          <span style={{color:'#94a3b8'}}>{fmt}{unit} / {fmtLim}{unit} ({pct.toFixed(1)}%)</span>
        </div>
        <div style={{height:8,background:'#1e293b',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:4,transition:'width .3s'}}/>
        </div>
      </div>
    );
  };

  return(
    <div>
      {usage?(
        <div className="admin-section">
          <h3>{t.admin.health.infraTitle}</h3>
          <p style={{fontSize:'.78rem',color:'#94a3b8',margin:'0 0 1rem'}}>{t.admin.health.infraDesc}</p>

          <div style={{marginBottom:'1.25rem'}}>
            <h4 style={{fontSize:'.85rem',color:'#e2e8f0',margin:'0 0 .5rem'}}>{t.admin.health.today}</h4>
            <UsageBar label={t.admin.health.workerRequests} used={usage.daily?.api_requests||0} limit={LIMITS.workers_req}/>
            <UsageBar label={t.admin.health.d1RowsRead} used={usage.daily?.d1_reads||0} limit={LIMITS.d1_reads}/>
            <UsageBar label={t.admin.health.d1RowsWritten} used={usage.daily?.d1_writes||0} limit={LIMITS.d1_writes}/>
            <UsageBar label={t.admin.health.durableRequests} used={usage.daily?.do_requests||0} limit={LIMITS.do_req}/>
          </div>

          <div style={{marginBottom:'1.25rem'}}>
            <h4 style={{fontSize:'.85rem',color:'#e2e8f0',margin:'0 0 .5rem'}}>{t.admin.health.thisMonth}</h4>
            <UsageBar label={t.admin.health.workerRequests} used={usage.monthly?.api_requests||0} limit={LIMITS.workers_req*30}/>
            <UsageBar label={t.admin.health.d1RowsRead} used={usage.monthly?.d1_reads||0} limit={LIMITS.d1_reads*30}/>
            <UsageBar label={t.admin.health.d1RowsWritten} used={usage.monthly?.d1_writes||0} limit={LIMITS.d1_writes*30}/>
            <UsageBar label={t.admin.health.durableRequests} used={usage.monthly?.do_requests||0} limit={LIMITS.do_req*30}/>
          </div>

          <div>
            <h4 style={{fontSize:'.85rem',color:'#e2e8f0',margin:'0 0 .5rem'}}>{t.admin.health.storageTitle}</h4>
            <table className="admin-table">
              <tbody>
                <tr><td>{t.admin.health.estimatedD1}</td><td style={{color:'#60a5fa',fontWeight:700}}>{(usage.estimates?.total_rows||0).toLocaleString()}</td><td style={{color:'#94a3b8'}}>{t.admin.health.freeTier5M}</td></tr>
                <tr><td>{t.admin.health.totalUsers}</td><td style={{fontWeight:700}}>{(usage.estimates?.total_users||0).toLocaleString()}</td><td style={{color:'#94a3b8'}}>{t.admin.health['~1Row']}</td></tr>
                <tr><td>{t.admin.health.totalSessions}</td><td style={{fontWeight:700}}>{(usage.estimates?.total_sessions||0).toLocaleString()}</td><td style={{color:'#94a3b8'}}>{t.admin.health['~3-4Rows']}</td></tr>
                <tr><td>{t.admin.health.allTimeWrites}</td><td style={{fontWeight:700}}>{(usage.estimates?.total_d1_writes_all_time||0).toLocaleString()}</td><td style={{color:'#94a3b8'}}>{t.admin.health.limit100K}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      ):<p style={{color:'#9ca3af'}}>{t.admin.health.loadingInfra}</p>}

      <div className="admin-section" style={{marginTop:'1rem'}}>
        <h3>{t.admin.health.systemInfo}</h3>
        <table className="admin-table">
          <tbody>
            <tr><td>{t.admin.health.backend}</td><td>{t.admin.health.backendDesc}</td></tr>
            <tr><td>{t.admin.health.database}</td><td>{t.admin.health.databaseDesc}</td></tr>
            <tr><td>{t.admin.health.signaling}</td><td>{t.admin.health.signalingDesc}</td></tr>
            <tr><td>{t.admin.health.email}</td><td>{t.admin.health.emailDesc}</td></tr>
            <tr><td>{t.admin.health.pointSystem}</td><td>{t.admin.health.pointSystemDesc}</td></tr>
            <tr><td>{t.admin.health.fpPerDay}</td><td>{t.admin.health.fpPerDayDesc}</td></tr>
            <tr><td>{t.admin.health.rpPerCompletion}</td><td>{t.admin.health.rpPerCompletionDesc}</td></tr>
            <tr><td>{t.admin.health.exchangeRate}</td><td>{t.admin.health.exchangeRateDesc}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="admin-section" style={{marginTop:'1rem'}}>
        <h3>{t.admin.health.turnTitle}</h3>
        <table className="admin-table">
          <tbody>
            <tr><td>{t.admin.health.provider}</td><td style={{fontWeight:700}}>metered.ca</td><td style={{color:'#94a3b8'}}>chatter3.metered.live</td></tr>
            <tr><td>{t.admin.health.protocol}</td><td>{t.admin.health.turnProtocol}</td><td style={{color:'#94a3b8'}}>Used for WebRTC relay when P2P fails</td></tr>
            <tr><td>{t.admin.health.freeTier}</td><td>{t.admin.health.bandwidth}</td><td style={{color:'#94a3b8'}}>Exceeding → paid plan required</td></tr>
            <tr><td>{t.admin.health.fallback}</td><td>{t.admin.health.googleStun}</td><td style={{color:'#94a3b8'}}>Used if metered.ca is unreachable</td></tr>
          </tbody>
        </table>
        {usage?.relay?(()=>{
          const tRelay=usage.relay.today_relay||0;
          const tP2P=usage.relay.today_p2p||0;
          const mRelay=usage.relay.month_relay||0;
          const mP2P=usage.relay.month_p2p||0;
          const totalRelay=usage.relay.total_relay||0;
          const totalP2P=usage.relay.total_p2p||0;
          const totalAll=totalRelay+totalP2P;
          const relayPct=totalAll>0?Math.round((totalRelay/totalAll)*100):0;
          const todayAll=tRelay+tP2P;
          const todayPct=todayAll>0?Math.round((tRelay/todayAll)*100):0;
          const monthAll=mRelay+mP2P;
          const monthPct=monthAll>0?Math.round((mRelay/monthAll)*100):0;
          return(
            <div style={{marginTop:'.75rem',background:'#1e293b',borderRadius:8,padding:'12px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
                <h4 style={{margin:0,fontSize:'.85rem',fontWeight:700}}>{t.admin.health.p2pVsTurn}</h4>
                <span style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.health.p2pDesc}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'.5rem',marginBottom:'.5rem'}}>
                <div style={{textAlign:'center',padding:'8px'}}>
                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'#22c55e'}}>{todayPct}%</div>
                  <div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.health.todayRelay}</div>
                  <div style={{fontSize:'.65rem',color:'#6b7280'}}>{tRelay}/{todayAll} {t.admin.health.callsUnit}</div>
                </div>
                <div style={{textAlign:'center',padding:'8px'}}>
                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'#60a5fa'}}>{monthPct}%</div>
                  <div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.health.monthRelay}</div>
                  <div style={{fontSize:'.65rem',color:'#6b7280'}}>{mRelay}/{monthAll} {t.admin.health.callsUnit}</div>
                </div>
                <div style={{textAlign:'center',padding:'8px'}}>
                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'#a78bfa'}}>{relayPct}%</div>
                  <div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.health.allTimeRelay}</div>
                  <div style={{fontSize:'.65rem',color:'#6b7280'}}>{totalRelay}/{totalAll} {t.admin.health.callsUnit}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:'.5rem',alignItems:'center',marginTop:'.5rem'}}>
                <div style={{flex:1,height:8,background:'#334155',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:`${relayPct}%`,height:'100%',background:relayPct>50?'#f59e0b':'#22c55e',borderRadius:4,transition:'width .3s'}}/>
                </div>
                <span style={{fontSize:'.7rem',color:'#94a3b8',whiteSpace:'nowrap'}}>{100-relayPct}% P2P · {relayPct}% TURN</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem',marginTop:'.75rem',fontSize:'.72rem'}}>
                <div style={{background:'#0f172a',borderRadius:6,padding:'8px'}}>
                  <div style={{color:'#22c55e',fontWeight:600,marginBottom:2}}>{t.admin.health.p2pTitle}</div>
                  <div style={{color:'#94a3b8'}}>{t.admin.health.p2pDesc1}</div>
                  <div style={{color:'#6b7280',fontSize:'.65rem'}}>{t.admin.health.p2pDesc2}</div>
                </div>
                <div style={{background:'#0f172a',borderRadius:6,padding:'8px'}}>
                  <div style={{color:'#f59e0b',fontWeight:600,marginBottom:2}}>{t.admin.health.turnTitle2}</div>
                  <div style={{color:'#94a3b8'}}>{t.admin.health.turnDesc1}</div>
                  <div style={{color:'#6b7280',fontSize:'.65rem'}}>{t.admin.health.turnDesc2}</div>
                </div>
              </div>
            </div>
          );
        })():null}
        <p style={{fontSize:'.72rem',color:'#94a3b8',margin:'.5rem 0 0'}}>Note: Actual bandwidth depends on call duration and video quality. Monitor at <a href="https://chatter3.metered.live/dashboard" target="_blank" rel="noopener" style={{color:'#60a5fa'}}>chatter3.metered.live/dashboard</a></p>
      </div>

      {usage&&usage.sessions&&(()=>{
        const avgDur=usage.sessions.avg_duration||300;
        const avgDurMin=Math.round(avgDur/60);
        const avgDurSec=Math.round(avgDur%60);
        const mbPerMin=2.5;
        const mbPerCall=mbPerMin*(avgDur/60);
        const CF_WORKERS_DAY=100000;
        const CF_D1_WRITES_DAY=100000;
        const CF_DO_DAY=1000000;
        const METERED_MONTH_GB=50;
        const MB_PER_GB=1024;
        const apiCallsPerSession=10;
        const d1WritesPerSession=5;
        const doMsgsPerSession=100;
        const maxSessionsDay_api=Math.floor(CF_WORKERS_DAY/apiCallsPerSession);
        const maxSessionsDay_d1=Math.floor(CF_D1_WRITES_DAY/d1WritesPerSession);
        const maxSessionsDay_do=Math.floor(CF_DO_DAY/doMsgsPerSession);
        const maxCallsMonth_turn=Math.floor((METERED_MONTH_GB*MB_PER_GB)/mbPerCall);
        const maxCallsDay_turn=Math.floor(maxCallsMonth_turn/30);
        const bottleneck=Math.min(maxSessionsDay_api,maxSessionsDay_d1,maxSessionsDay_do,maxCallsDay_turn);
        const bottleneckLabel=bottleneck===maxCallsDay_turn?'TURN Bandwidth':bottleneck===maxSessionsDay_d1?'D1 Writes':bottleneck===maxSessionsDay_api?'Worker Requests':'Durable Objects';
        const todaySessions=usage.sessions.today||0;
        const monthSessions=usage.sessions.this_month||0;
        const apiPct=usage.daily?.api_requests?((usage.daily.api_requests/CF_WORKERS_DAY)*100):0;
        const d1Pct=usage.daily?.d1_writes?((usage.daily.d1_writes/CF_D1_WRITES_DAY)*100):0;
        const doPct=usage.daily?.do_requests?((usage.daily.do_requests/CF_DO_DAY)*100):0;
        const turnPct=usage.monthly?.api_requests?((todaySessions*mbPerCall/MB_PER_GB/METERED_MONTH_GB)*100*30):0;
        return(
          <div className="admin-section" style={{marginTop:'1rem'}}>
            <h3>{t.admin.health.capacityTitle}</h3>
            <p style={{fontSize:'.78rem',color:'#94a3b8',margin:'0 0 .75rem'}}>Max concurrent calls based on current free tier constraints. Current bottleneck: <strong style={{color:'#f59e0b'}}>{bottleneckLabel}</strong></p>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'.5rem',marginBottom:'1rem'}}>
              <div style={{background:'#1e293b',borderRadius:8,padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#22c55e'}}>{bottleneck.toLocaleString()}</div>
                <div style={{fontSize:'.72rem',color:'#94a3b8',marginTop:2}}>{t.admin.health.maxSessionsDay}</div>
                <div style={{fontSize:'.65rem',color:'#6b7280',marginTop:2}}>{t.admin.health.maxSessionsDayDesc}</div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#60a5fa'}}>{(bottleneck*30).toLocaleString()}</div>
                <div style={{fontSize:'.72rem',color:'#94a3b8',marginTop:2}}>{t.admin.health.maxSessionsMonth}</div>
                <div style={{fontSize:'.65rem',color:'#6b7280',marginTop:2}}>{t.admin.health.maxSessionsMonthDesc}</div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#a78bfa'}}>{Math.round(bottleneck*avgDur/3600)}</div>
                <div style={{fontSize:'.72rem',color:'#94a3b8',marginTop:2}}>{t.admin.health.avgConcurrent}</div>
                <div style={{fontSize:'.65rem',color:'#6b7280',marginTop:2}}>{t.admin.health.avgConcurrentDesc}</div>
              </div>
            </div>

            <UsageBar label={`${t.admin.health.workerRequests} (${usage.daily?.api_requests||0} today)`} used={usage.daily?.api_requests||0} limit={CF_WORKERS_DAY}/>
            <UsageBar label={`${t.admin.health.d1Writes} (${usage.daily?.d1_writes||0} today)`} used={usage.daily?.d1_writes||0} limit={CF_D1_WRITES_DAY}/>
            <UsageBar label={`${t.admin.health.durableObjs} (${usage.daily?.do_requests||0} today)`} used={usage.daily?.do_requests||0} limit={CF_DO_DAY}/>
            <UsageBar label={`${t.admin.health.turnFree} (~${Math.round((usage.relay?.today_relay||0)*mbPerCall)}MB relay today)`} used={(usage.relay?.today_relay||0)*mbPerCall} limit={METERED_MONTH_GB*MB_PER_GB/30}/>

            <table className="admin-table" style={{marginTop:'.75rem'}}>
              <tbody>
                <tr><td style={{fontWeight:600}}>{t.admin.health.avgDuration}</td><td>{avgDurMin}m {avgDurSec}s</td><td style={{color:'#94a3b8'}}>{t.admin.health.avgDurationDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.estMB}</td><td>{mbPerCall.toFixed(1)} MB</td><td style={{color:'#94a3b8'}}>{t.admin.health.estMBDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.turnFree}</td><td>{METERED_MONTH_GB} GB/month</td><td style={{color:'#94a3b8'}}>{t.admin.health.turnFreeDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.cfWorkers}</td><td>{CF_WORKERS_DAY.toLocaleString()}/day</td><td style={{color:'#94a3b8'}}>{t.admin.health.cfWorkersDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.d1Writes}</td><td>{CF_D1_WRITES_DAY.toLocaleString()}/day</td><td style={{color:'#94a3b8'}}>{t.admin.health.d1WritesDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.durableObjs}</td><td>{CF_DO_DAY.toLocaleString()}/day</td><td style={{color:'#94a3b8'}}>{t.admin.health.durableObjsDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.sessionsToday}</td><td style={{fontWeight:700,color:todaySessions>bottleneck?'#ef4444':'#22c55e'}}>{todaySessions}</td><td style={{color:'#94a3b8'}}>{bottleneck>0?((todaySessions/bottleneck)*100).toFixed(1):0}% {t.admin.health.sessionsTodayDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.sessionsMonth}</td><td style={{fontWeight:700}}>{monthSessions}</td><td style={{color:'#94a3b8'}}>{Math.round(bottleneck/30)>0?((monthSessions/(bottleneck/30*30))*100).toFixed(1):0}% {t.admin.health.sessionsMonthDesc}</td></tr>
              </tbody>
            </table>
          </div>
        );
      })()}

      <div className="admin-section" style={{marginTop:'1rem'}}>
        <h3>{t.admin.health.launchTitle}</h3>
        <table className="admin-table">
          <tbody>
            <tr><td>{t.admin.health.freeFP}</td><td>New users skip FP consumption for N days after registration (configurable in Settings)</td></tr>
            <tr><td>{t.admin.health.registrationRP}</td><td>RP granted on signup to encourage retention (configurable in Settings)</td></tr>
            <tr><td>{t.admin.health.fmBadge}</td><td>Exclusive badge shown for N days after registration (configurable in Settings)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

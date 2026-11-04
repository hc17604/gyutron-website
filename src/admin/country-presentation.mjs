import {COUNTRY_NAMES} from './country-data.mjs';

/** Display only: never canonicalizes stored values, filters, drill keys or currencies. */
export const COUNTRY_CLIENT_SOURCE = String.raw`
  const countryNames=${JSON.stringify(COUNTRY_NAMES)};
  const countryAliases=new Map();
  const normalizeCountry=value=>String(value||'').normalize('NFKC').trim().toLocaleLowerCase('en').replace(/[.]/g,'').replace(/\s+/g,' ');
  const countryDisplays={};
  for(const lang of ['en','zh']){try{countryDisplays[lang]=new Intl.DisplayNames([lang],{type:'region'});}catch(_){}}
  for(const [code,name] of Object.entries(countryNames)){countryAliases.set(normalizeCountry(code),code);countryAliases.set(normalizeCountry(name),code);for(const names of Object.values(countryDisplays)){const label=names.of(code);if(label)countryAliases.set(normalizeCountry(label),code);}}
  for(const [name,code] of Object.entries({'UK':'GB','U.K.':'GB','Great Britain':'GB','United States':'US','USA':'US','U.S.A.':'US','United States of America':'US','PRC':'CN','People\'s Republic of China':'CN','Türkiye':'TR','Turkey':'TR','Russian Federation':'RU','Republic of Korea':'KR','Viet Nam':'VN'}))countryAliases.set(normalizeCountry(name),code);
  function countryLabel(value){const raw=String(value??'').trim(),escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));if(!raw||raw==='__missing__')return '<span class="country-label country-unrecorded">—</span>';const code=countryAliases.get(normalizeCountry(raw));if(!code)return '<span class="country-label">'+escape(raw)+'</span>';const lang=state.lang==='zh'?'zh':'en',label=countryDisplays[lang]?.of(code)||countryNames[code];return '<span class="country-label" data-country-code="'+code+'" title="'+escape(raw)+'"><img class="country-flag" src="/workspace-assets/flags/'+code.toLowerCase()+'.svg" width="24" height="18" alt="" aria-hidden="true" loading="lazy" decoding="async"><span>'+escape(label)+'</span></span>';}
`;

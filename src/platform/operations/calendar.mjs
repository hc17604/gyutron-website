import {day,err} from './common.mjs';
import {shiftDay} from './analytics.mjs';
import {workspaceDate} from '../crm/time.mjs';
export function dailyTime(value){if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))throw err('INVALID_SCHEDULE','Use a daily time in HH:mm (24-hour) format.');return value;}
/** Wall-clock calendar scheduling: DST gaps advance by the gap; overlaps use the first occurrence. */
export function localScheduledInstant(date,time,timeZone){day(date);dailyTime(time);const desired=Date.parse(date+'T'+time+':00Z'),fmt=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const local=value=>{const p=Object.fromEntries(fmt.formatToParts(value).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);};
 let instant=desired;const visited=[];for(let i=0;i<8;i++){const wall=local(instant);visited.push({instant,wall});if(wall===desired){let earliest=instant;for(let delta=-120;delta<0;delta+=15){const other=instant+delta*60000;if(local(other)===desired)earliest=Math.min(earliest,other);}return new Date(earliest).toISOString();}instant+=desired-wall;}
 const forward=visited.filter(v=>v.wall>desired).sort((a,b)=>(a.wall-desired)-(b.wall-desired));if(!forward.length)throw err('INVALID_SCHEDULE','This daily time cannot be resolved in the workspace timezone.');return new Date(forward[0].instant).toISOString();
}
export function nextDailyRun(time,timeZone,after=new Date()){dailyTime(time);const now=after instanceof Date?after:new Date(after);if(!Number.isFinite(now.getTime()))throw err('INVALID_SCHEDULE','Invalid scheduling clock.');const today=workspaceDate(timeZone,now),candidate=localScheduledInstant(today,time,timeZone);return Date.parse(candidate)>now.getTime()?candidate:localScheduledInstant(shiftDay(today,1),time,timeZone);}
